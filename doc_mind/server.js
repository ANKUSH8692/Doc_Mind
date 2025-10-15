import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import user from "./Controllers/user.controller.js"
import rag from "./Controllers/rag.controller.js"
import dbconfig from "./db.config.js";

dotenv.config();

const port=process.env.PORT;
dbconfig();
const app=express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', // Your React app URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/api/user',user);
app.use('/api/Rag',rag);

app.listen(port,()=>{
    console.log(`server is running ${port}`);
})