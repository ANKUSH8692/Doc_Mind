import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText, User, Loader2, MessageSquare, X, Lock } from 'lucide-react';

const RAGChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New States for Client-Side Authentication Check
  const [isClientAuthenticated, setIsClientAuthenticated] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Mock user data - replace with actual auth data
  const user = {
    name: 'Authenticated User',
    avatar: 'AU'
  };

  // --- NEW AUTHENTICATION CHECK ---
  useEffect(() => {
    // Check if the token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsClientAuthenticated(true);
    }
    setAuthCheckComplete(true);
  }, []);
  // ---------------------------------

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to parse markdown-style bold text
  const parseMarkdownBold = (text) => {
    if (!text) return null;
    
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** and make bold
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold text-gray-900">
            {boldText}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'pdf' && fileExtension !== 'txt') {
        setError('Only PDF and TXT files are supported');
        removeFile();
        return;
      }
      if (selectedFile.size > 16 * 1024 * 1024) {
        setError('File size must be less than 16MB');
        removeFile();
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async () => {
    const authToken = localStorage.getItem('token');
    
    if (!authToken) {
      setError('Authentication failed. Please log in (token missing).');
      return;
    }
    
    if (!query.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!file) {
      setError('Please upload a document first');
      return;
    }

    setIsLoading(true);
    setError('');

    // Add user message to chat
    const userMessage = {
      type: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuery(''); // Clear input immediately

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('query', query);
      formData.append('top_k', '5');

      // Replace with your actual API endpoint
      const url = 'http://localhost:3000'; // Make sure this matches your Node.js server
      const response = await fetch(url + '/api/rag/ask_doc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}` 
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for 401 response from the middleware
        if (response.status === 401) {
            throw new Error(data.message || 'Authentication required.');
        }
        throw new Error(data.error || data.message || 'Failed to get response');
      }

      // Add AI response to chat
      const aiMessage = {
        type: 'ai',
        // Assuming your backend returns data in data.data.summary
        content: data.data.summary, 
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      setError(err.message || 'Failed to process your request');
      // Remove last user message if the request failed
      setMessages(prev => prev.filter((_, index) => index < prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // --- CONDITIONAL RENDERING ---

  if (!authCheckComplete) {
      // Show loading state while checking token
      return (
          <div className="flex items-center justify-center h-screen bg-gray-50">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="ml-3 text-lg text-gray-600">Checking authorization...</p>
          </div>
      );
  }

  if (!isClientAuthenticated) {
      // Show auth required message if token is missing
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
              <Lock className="w-16 h-16 text-red-500 mb-6" />
              <h1 className="text-3xl font-bold text-red-800 mb-3">Access Denied</h1>
              <p className="text-lg text-gray-700 text-center max-w-md">
                  You must be logged in to access the RAG Assistant.
              </p>
              <p className="text-md text-gray-600 text-center mt-2">
                  Please ensure a valid authentication token is available in your browser's local storage.
              </p>
              <div className="mt-6 p-3 bg-red-100 border border-red-300 rounded-xl text-sm text-red-700 font-mono shadow-md">
                  Required Key: localStorage.getItem('<span className="font-bold">token</span>')
              </div>
          </div>
      );
  }
  // -----------------------------

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
      `}</style>
      
      {/* Header */}
      <header className="bg-white shadow-lg px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">RAG Document Assistant</h1>
            <p className="text-xs text-gray-500">Securely chat with your documents</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-inner">
            <span className="text-white font-semibold text-sm">{user.avatar}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 overflow-hidden">
        
        {/* File Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {file ? (
                <>
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                    title="Remove File"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-400" />
                  <label htmlFor="file-upload" className="flex-1 cursor-pointer">
                    <span className="text-sm text-gray-600">Upload a document (PDF or TXT, max 16MB)</span>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 shadow-md transition-colors"
                  >
                    Choose File
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-lg p-6 mb-4 space-y-6 custom-scroll">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <FileText className="w-16 h-16 mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2 text-gray-600">Chat with your Document</h3>
              <p className="text-sm">Upload a document above and ask your first question.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl shadow-md px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.type === 'ai' ? parseMarkdownBold(message.content) : message.content}
                  </p>
                  <span className={`text-xs mt-1 block ${message.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center space-x-2 shadow-sm rounded-tl-none">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4 shadow-sm">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your document..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow"
                rows={2}
                disabled={isLoading}
                onKeyDown={handleKeyPress}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !query.trim() || !file}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default RAGChatInterface;
