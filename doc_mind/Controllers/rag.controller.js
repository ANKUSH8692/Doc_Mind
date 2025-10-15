import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

import authMiddleware from "./../Middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ 
    dest: 'temp_uploads/',
    limits: { fileSize: 16 * 1024 * 1024 }
});

// Flask URL - CHANGE THIS IF NEEDED
const FLASK_URL = 'http://127.0.0.1:5000';

// Main endpoint
router.post('/ask_doc', authMiddleware,upload.single('file'), async (req, res) => {

    let filePath = null;
    
    try {
        // Validate file
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No file uploaded' 
            });
        }

        filePath = req.file.path;

        // Validate query
        const query = req.body.query;
        if (!query) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ 
                success: false, 
                error: 'No query provided' 
            });
        }

        console.log(`📄 File: ${req.file.originalname}`);
        console.log(`❓ Query: ${query}`);

        // Create FormData
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath), req.file.originalname);
        formData.append('query', query);
        formData.append('top_k', req.body.top_k || '5');

        console.log(`🚀 Sending to Flask: ${FLASK_URL}/upload`);

        // Send to Flask
        const response = await axios.post(`${FLASK_URL}/upload`, formData, {
            headers: formData.getHeaders(),
            timeout: 120000
        });

        console.log('✅ Success');

        // Clean up
        fs.unlinkSync(filePath);

        // Return response
        return res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Clean up
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Handle errors
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                error: error.response.data.error || 'Flask error',
                details: error.response.data
            });
        } else if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                error: 'Cannot connect to Flask server',
                message: `Flask is not running at ${FLASK_URL}`
            });
        } else {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
});

router.post('/query', authMiddleware,async (req, res) => {
    try {
        const { query, top_k = 5, persist_dir = 'faiss_store' } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'No query provided' });
        }

        const response = await axios.post('http://172.28.0.12:5000/query', {
            query,
            top_k,
            persist_dir
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Internal server error',
            details: error.response?.data || error.message
        });
    }
})

export default router;
