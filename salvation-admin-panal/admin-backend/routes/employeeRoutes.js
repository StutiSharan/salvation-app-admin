const router=require("express").Router()
const auth=require("../middleware/authMiddleware")
const multer=require("multer")
const upload=multer()

const c=require("../controllers/employeeController")

router.post("/",auth,c.createEmployee)
router.get("/",auth,c.getEmployees)
router.post("/generate",auth,c.generateEmployee)
router.delete("/delete/:id",auth,c.deleteEmployee)
router.get("/leave",auth,c.getLeaveEmployees)
router.post("/leave/:id/restore",auth,c.restoreLeaveEmployee)
/* ================= BULK SALARY SLIP FOLDER ================= */
router.post(
 "/salary-slip/bulk-folder",
 auth,
 upload.array("files"),
 c.bulkSalaryFolderUpload
)
router.put(
  "/:id/employment-details",
  auth,
  c.updateEmploymentDetails
)
router.post(
    "/bulk-import",
    auth,
    upload.single("file"),
    c.bulkImportEmployees
)
module.exports=router