import express from "express";

import authMiddleware from "./../Middleware/auth.middleware.js";

const router=express.Router();

router.get('/all_files',authMiddleware,async(req,res)=>{

});

router.post('/add_file',authMiddleware,async(req,res)=>{
    
});

export default router;