const mongoose=require("mongoose")

const schema=new mongoose.Schema({
 candidateId:String,
 fullName:String,
 mobile:String,
 address:String,
 resume:String,
 aadhaar:String
},{timestamps:true})

module.exports=mongoose.model("Candidate",schema)
