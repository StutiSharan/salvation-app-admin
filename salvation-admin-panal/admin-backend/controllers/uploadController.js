const uploadS3=require("../utils/s3Upload")
const Employee=require("../models/Employee")

exports.uploadDocument=async(req,res)=>{
 try{

  const {employeeId,type,month,year}=req.body
  const file=req.file

  if(!employeeId || !type || !file){
   return res.status(400).json({message:"Missing fields"})
  }

  const emp=await Employee.findOne({employeeId})
  if(!emp){
   return res.status(404).json({message:"Employee not found"})
  }

const result = await uploadS3(file,{
 module:"employee",
 documentType:type,
 name: emp.fullName || "employee",
 id: employeeId
})
  if(!emp.companyUploads) emp.companyUploads={}

  /* ================= SALARY SLIP ================= */

  if(type==="salarySlip"){

   if(!month || !year){
    return res.status(400).json({message:"Month and year required"})
   }

   if(!emp.companyUploads.salarySlips)
     emp.companyUploads.salarySlips=[]

   const slips=emp.companyUploads.salarySlips

   const index=slips.findIndex(
     s=>s.month===month && s.year===Number(year)
   )

   const newSlip={
     month,
     year:Number(year),
     key:result.key,
     uploadedAt:new Date()
   }

   if(index>=0){
     slips[index]=newSlip   // replace existing month
   }else{
     slips.push(newSlip)    // new month
   }

  }

  /* ================= OTHER DOCS ================= */

  else{
   emp.companyUploads[type]=result.key
  }

  await emp.save()

  res.json({
   message:"Uploaded successfully",
   key:result.key,
   url:result.location
  })

 }catch(err){
  console.error(err)
  res.status(500).json({message:"Upload failed"})
 }
}
