import jwt from "jsonwebtoken";
// 🚨 CRITICAL FIX: Add the .js extension. If this still fails, your file path is wrong.
import user_model from "../models/user_model.js"; 

const auth_middleware = async (req, res, next) => {
    // ----------------------------------------------------------------
    // DEBUG 1: Check if the middleware is running
    console.log('--- Auth Middleware Running ---');
    console.log('Request Path:', req.originalUrl);
    // ----------------------------------------------------------------
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // DEBUG 2: Check if the token check fails
        console.warn('Authentication Failed: Authorization header missing or invalid format.');
        
        return res.status(401).json({
            message: "Authorization token is missing or improperly formatted (Expected: Bearer <token>)",
            success: false
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 1. Verify the JWT.
        const decoded_Token = jwt.verify(token, process.env.secret_key); 
        const userId = decoded_Token._id; 
        
        // 2. Find the user in the database.
        const user = await user_model.findById(userId).select('-password'); 

        // 3. Check if the user exists.
        if (!user) {
            console.warn(`Authentication Failed: User ID ${userId} not found in database.`);
            return res.status(401).json({
                message: "Authentication failed: User account not found in database",
                success: false
            });
        }
        
        // 4. Success: Attach the user object and call next().
        console.log(`Authentication Success for User: ${userId}`);
        req.user = user; 
        
        next();
    } catch (err) {
        // Handle token verification errors (expired, wrong signature, secret_key mismatch)
        console.error("JWT Verification/DB Error:", err.message);
        return res.status(401).json({
            message: "Authentication failed: Invalid or expired token",
            success: false
        });
    }
};

export default auth_middleware;
