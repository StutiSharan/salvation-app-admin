const Candidate=require("../models/Candidate")

exports.getCandidates=async(req,res)=>{
	try{
		const page=Number(req.query.page)||1
		const limit=10
		const skip=(page-1)*limit

		const total=await Candidate.countDocuments()

		const data=await Candidate.find()
			.sort({createdAt:-1})
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