const Candidate=require("../models/Candidate")

exports.getCandidates=async(req,res)=>{
 const data=await Candidate.find().sort({createdAt:-1})
 res.json(data)
}
