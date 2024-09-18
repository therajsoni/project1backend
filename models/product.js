import mongoose from "mongoose";


const schema = new mongoose.Schema(
    {
     
      name: {
        type: String,
        required: [true, "Please add name"],
      },
      photo : {
        type :String,
        required : [true,"Please Enter photo"]
      },
      price:{
        type : Number,
        required : [true,"Please Enter price"]
      },
      stock : {
        type : Number,
        required : [true,"Please Enter stock"]
      },
      category : {
        type:String,
        required : [true,"Please Entercategory"],
        trim : true
      },      
      createdAt : Date,
      updatedAt : Date,
    },
    {
      timestamps: true,
    }
  );
  
  
  export const Product = mongoose.model("Product", schema);
  