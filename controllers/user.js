import { User } from "../models/user.js";

import {TryCatch } from "../middleware/error.js";
import ErrorHandler from "../utils/utility-class.js";

export const newUser = TryCatch(async (req, res, next) => {

    const { name, email, photo, gender, _id, dob } = req.body;

    let user = await User.findById(_id)

    if(user){
    return res.status(200).json({
      success :  true,
      message : `Welcome , ${user.name}`
    })  
    }

    if(!_id || !name || !email || !photo || !gender || !dob){
      next(new ErrorHandler("Please add all fields",400))
    }

     user = await User.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });

    return res.status(201).json({
      success: true,
      message: `Welcome , ${user.name}`,
    });
  
});


export const getAllUsers = TryCatch(async(req,res,next) => {

  const users = await User.find({});
  return res.status(201).json({
    success : true,
    users
  })
})


export const getUser = TryCatch(async(req,res,next) => {

  const user = await User.findById(req.params.id);
  if(!user)return next(new ErrorHandler("Invalid Id",401))
  return res.status(201).json({
    success : true,
    user
  })
})


export const deleteUser = TryCatch(async(req,res,next) => {

  const user = await User.findByIdAndDelete(req.params.id);
  if(!user)return next(new ErrorHandler("Invalid Id",401))
  return res.status(201).json({
    success : true,
    message : `${user.name} Deleted Successfully`
  })
})

// https://www.youtube.com/watch?v=TmlpFSSKT3s
// status code