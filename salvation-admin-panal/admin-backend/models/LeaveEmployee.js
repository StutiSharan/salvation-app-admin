const mongoose=require("mongoose")

const leaveEmployeeSchema=new mongoose.Schema({
	employeeData:{
		type:Object,
		required:true
	},
	leftAt:{
		type:Date,
		default:Date.now
	},
	reason:{
		type:String,
		default:"Left organization"
	},
	deletedBy:{
		type:String
	}
},{timestamps:true})

module.exports=mongoose.model("LeaveEmployee",leaveEmployeeSchema)