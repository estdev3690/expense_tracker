import userModel from '../models/userSchema.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const register=async(req,res)=>{
    try {   
        const {name,email,password}=req.body
        if(!name || !email || !password){
            return res.status(401).json({success:false,message:'All fields required'})
        }
        const existingUser=await userModel.findOne({email})
        if(existingUser){
            return res.status(401).json({success:false,message:'User already exists'})
        }
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const newUser=new userModel({
            name,
            email,
            password:hashedPassword
        })
        await newUser.save()

        const token= jwt.sign({id:newUser._id,email:newUser.email},process.env.JWT_SECRET,{expiresIn:'7d'})
        res.cookie(token,{
            httpOnly:false,
            secure:false,
            sameSite:'Lax',
            maxAge:7 * 24 * 60 * 60 * 1000
        })

        const userResponse={
            id:newUser._id,
            username:newUser.name,
            email:newUser.email
        }
       return  res.status(201).json({success:true,message:'user registered successfully',user:userResponse,token})

    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:'Internal server Error'})
    }
}

const login=async(req,res)=>{
    try {
        
        const {email,password}=req.body

        if(!email || !password){
            return res.status(401).json({status:false,message:'All fields required'})
        }

        const user=await userModel.findOne({email})

        if(!user){
            return res.status(404).json({success:false,message:'user not found'})
        }

        const isPasswordValid=await bcrypt.compare(password,user.password)
        if(!isPasswordValid){
            return res.status(401).json({success:false,message:'Invalid Credentials'})
        }

        const token=jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:'7d'})

        res.cookie(token,{
            httpOnly:false,
            secure:false,
            sameSite:'Lax',
            maxAge:7 * 24 * 60 * 60 * 1000
        })

        const userResponse={
            id:user._id,
            username:user.name,
            email:user.email,
        }
       return res.status(200).json({success:true,message:'Login successfull',user:userResponse,token})

    } catch (error) {
       console.error('Login Error:', error);
        res.status(500).json({success:false,message:'Internal server Error'})
    }
}
export  {register,login}