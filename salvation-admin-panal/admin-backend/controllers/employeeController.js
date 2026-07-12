const Employee=require("../models/Employee")
const generateId=require("../utils/generateEmployeeId")
const uploadToS3 =require("../utils/s3Upload")
const buildSearchFilter = require("../utils/buildSearchFilter")
const LeaveEmployee=require("../models/LeaveEmployee")
const XLSX=require("xlsx")

const normalizeMobile=(mobile)=>{
	if(!mobile) return ""
	let phone=String(mobile).replace(/\D/g,"")
	if(phone.length>10){
		phone=phone.slice(-10)
	}
	return phone
}
// exports.generateEmployee=async(req,res)=>{
//  try{

//   const { loginMobile } = req.body

//   if(!loginMobile){
//    return res.status(400).json({message:"Login mobile required"})
//   }

//   const employeeId = await generateId()

//   const emp = await Employee.create({
//    employeeId,
//    loginMobile
//   })

//   res.json({
//    success:true,
//    message:"Employee ID generated",
//    employeeId:emp.employeeId
//   })

//  }catch(err){
//   console.error(err)
//   res.status(500).json({message:"Server error"})
//  }
// }

exports.generateEmployee=async(req,res)=>{
	try{
		let {loginMobile}=req.body

		if(!loginMobile){
			return res.status(400).json({success:false,message:"Login mobile required"})
		}

		loginMobile=normalizeMobile(loginMobile)

		if(!/^\+\d{10,13}$/.test(loginMobile)){
			return res.status(400).json({success:false,message:"Invalid mobile number"})
		}

		const alreadyEmployee=await Employee.findOne({loginMobile})

		if(alreadyEmployee){
			return res.status(409).json({
				success:false,
				message:"Employee already registered with this mobile number",
				employeeId:alreadyEmployee.employeeId
			})
		}

		const employeeId=await generateId()

		const emp=await Employee.create({
			employeeId,
			loginMobile,
			mobile:loginMobile
		})

		res.json({
			success:true,
			message:"Employee ID generated",
			employeeId:emp.employeeId
		})
	}catch(err){
		console.error(err)

		if(err.code===11000){
			return res.status(409).json({
				success:false,
				message:"This mobile number already has an employee ID"
			})
		}

		res.status(500).json({success:false,message:"Server error"})
	}
}
exports.createEmployee=async(req,res)=>{
 const employeeId=await generateId()
 const emp=await Employee.create({...req.body,employeeId})
 res.json(emp)
}

exports.getEmployees = async (req, res) => {
	console.log(req.query)
console.log("Search =", req.query.search)
  try {
    const page = Number(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const search = (req.query.search || "").trim()

    let filter = {}

    if (search) {
      filter = {
        $or: [
          { employeeId: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
          { fatherName: { $regex: search, $options: "i" } },
          { loginMobile: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { designation: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
        ],
      }
    }

    const total = await Employee.countDocuments(filter)
   const todayStart = new Date()
    todayStart.setHours(0,0,0,0)

    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )

    const activeToday = await Employee.countDocuments({
      lastLoginAt: { $gte: todayStart }
    })

    const newThisMonth = await Employee.countDocuments({
      createdAt: { $gte: monthStart }
    })

    const data = await Employee.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

 res.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      stats: {
        activeToday,
        newThisMonth
      }
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false })
  }
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
exports.getLeaveEmployees=async(req,res)=>{
	try{
		const page=Number(req.query.page)||1
		const limit=10
		const skip=(page-1)*limit

		const total=await LeaveEmployee.countDocuments()

		const data=await LeaveEmployee.find()
			.sort({leftAt:-1})
			.skip(skip)
			.limit(limit)

		res.json({
			success:true,
			data,
			pagination:{
				total,
				page,
				limit,
				totalPages:Math.ceil(total/limit),
				hasNextPage:page<Math.ceil(total/limit),
				hasPrevPage:page>1
			}
		})
	}catch(err){
		console.error(err)
		res.status(500).json({
			success:false,
			message:"Server error"
		})
	}
}
exports.updateEmploymentDetails = async(req,res)=>{
 try{

  const {
   designation,
   dateOfJoining,
   dateOfBirth
  } = req.body

  const employee = await Employee.findByIdAndUpdate(
   req.params.id,
   {
    designation,
    dateOfJoining,
    dateOfBirth
   },
   { new:true }
  )

  res.json({
   success:true,
   employee
  })

 }catch(err){
  console.log(err)

  res.status(500).json({
   message:"Failed to update employee details"
  })
 }
}
exports.restoreLeaveEmployee=async(req,res)=>{
	try{
		const {id}=req.params

		const leaveEmployee=await LeaveEmployee.findById(id)

		if(!leaveEmployee){
			return res.status(404).json({
				success:false,
				message:"Leave employee not found"
			})
		}

		const employeeData=leaveEmployee.employeeData

		const alreadyExists=await Employee.findOne({
			employeeId:employeeData.employeeId
		})

		if(alreadyExists){
			return res.status(409).json({
				success:false,
				message:"Employee already exists"
			})
		}

		await Employee.create(employeeData)

		await LeaveEmployee.findByIdAndDelete(id)

		res.json({
			success:true,
			message:"Employee restored successfully"
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
const match = file.originalname.match(/SOS\d+/i)
						return match?match[0].toUpperCase():null
					})
					.filter(Boolean)
			)
		]

		const employees=await Employee.find({employeeId:{$in:employeeIds}})
		const employeeMap=new Map(employees.map(emp=>[emp.employeeId,emp]))

		const processFile=async(file)=>{
			const fileName=file.originalname
const match = fileName.match(/SOS\d+/i)
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

const excelDateToJS=(value)=>{

    if(!value) return null

    if(typeof value==="number"){

        const date=new Date((value-25569)*86400*1000)

        return date
    }

    const parts=String(value).split("/")

    if(parts.length===3){

        const [dd,mm,yyyy]=parts

        return new Date(
            Number(yyyy),
            Number(mm)-1,
            Number(dd)
        )
    }

    return null
}
exports.bulkImportEmployees=async(req,res)=>{
 console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  console.log("HEADERS:", req.headers["content-type"]);
try{

if(!req.file){

return res.status(400).json({
success:false,
message:"Excel file required"
})

}

const workbook=XLSX.read(req.file.buffer,{
type:"buffer"
})

const sheet=workbook.Sheets[
workbook.SheetNames[0]
]

const rows=XLSX.utils.sheet_to_json(sheet,{
defval:""
})

let inserted=0
let skipped=[]

for(const row of rows){

const mobile=String(row["MOBILE NO"]).trim()

if(!mobile){

skipped.push({
employee:row["EMP CODE"],
reason:"Mobile missing"
})

continue
}

const exists=await Employee.findOne({
loginMobile:mobile
})

if(exists){

skipped.push({
employee:row["EMP CODE"],
reason:"Already exists"
})

continue
}

await Employee.create({

employeeId:String(row["EMP CODE"]).trim(),

fullName:String(row["EMPLOYEE NAME"]).trim(),

fatherName:String(
row["FATHER/HUSBAND NAME"]
).trim(),

designation:String(
row["DESIGNATION"]
).trim(),

loginMobile:mobile,

mobile:mobile,

dateOfBirth:excelDateToJS(
row["DOB"]
),

dateOfJoining:excelDateToJS(
row["DOJ"]
)

})

inserted++

}

res.json({

success:true,

inserted,

skipped

})

}catch(err){

console.log(err)

res.status(500).json({

success:false,

message:"Import failed"

})

}

}