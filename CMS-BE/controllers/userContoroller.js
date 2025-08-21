const User=require('../models/User.js')
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken')
exports.register=async(req,res)=>{
    try {
        const {email,password,fullName,role}=req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists ,Please login' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, fullName, role });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}

exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({ message: 'please Enter Correct Password' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.status(200).json({ token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
         });
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}