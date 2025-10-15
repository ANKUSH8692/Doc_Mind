import { axiosInstance } from "./index.js";

export const logInUser=async(user)=>{
    try{
    const res=await axiosInstance.post('/api/user/login',user);
    return res.data;
    }catch(err){
        return err || { success: false, message: "Something went wrong" };
    }
}

export const SignUpUser=async(user)=>{
    try{
    const res=await axiosInstance.post('/api/user/signup',user);
    return res.data;
    }catch(err){
        return err;
    }
}