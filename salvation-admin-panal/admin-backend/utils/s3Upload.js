// const { Upload } = require("@aws-sdk/lib-storage")
// const path = require("path")
// const s3 = require("./s3Client")

// /*
// =====================================
//  STANDARD HR DOCUMENT STRUCTURE
// =====================================

// upload/{module}/{documentType}/{safeName}_{id}_{documentType}.ext

// Example:
// upload/employee/aadhaar/stuti_EMP-0002_aadhaar.jpg
// */

// module.exports = async(file,{module,documentType,name,id})=>{

//  if(!file || !file.buffer){
//   throw new Error("File buffer missing")
//  }

//  const ext = path.extname(file.originalname)

//  const safeName = name.replace(/\s+/g,"_")

//  const fileName = `${safeName}_${id}_${documentType}${ext}`

//  const key = `upload/${module}/${documentType}/${fileName}`

//  const upload = new Upload({
//   client:s3,
//   params:{
//    Bucket:process.env.AWS_S3_BUCKET,
//    Key:key,
//    Body:file.buffer,
//    ContentType:file.mimetype
//   }
//  })

//  await upload.done()

//  return {
//   key,
//   location:`${process.env.S3_BASE_URL}/${key}`
//  }
// }

const {Upload}=require("@aws-sdk/lib-storage")
const path=require("path")
const s3=require("./s3Client")

module.exports=async(file,{module,documentType,name,id})=>{
	if(!file||!file.buffer){
		throw new Error("File buffer missing")
	}

	const ext=path.extname(file.originalname)
	const safeName=(name||id||"employee").replace(/\s+/g,"_")
	const unique=Date.now()
	const fileName=`${safeName}_${id}_${documentType}_${unique}${ext}`
	const key=`upload/${module}/${documentType}/${fileName}`

	const upload=new Upload({
		client:s3,
		params:{
			Bucket:process.env.AWS_S3_BUCKET,
			Key:key,
			Body:file.buffer,
			ContentType:file.mimetype
		},
		queueSize:4,
		partSize:1024*1024*5,
		leavePartsOnError:false
	})

	await upload.done()

	return{
		key,
		location:`${process.env.S3_BASE_URL}/${key}`
	}
}