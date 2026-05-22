const router=require("express").Router()
const auth=require("../middleware/authMiddleware")
const multer=require("multer")
const upload=multer()

const c=require("../controllers/employeeController")

router.post("/",auth,c.createEmployee)
router.get("/",auth,c.getEmployees)
router.post("/generate",auth,c.generateEmployee)

/* ================= BULK SALARY SLIP FOLDER ================= */
router.post(
 "/salary-slip/bulk-folder",
 auth,
 upload.array("files"),
 c.bulkSalaryFolderUpload
)

module.exports=router