const s3=require("../utils/s3")

module.exports=async(key)=>{
 if(!key) return

 await s3.deleteObject({
  Bucket:process.env.AWS_S3_BUCKET,
  Key:key
 }).promise()
}