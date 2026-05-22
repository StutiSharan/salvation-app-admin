const s3=require("../utils/s3")
const Employee=require("../models/Employee")
const deleteFromS3=require("../utils/deleteFromS3")
const uploadToS3=require("../utils/s3Upload")

exports.getSignedUrl=async(req,res)=>{
 try{

  const {key}=req.query
  if(!key) return res.status(400).json({message:"Key required"})

  const url=s3.getSignedUrl("getObject",{
   Bucket:process.env.AWS_S3_BUCKET,
   Key:key,
   Expires:60*10
  })

  res.json({url})

 }catch(err){
  res.status(500).json({message:"Failed to fetch document"})
 }
}
exports.deleteDocument=async(req,res)=>{
 try{

  const {employeeId,type,docKey,month,year}=req.body

  if(!employeeId || !type){
   return res.status(400).json({message:"Missing parameters"})
  }

  const employee=await Employee.findOne({employeeId})
  if(!employee){
   return res.status(404).json({message:"Employee not found"})
  }


  /* ===== EMPLOYEE DOC ===== */
  if(type==="employee"){
   const key=employee.employeeUploads?.[docKey]
   if(key) await deleteFromS3(key)
   employee.employeeUploads[docKey]=""
  }


  /* ===== COMPANY DOC ===== */
  if(type==="company"){
   const key=employee.companyUploads?.[docKey]
   if(key) await deleteFromS3(key)
   employee.companyUploads[docKey]=""
  }


  /* ===== SALARY SLIP ===== */
  if(type==="salary"){
   const index=employee.companyUploads.salarySlips.findIndex(
    s=>s.month===month && s.year===Number(year)
   )

   if(index===-1){
    return res.status(404).json({message:"Salary slip not found"})
   }

   const slip=employee.companyUploads.salarySlips[index]
   await deleteFromS3(slip.key)

   employee.companyUploads.salarySlips.splice(index,1)
  }


  await employee.save()

  res.json({
   success:true,
   message:"Document deleted"
  })

 }catch(err){
  console.error(err)
  res.status(500).json({message:"Delete failed"})
 }
}



exports.replaceDocument = async(req,res)=>{
 try{

  const { employeeId,type,docKey,month,year } = req.body
  const file=req.file

  const employee=await Employee.findOne({employeeId})

  if(!employee) return res.status(404).json({message:"Employee not found"})

  /* ===== DELETE OLD FILE ===== */

  let oldKey=""

  if(type==="employee"){
   oldKey=employee.employeeUploads[docKey]
  }

  if(type==="company"){
   oldKey=employee.companyUploads[docKey]
  }

  if(type==="salary"){
   const slip=employee.companyUploads.salarySlips.find(
    s=>s.month===month && s.year===Number(year)
   )
   oldKey=slip.key
  }

  if(oldKey) await deleteFromS3(oldKey)


  /* ===== UPLOAD USING OLD STRUCTURE ===== */

  const upload = await uploadToS3(file,{
   module:"employee",
   documentType:docKey,
   name:employee.fullName || "employee",
   id:employee.employeeId
  })


  /* ===== SAVE ===== */

  if(type==="employee"){
   employee.employeeUploads[docKey]=upload.key
  }

  if(type==="company"){
   employee.companyUploads[docKey]=upload.key
  }

  if(type==="salary"){
   const slip=employee.companyUploads.salarySlips.find(
    s=>s.month===month && s.year===Number(year)
   )
   slip.key=upload.key
  }

  await employee.save()

  res.json({success:true,key:upload.key})

 }catch(err){
  console.error(err)
  res.status(500).json({message:"Replace failed"})
 }
}