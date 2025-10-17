import { axiosInstance } from "./index.js";

const url='http://localhost:3000';
export const logInUser=async(user)=>{
    try{
    const res=await axiosInstance.post(url +'/api/user/login',user);
    return res.data;
    }catch(err){
        return err || { success: false, message: "Something went wrong" };
    }
}

export const SignUpUser=async(user)=>{
    try{
    const res=await axiosInstance.post(url +'/api/user/signup',user);
    return res.data;
    }catch(err){
        return err;
    }
}