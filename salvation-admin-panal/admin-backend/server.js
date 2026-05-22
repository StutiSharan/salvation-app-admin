require("dotenv").config()
const express=require("express")
const cors=require("cors")
const connectDB=require("./config/db")

connectDB()

const app=express()
app.use(cors())
app.use(express.json())

app.use("/api/auth",require("./routes/authRoutes"))
app.use("/api/employees",require("./routes/employeeRoutes"))
app.use("/api/candidates",require("./routes/candidateRoutes"))
app.use("/api/upload",require("./routes/uploadRoutes"))
app.use("/api/documents",require("./routes/documentRoutes"))

app.listen(process.env.PORT,()=>{
 console.log("Admin server running on",process.env.PORT)
})
