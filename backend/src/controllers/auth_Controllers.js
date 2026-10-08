import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import PasswordCheck from "../utils/PasswordCheck.js";
import {z} from "zod"

const userSchema=z.object({
    username:z.string().min(4,{ message: "Must be 4 or more characters long" }).max(50,{ message: "Must be 50 or less characters long" }),
    email:z.string().email().min(6).max(60),
    password:z.string().min(6).max(100)

})

export const signin =async (req,res)=>{
    const {username,email,password}=req.body
   try {
    const result = userSchema.safeParse(req.body)
  
    
     if(!result.success){
         return res.status(404).json({
             message:"All details Needed"
         })
     }
 
    //  const ExistingUser=await User.findOne({email})
     
    //  if(ExistingUser){
    //      return res.status(404).json({
    //          message:"User Exist"
    //      })
    //  }
     const user=await User.create({
         username,email,password
     })
     if(!user){
         res.status(500).json({
             message:"Somthing went Wrong Will Creating A User "
         })
     }
         const token=generateToken(user._id)
     res.status(201).cookie("token",token).json({
         message:"User Created"
     })
 }
    catch (error) {
    console.log(error +" signin");
    res.status(500).json({
        message:"Backend Error"
    })
    
   }}

   export const  login=async(req,res)=>{
    const {email,password}=req.body;
    
    if(!email||!password){
        return res.status(404).json({
            message:"All details Needed"
        })
    }

    try {

        const user =await User.findOne({email})

        
        if(!user){
          return  res.status(404).json({
                message:"User Not Exist"
            })
        }
        const checkPassword=await PasswordCheck(password,user.password)

        if(!checkPassword){
           return res.status(404).json({
                message:"Incorrect Password"
            })
        }

        const token =await generateToken(user._id)
       return res.status(201).cookie("token",token).json({
            message:"login"
        })
        
    } catch (error) {
        console.log("login problem");
        res.status(500).json({
            message:"Backend Error",
            data:error.message
        })
    }
   }
   export const logout =async(req,res)=>{
    try {
        res.status(200)
        .clearCookie("token")
        .json({
         message:"logout"
        })
    } catch (error) {
        res.status(500)
        .clearCookie("token")
        .json({
         message:"server error"
        })
    }
   }
   export const check=async(req,res)=>{
    try {
        res.status(200).json({
            user:req.user
        })
    } catch (error) {
        console.log(error +' check problem');
        
        res.status(500)
        .json({
         message:"server error"
        })
    }
   }