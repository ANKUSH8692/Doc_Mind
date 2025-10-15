📖 About DocMind
DocMind is an advanced AI-powered platform that revolutionizes how users interact with books and documents. Using cutting-edge Retrieval-Augmented Generation (RAG) technology combined with Large Language Models (LLMs), DocMind provides intelligent, context-aware conversations about any book in your library.

🚀 Key Features
•	Smart Book Search: Advanced search capabilities across your book collection
•	AI-Powered Q&A: Ask any question about books and get intelligent responses
•	Contextual Understanding: RAG system understands book context and content
•	Personalized Recommendations: Get book suggestions based on your interests
•	Real-time Chat Interface: Natural conversation with AI about literature

🏗️ System Architecture
RAG with LLM Diagram

<img width="975" height="534" alt="image" src="https://github.com/user-attachments/assets/efa40406-004b-4108-8a13-4e50bedc350b" />

 
🔧 Technology Stack
Frontend
•	React 18 - Modern UI framework with hooks and context
•	Tailwind CSS - Utility-first CSS framework for responsive design
•	React Router - Client-side routing for SPA experience
•	Axios - HTTP client for API communication
Backend
•	Node.js - JavaScript runtime for server-side operations
•	Express.js - Web application framework for RESTful APIs
•	MongoDB - NoSQL database for user and book data
•	Mongoose - ODM for MongoDB object modeling
AI & Machine Learning
•	Python - Core language for AI/ML operations
•	LangChain - Framework for LLM application development
•	OpenAI API / Local LLMs - Large Language Model integration
•	Sentence Transformers - Text embedding generation
•	FAISS / ChromaDB - Vector database for similarity search
🛠️ Installation & Setup
Prerequisites
•	Node.js (v16 or higher)
•	Python (v3.8 or higher)
•	MongoDB (v4.4 or higher)
•	npm or yarn
Frontend Setup
bash
# Clone the repository
git clone https://github.com/Ankush8692/docmind.git
cd docmind/frontend

# Install dependencies
npm install

# Start development server
npm start
Backend Setup
bash
cd backend

# Install Node.js dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations

# Start the server
npm run dev
Python AI Service Setup
bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Start AI service
python app.py

🎯 Core Features Implementation
Book Search & Selection
•	Fuzzy search algorithm for book discovery
•	Real-time search suggestions
•	Book metadata display (title, author, description)
AI Chat Interface
•	Real-time message exchange
•	Context preservation across conversations
•	Typing indicators and loading states
•	Message history persistence
User Authentication
•	JWT-based secure authentication
•	Password encryption
•	Session management
•	Protected routes

