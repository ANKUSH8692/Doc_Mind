from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import shutil
import uuid
import faiss
import numpy as np
import pickle
from werkzeug.utils import secure_filename
from pathlib import Path
from typing import List, Any, Dict
import warnings
import sys
warnings.filterwarnings("ignore")

# LangChain imports
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_groq import ChatGroq
from sentence_transformers import SentenceTransformer

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'txt'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==================== DATA LOADER ====================

def load_single_document(file_path: str) -> List[Document]:
    """
    Load a single document file (PDF or TXT) and convert to LangChain document structure.
    """
    file_path = Path(file_path).resolve()
    print(f"[DEBUG] Loading single document: {file_path}")

    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    file_extension = file_path.suffix.lower()

    try:
        if file_extension == '.pdf':
            loader = PyPDFLoader(str(file_path))
        elif file_extension == '.txt':
            loader = TextLoader(str(file_path))
        else:
            raise ValueError(f"Unsupported file type: {file_extension}. Only PDF and TXT files are supported.")

        documents = loader.load()
        print(f"[DEBUG] Loaded {len(documents)} documents from {file_path}")
        return documents

    except Exception as e:
        print(f"[ERROR] Failed to load document {file_path}: {e}")
        raise

def load_all_documents(data_dir: str) -> List[Document]:
    """
    Load all PDF and TXT files from the data directory.
    """
    data_path = Path(data_dir).resolve()
    print(f"[DEBUG] Data path: {data_path}")

    if not data_path.exists():
        raise FileNotFoundError(f"Data directory not found: {data_path}")

    # List all files in directory for debugging
    all_files = list(data_path.glob('*'))
    print(f"[DEBUG] All files in directory: {[f.name for f in all_files]}")

    documents = []

    # PDF files (case insensitive)
    pdf_files = list(data_path.glob('**/*.pdf')) + list(data_path.glob('**/*.PDF'))
    print(f"[DEBUG] Found {len(pdf_files)} PDF files")
    for pdf_file in pdf_files:
        try:
            loader = PyPDFLoader(str(pdf_file))
            loaded = loader.load()
            documents.extend(loaded)
            print(f"[DEBUG] Loaded {len(loaded)} pages from PDF: {pdf_file.name}")
        except Exception as e:
            print(f"[ERROR] Failed to load PDF {pdf_file}: {e}")

    # TXT files (case insensitive)
    txt_files = list(data_path.glob('**/*.txt')) + list(data_path.glob('**/*.TXT'))
    print(f"[DEBUG] Found {len(txt_files)} TXT files")
    for txt_file in txt_files:
        try:
            loader = TextLoader(str(txt_file), encoding='utf-8')
            loaded = loader.load()
            documents.extend(loaded)
            print(f"[DEBUG] Loaded {len(loaded)} sections from TXT: {txt_file.name}")
        except Exception as e:
            print(f"[ERROR] Failed to load TXT {txt_file}: {e}")
            # Try with different encoding
            try:
                loader = TextLoader(str(txt_file), encoding='latin-1')
                loaded = loader.load()
                documents.extend(loaded)
                print(f"[DEBUG] Loaded {len(loaded)} sections from TXT with latin-1: {txt_file.name}")
            except Exception as e2:
                print(f"[ERROR] Failed to load TXT with latin-1 {txt_file}: {e2}")

    print(f"[INFO] Total documents loaded: {len(documents)}")
    
    if len(documents) == 0:
        raise ValueError(f"No documents found in {data_dir}. Files present: {[f.name for f in all_files]}")
    
    return documents

# ==================== EMBEDDING PIPELINE ====================

class EmbeddingPipeline:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.model = SentenceTransformer(model_name)
        print(f"[INFO] Loaded embedding model: {model_name}")

    def chunk_documents(self, documents: List[Document]) -> List[Document]:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = splitter.split_documents(documents)
        print(f"[INFO] Split {len(documents)} documents into {len(chunks)} chunks.")
        return chunks

    def embed_chunks(self, chunks: List[Document]) -> np.ndarray:
        texts = [chunk.page_content for chunk in chunks]
        print(f"[INFO] Generating embeddings for {len(texts)} chunks...")
        embeddings = self.model.encode(texts, show_progress_bar=False)
        print(f"[INFO] Embeddings shape: {embeddings.shape}")
        return embeddings

# ==================== VECTOR STORE ====================

class FaissVectorStore:
    def __init__(self, persist_dir: str = "faiss_store", embedding_model: str = "all-MiniLM-L6-v2", chunk_size: int = 1000, chunk_overlap: int = 200):
        self.persist_dir = persist_dir
        os.makedirs(self.persist_dir, exist_ok=True)
        self.index = None
        self.metadata = []
        self.embedding_model = embedding_model
        self.model = SentenceTransformer(embedding_model)
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        print(f"[INFO] Loaded embedding model: {embedding_model}")

    def build_from_documents(self, documents: List[Document]):
        print(f"[INFO] Building vector store from {len(documents)} raw documents...")
        emb_pipe = EmbeddingPipeline(model_name=self.embedding_model, chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap)
        chunks = emb_pipe.chunk_documents(documents)
        embeddings = emb_pipe.embed_chunks(chunks)
        metadatas = [{"text": chunk.page_content, "source": chunk.metadata.get("source", "unknown")} for chunk in chunks]
        self.add_embeddings(np.array(embeddings).astype('float32'), metadatas)
        self.save()
        print(f"[INFO] Vector store built and saved to {self.persist_dir}")

    def add_embeddings(self, embeddings: np.ndarray, metadatas: List[Dict] = None):
        dim = embeddings.shape[1]
        if self.index is None:
            self.index = faiss.IndexFlatL2(dim)
        self.index.add(embeddings)
        if metadatas:
            self.metadata.extend(metadatas)
        print(f"[INFO] Added {embeddings.shape[0]} vectors to Faiss index.")

    def save(self):
        faiss_path = os.path.join(self.persist_dir, "faiss.index")
        meta_path = os.path.join(self.persist_dir, "metadata.pkl")
        faiss.write_index(self.index, faiss_path)
        with open(meta_path, "wb") as f:
            pickle.dump(self.metadata, f)
        print(f"[INFO] Saved Faiss index and metadata to {self.persist_dir}")

    def load(self):
        faiss_path = os.path.join(self.persist_dir, "faiss.index")
        meta_path = os.path.join(self.persist_dir, "metadata.pkl")
        if os.path.exists(faiss_path) and os.path.exists(meta_path):
            self.index = faiss.read_index(faiss_path)
            with open(meta_path, "rb") as f:
                self.metadata = pickle.load(f)
            print(f"[INFO] Loaded Faiss index and metadata from {self.persist_dir}")
        else:
            raise FileNotFoundError(f"Vector store not found at {self.persist_dir}")

    def search(self, query_embedding: np.ndarray, top_k: int = 5):
        if self.index is None:
            raise ValueError("Vector store not initialized. Please build or load the index first.")

        D, I = self.index.search(query_embedding, top_k)
        results = []
        for idx, dist in zip(I[0], D[0]):
            if idx < len(self.metadata):
                meta = self.metadata[idx]
                results.append({"index": idx, "distance": dist, "metadata": meta})
        return results

    def query(self, query_text: str, top_k: int = 5):
        print(f"[INFO] Querying vector store for: '{query_text}'")
        query_emb = self.model.encode([query_text]).astype('float32')
        return self.search(query_emb, top_k=top_k)

# ==================== RAG SEARCH ====================

class RAGSearch:
    def __init__(self, persist_dir: str = "faiss_store", embedding_model: str = "all-MiniLM-L6-v2",
                 llm_model: str = "llama-3.1-8b-instant", data_dir: str = None):
        self.vectorstore = FaissVectorStore(persist_dir, embedding_model)

        # Load or build vectorstore
        faiss_path = os.path.join(persist_dir, "faiss.index")
        meta_path = os.path.join(persist_dir, "metadata.pkl")

        # If data_dir is provided, build new vector store from documents
        if data_dir and os.path.exists(data_dir):
            print(f"[INFO] Building new vector store from {data_dir}")
            docs = load_all_documents(data_dir)
            if not docs:
                raise ValueError(f"No documents found in {data_dir}")
            self.vectorstore.build_from_documents(docs)
        elif not (os.path.exists(faiss_path) and os.path.exists(meta_path)):
            # Skip default data directory loading - will be loaded on demand
            print("[INFO] No existing vector store found. Will be created on first upload.")
            pass
        else:
            print("[INFO] Loading existing vector store")
            self.vectorstore.load()

        # Initialize LLM
        groq_api_key = os.getenv("GROQ_API_KEY", "")
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is required. Please set it in your environment.")

        self.llm = ChatGroq(groq_api_key=groq_api_key, model_name=llm_model)
        print(f"[INFO] Groq LLM initialized: {llm_model}")

    def search_and_summarize(self, query: str, top_k: int = 5) -> str:
        try:
            results = self.vectorstore.query(query, top_k=top_k)
            texts = [r["metadata"].get("text", "") for r in results if r["metadata"]]
            context = "\n\n".join(texts)

            if not context:
                return "No relevant documents found for your query. Please try a different question or upload more relevant documents."

            prompt = f"""Based on the following context extracted from the document, please provide a comprehensive answer to the query: '{query}'

Context:
{context}

Please provide a detailed and accurate answer based solely on the provided context. If the context doesn't contain enough information to fully answer the query, please mention what information is available and what might be missing."""

            print(f"[INFO] Sending prompt to LLM...")
            response = self.llm.invoke(prompt)
            return response.content

        except Exception as e:
            print(f"[ERROR] Error in search_and_summarize: {e}")
            return f"Error processing your query: {str(e)}"

# ==================== FLASK ROUTES ====================

def allowed_file(filename):
    """Check if the file has an allowed extension"""
    if not filename:
        return False
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check that doesn't require full initialization"""
    groq_key = os.getenv("GROQ_API_KEY", "")
    return jsonify({
        "status": "healthy",
        "message": "RAG API server is running on port 5000",
        "groq_api_key_set": bool(groq_key),
        "upload_folder": os.path.exists(UPLOAD_FOLDER)
    })

@app.route('/upload', methods=['POST'])
def upload_and_process():
    """
    Handle file upload from Express.js and process through RAG pipeline
    """
    try:
        # Check GROQ API key first
        if not os.getenv("GROQ_API_KEY"):
            return jsonify({
                "error": "GROQ_API_KEY not set. Please set the environment variable."
            }), 500

        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']

        # Check if file is selected
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # Validate file type BEFORE calling allowed_file
        if file and allowed_file(file.filename):
            # Create unique session ID for this upload
            session_id = str(uuid.uuid4())
            session_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
            data_dir = os.path.join(session_dir, 'data')
            os.makedirs(data_dir, exist_ok=True)

            # Save uploaded file with ORIGINAL extension preserved
            filename = secure_filename(file.filename)
            
            # Ensure filename has extension
            if '.' not in filename:
                # Get extension from original filename
                original_ext = file.filename.rsplit('.', 1)[1] if '.' in file.filename else 'txt'
                filename = f"{filename}.{original_ext}"
            
            file_path = os.path.join(data_dir, filename)
            
            print(f"[INFO] Saving file: {filename}")
            print(f"[INFO] File path: {file_path}")
            
            file.save(file_path)
            
            # Verify file exists and has content
            if not os.path.exists(file_path):
                shutil.rmtree(session_dir)
                return jsonify({"error": "Failed to save file"}), 500
                
            file_size = os.path.getsize(file_path)
            print(f"[INFO] File saved successfully: {filename} ({file_size} bytes)")
            
            if file_size == 0:
                shutil.rmtree(session_dir)
                return jsonify({"error": "Uploaded file is empty"}), 400

            # Get query from form data or request body
            query = request.form.get('query', '')
            if not query:
                # Try to get query from JSON body
                if request.is_json:
                    data = request.get_json()
                    query = data.get('query', '')

            if not query:
                # Clean up and return error
                shutil.rmtree(session_dir)
                return jsonify({"error": "No query provided"}), 400

            top_k = int(request.form.get('top_k', 5))

            try:
                # Initialize RAG search with the uploaded file
                persist_dir = os.path.join(session_dir, 'faiss_store')
                rag_search = RAGSearch(persist_dir=persist_dir, data_dir=data_dir)

                # Perform search and summarize
                print(f"[INFO] Processing query: '{query}'")
                summary = rag_search.search_and_summarize(query, top_k=top_k)

                # Clean up uploaded files
                shutil.rmtree(session_dir)

                return jsonify({
                    "session_id": session_id,
                    "query": query,
                    "summary": summary,
                    "filename": filename,
                    "status": "success"
                })

            except Exception as e:
                # Clean up on error
                if os.path.exists(session_dir):
                    shutil.rmtree(session_dir)
                return jsonify({"error": f"Error processing document: {str(e)}"}), 500

        else:
            # File type not allowed - get the extension for better error message
            ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'unknown'
            return jsonify({
                "error": f"File type '.{ext}' not allowed. Only {', '.join(ALLOWED_EXTENSIONS)} files are supported."
            }), 400

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/query', methods=['POST'])
def query_only():
    """
    Handle query against existing vector store (without file upload)
    """
    try:
        if not os.getenv("GROQ_API_KEY"):
            return jsonify({
                "error": "GROQ_API_KEY not set. Please set the environment variable."
            }), 500

        if request.is_json:
            data = request.get_json()
            query = data.get('query', '')
            persist_dir = data.get('persist_dir', 'faiss_store')
            top_k = data.get('top_k', 5)

            if not query:
                return jsonify({"error": "No query provided"}), 400

            rag_search = RAGSearch(persist_dir=persist_dir)
            summary = rag_search.search_and_summarize(query, top_k=top_k)

            return jsonify({
                "query": query,
                "summary": summary,
                "status": "success"
            })
        else:
            return jsonify({"error": "JSON data required"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test', methods=['GET'])
def test_endpoint():
    """
    Test endpoint to verify the server is working
    """
    return jsonify({
        "message": "RAG API Server is running!",
        "endpoints": {
            "POST /upload": "Upload a file and query it",
            "POST /query": "Query existing vector store",
            "GET /health": "Health check"
        },
        "supported_file_types": list(ALLOWED_EXTENSIONS),
        "groq_api_key_set": bool(os.getenv("GROQ_API_KEY"))
    })

# ==================== MAIN ====================

if __name__ == '__main__':
    print("=" * 60)
    print("Starting RAG API Server...")
    print("=" * 60)
    print(f"Supported file types: {ALLOWED_EXTENSIONS}")
    
    # Check GROQ API KEY
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        print("\n⚠️  WARNING: GROQ_API_KEY environment variable is NOT set!")
        print("The server will start, but file processing will fail.")
        print("Set it with: set GROQ_API_KEY='your-key-here'")
    else:
        print(f"✓ GROQ_API_KEY is set (length: {len(groq_key)})")
    
    print("\nStarting Flask server on http://0.0.0.0:5000")
    print("Test with: curl http://127.0.0.1:5000/health")
    print("=" * 60)
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        print(f"\n❌ ERROR starting server: {e}")
        sys.exit(1)