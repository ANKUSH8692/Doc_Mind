import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/login.jsx';
import Signup from './components/Signup';
import BookChat from './components/BookChat';
import RAGChatInterface from './components/RAG.jsx';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/books" element={<BookChat />} />
          <Route path='/RAG' element={<RAGChatInterface />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;