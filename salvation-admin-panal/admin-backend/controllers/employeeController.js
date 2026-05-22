const Employee=require("../models/Employee")
const generateId=require("../utils/generateEmployeeId")
const uploadToS3 =require("../utils/s3Upload")


exports.generateEmployee=async(req,res)=>{
 try{

  const { loginMobile } = req.body

  if(!loginMobile){
   return res.status(400).json({message:"Login mobile required"})
  }

  const employeeId = await generateId()

  const emp = await Employee.create({
   employeeId,
   loginMobile
  })

  res.json({
   success:true,
   message:"Employee ID generated",
   employeeId:emp.employeeId
  })

 }catch(err){
  console.error(err)
  res.status(500).json({message:"Server error"})
 }
}
exports.createEmployee=async(req,res)=>{
 const employeeId=await generateId()
 const emp=await Employee.create({...req.body,employeeId})
 res.json(emp)
}

exports.getEmployees=async(req,res)=>{
 const data=await Employee.find().sort({createdAt:-1})
 res.json(data)
}
exports.bulkSalaryFolderUpload=async(req,res)=>{
 try{

  const {month,year}=req.body

  if(!req.files?.length){
   return res.status(400).json({message:"No files uploaded"})
  }

  let uploaded=0
  let failed=[]

  for(const file of req.files){

   const fileName=file.originalname

   const match=fileName.match(/EMP-\d+/i)

   if(!match){
    failed.push({file:fileName,reason:"Employee ID not found"})
    continue
   }

   const employeeId=match[0].toUpperCase()

   const employee=await Employee.findOne({employeeId})

   if(!employee){
    failed.push({file:fileName,reason:"Employee not found"})
    continue
   }
const alreadyExists = employee.companyUploads.salarySlips.some(
 s=>s.month===month && s.year===Number(year)
)

if(alreadyExists){
 failed.push({file:fileName,reason:"Salary slip already exists"})
 continue
}
   /* ===== S3 UPLOAD ===== */

   const uploadResult = await uploadToS3(
     file,
     employeeId,
     "salarySlip"
   )

   /* ===== SAVE DB ===== */

   employee.companyUploads.salarySlips.push({
    month,
    year:Number(year),
    key:uploadResult.key
   })

   await employee.save()
   uploaded++
  }

  res.json({success:true,uploaded,failed})

 }catch(err){
  console.error(err)
  res.status(500).json({message:"Upload failed"})
 }
}