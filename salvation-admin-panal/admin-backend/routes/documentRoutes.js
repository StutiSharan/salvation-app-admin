const express=require("express")
const router=express.Router()
const multer=require("multer")
const upload=multer()
const {getSignedUrl,deleteDocument,replaceDocument}=require("../controllers/documentController")

router.get("/signed-url",getSignedUrl)

router.delete("/delete",deleteDocument)

/* REPLACE DOCUMENT */
router.post("/replace",upload.single("file"),replaceDocument)
module.exports=router
