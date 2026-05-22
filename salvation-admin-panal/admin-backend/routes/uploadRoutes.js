const router=require("express").Router()
const multer=require("multer")
const auth=require("../middleware/authMiddleware")
const c=require("../controllers/uploadController")

const upload=multer({
 storage: multer.memoryStorage()
})

router.post("/",auth,upload.single("file"),c.uploadDocument)

module.exports=router
