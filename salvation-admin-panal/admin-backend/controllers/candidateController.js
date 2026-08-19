const Candidate=require("../models/Candidate")
const buildSearchFilter = require("../utils/buildSearchFilter")
exports.getCandidates = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
   const limit = Number(req.query.limit) || 10
const skip = (page - 1) * limit

    const search = req.query.search || ""

    const filter = buildSearchFilter(search, [
      "candidateId",
      "fullName",
      "email",
      "mobile",
      "currentCompany",
      "designation",
    ])

    const total = await Candidate.countDocuments(filter)

    const data = await Candidate.find(filter)
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
        hasPrevPage: page > 1,
      },
    })
  } catch (err) {
    console.log(err)

    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}