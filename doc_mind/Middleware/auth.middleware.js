
import jwt from "jsonwebtoken";

const auth_middleware=async(req,res,next)=>{
    const auth=req.headers.authorization;

   if (!req.headers.authorization) {
        return res.status(401).json({
            message: "Authorization header missing",
            success: false
        });
    }
     const token=auth.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            message: "Bearer token missing",
            success: false
        });
    }
    try{
        const decoded_Token=await jwt.verify(token,process.env.secret_key);
        req.user={_id:decoded_Token};
        next();
    }catch(err){
        res.status(401).json({
            message: err,
            success: false
        });
    }


}

export default auth_middleware;