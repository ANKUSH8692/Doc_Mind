import mongoose from "mongoose";

const FilesSchema=new mongooseSchema({
    user_Id:{
        type:mongoose.Schema.Types.ObjectId,ref:"user"
    },
    file_name:{
        type:String,
        required:true
    },
    file:[{
        type:String,
        required:true
    }],
})

const file_model=mongoose.model('file',FilesSchema);

export default file_model;