// const Admin=require("../models/Admin")
// const bcrypt=require("bcryptjs")
// const jwt=require("jsonwebtoken")

// // =============================
// // SIGNUP ADMIN
// // =============================
// exports.signup=async(req,res)=>{
//  try{
//   const {name,email,password}=req.body

//   if(!name||!email||!password){
//    return res.status(400).json({message:"All fields required"})
//   }

//   const exists=await Admin.findOne({email})
//   if(exists){
//    return res.status(400).json({message:"Admin already exists"})
//   }

//   const hashed=await bcrypt.hash(password,10)

//   const admin=await Admin.create({
//    name,
//    email,
//    password:hashed
//   })

//   res.json({message:"Admin created successfully"})

//  }catch(err){
//   res.status(500).json({message:"Server error"})
//  }
// }


// // =============================
// // LOGIN ADMIN
// // =============================
// exports.login=async(req,res)=>{
//  try{
//   const {email,password}=req.body

//   const admin=await Admin.findOne({email})
//   if(!admin){
//    return res.status(401).json({message:"Invalid credentials"})
//   }

//   const match=await bcrypt.compare(password,admin.password)
//   if(!match){
//    return res.status(401).json({message:"Invalid credentials"})
//   }

//   const token=jwt.sign(
//    {id:admin._id,role:admin.role},
//    process.env.JWT_SECRET,
//    {expiresIn:"3d"}
//   )

//   res.json({
//    message:"Login successful",
//    token,
//    admin:{
//     id:admin._id,
//     name:admin.name,
//     email:admin.email
//    }
//   })

//  }catch(err){
//   res.status(500).json({message:"Server error"})
//  }
// }
const Admin=require("../models/Admin")
const jwt=require("jsonwebtoken")

// =============================
// SIGNUP ADMIN
// =============================
exports.signup=async(req,res)=>{
 try{
  const {name,email,password}=req.body

  if(!name||!email||!password){
   return res.status(400).json({message:"All fields required"})
  }

  const exists=await Admin.findOne({email})
  if(exists){
   return res.status(400).json({message:"Admin already exists"})
  }

  const admin=await Admin.create({
   name,
   email,
   password
  })

  res.json({message:"Admin created successfully"})

 }catch(err){
  res.status(500).json({message:"Server error"})
 }
}


// =============================
// LOGIN ADMIN
// =============================
exports.login=async(req,res)=>{
 try{
  const {email,password}=req.body

  if(!email||!password){
   return res.status(400).json({message:"Email and password required"})
  }

  const admin=await Admin.findOne({email})
  if(!admin){
   return res.status(401).json({message:"Invalid credentials"})
  }

  if(password!==admin.password){
   return res.status(401).json({message:"Invalid credentials"})
  }

  const token=jwt.sign(
   {id:admin._id,role:admin.role},
   process.env.JWT_SECRET,
   {expiresIn:"3d"}
  )

  res.json({
   message:"Login successful",
   token,
   admin:{
    id:admin._id,
    name:admin.name,
    email:admin.email,
    role:admin.role
   }
  })

 }catch(err){
  res.status(500).json({message:"Server error"})
 }
}