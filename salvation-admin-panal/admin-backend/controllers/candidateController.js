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

exports.updateCandidate = async (req, res) => {
  try {
    const { fullName, mobile } = req.body

    const update = {}

    // Update name only if provided
    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty"
        })
      }

      update.fullName = fullName.trim()
    }

    // Validate mobile ONLY when mobile is being updated
    if (mobile !== undefined) {
      const cleanMobile = mobile.trim()

      if (!/^\d{10}$/.test(cleanMobile)) {
        return res.status(400).json({
          success: false,
          message: "Mobile number must contain exactly 10 digits"
        })
      }

      update.mobile = cleanMobile
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update"
      })
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      {
        new: true
      }
    )

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      })
    }

    return res.json({
      success: true,
      message: "Candidate updated successfully",
      candidate
    })

  } catch (err) {
    console.log("Update candidate error:", err)

    return res.status(500).json({
      success: false,
      message: "Failed to update candidate"
    })
  }
}