const Employee=require("../models/Employee")
const generateId=require("../utils/generateEmployeeId")
const uploadToS3 =require("../utils/s3Upload")
const LeaveEmployee=require("../models/LeaveEmployee")


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
// exports.bulkSalaryFolderUpload=async(req,res)=>{
//  try{

//   const {month,year}=req.body

//   if(!req.files?.length){
//    return res.status(400).json({message:"No files uploaded"})
//   }

//   let uploaded=0
//   let failed=[]

//   for(const file of req.files){

//    const fileName=file.originalname

//    const match=fileName.match(/EMP-\d+/i)

//    if(!match){
//     failed.push({file:fileName,reason:"Employee ID not found"})
//     continue
//    }

//    const employeeId=match[0].toUpperCase()

//    const employee=await Employee.findOne({employeeId})

//    if(!employee){
//     failed.push({file:fileName,reason:"Employee not found"})
//     continue
//    }
// const alreadyExists = employee.companyUploads.salarySlips.some(
//  s=>s.month===month && s.year===Number(year)
// )

// if(alreadyExists){
//  failed.push({file:fileName,reason:"Salary slip already exists"})
//  continue
// }
//    /* ===== S3 UPLOAD ===== */

//   const uploadResult = await uploadToS3(file,{
// 	module:"employee",
// 	documentType:"salarySlip",
// 	name:employee.name || employeeId,
// 	id:employeeId
// })

//    /* ===== SAVE DB ===== */

//    employee.companyUploads.salarySlips.push({
//     month,
//     year:Number(year),
//     key:uploadResult.key
//    })

//    await employee.save()
//    uploaded++
//   }

//   res.json({success:true,uploaded,failed})

//  }catch(err){
//   console.error(err)
//   res.status(500).json({message:"Upload failed"})
//  }
// }

exports.deleteEmployee=async(req,res)=>{
	try{
		const {id}=req.params
		const {reason,deletedBy}=req.body

		const employee=await Employee.findById(id)

		if(!employee){
			return res.status(404).json({
				success:false,
				message:"Employee not found"
			})
		}

		await LeaveEmployee.create({
			employeeData:employee.toObject(),
			reason:reason||"Left organization",
			deletedBy:deletedBy||"Admin"
		})

		await Employee.findByIdAndDelete(id)

		res.json({
			success:true,
			message:"Employee deleted and moved to leave employees collection"
		})
	}catch(err){
		console.error(err)
		res.status(500).json({
			success:false,
			message:"Server error"
		})
	}
}
exports.bulkSalaryFolderUpload=async(req,res)=>{
	try{
		const {month,year}=req.body

		if(!month||!year){
			return res.status(400).json({message:"Month and year required"})
		}

		if(!req.files?.length){
			return res.status(400).json({message:"No files uploaded"})
		}

		const files=req.files
		const failed=[]
		const successUpdates=[]
		const CONCURRENCY=4

		const employeeIds=[
			...new Set(
				files
					.map(file=>{
						const match=file.originalname.match(/EMP-\d+/i)
						return match?match[0].toUpperCase():null
					})
					.filter(Boolean)
			)
		]

		const employees=await Employee.find({employeeId:{$in:employeeIds}})
		const employeeMap=new Map(employees.map(emp=>[emp.employeeId,emp]))

		const processFile=async(file)=>{
			const fileName=file.originalname
			const match=fileName.match(/EMP-\d+/i)

			if(!match){
				failed.push({file:fileName,reason:"Employee ID not found"})
				return
			}

			const employeeId=match[0].toUpperCase()
			const employee=employeeMap.get(employeeId)

			if(!employee){
				failed.push({file:fileName,reason:"Employee not found"})
				return
			}

			const salarySlips=employee.companyUploads?.salarySlips||[]

			const alreadyExists=salarySlips.some(
				s=>s.month===month&&s.year===Number(year)
			)

			if(alreadyExists){
				failed.push({file:fileName,reason:"Salary slip already exists"})
				return
			}

			try{
			console.time(`S3-${file.originalname}`)

const uploadResult=await uploadToS3(file,{
	module:"employee",
	documentType:"salarySlip",
	name:employee.name||employee.fullName||employeeId,
	id:employeeId
})

console.timeEnd(`S3-${file.originalname}`)
				successUpdates.push({
					updateOne:{
						filter:{employeeId},
						update:{
							$push:{
								"companyUploads.salarySlips":{
									month,
									year:Number(year),
									key:uploadResult.key,
									uploadedAt:new Date()
								}
							}
						}
					}
				})
			}catch(err){
				failed.push({file:fileName,reason:err.message||"S3 upload failed"})
			}
		}

		for(let i=0;i<files.length;i+=CONCURRENCY){
			const batch=files.slice(i,i+CONCURRENCY)
			await Promise.all(batch.map(processFile))
		}

		if(successUpdates.length){
		await Employee.bulkWrite(successUpdates,{ordered:false})
		}

		res.json({
			success:true,
			uploaded:successUpdates.length,
			failed
		})

	}catch(err){
		console.error(err)
		res.status(500).json({message:"Upload failed"})
	}
}