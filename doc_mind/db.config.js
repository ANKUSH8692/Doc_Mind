// db.config.js
import mongoose from "mongoose";

const connectDB = async () => {
    const uri = process.env.CONN_String;
    try {
        // Connect to the database using the URI from the environment
        await mongoose.connect(uri,{
            dbName:'RAG',
        });
        
        console.log("DB Connection successful! ✅");
    } catch (err) {
        console.error("DB Connection failed ❌:", err.message);
    }
};

export default connectDB;