import {useState} from "react"
import {
 UploadCloud,
 FileText,
 Loader2,
 Folder,
 X,
 AlertTriangle
} from "lucide-react"
import {toast} from "react-toastify"
import {
 uploadDocument,
 uploadSalaryFolder
} from "../api/AdminApi"

/* ================= MONTH LIST ================= */

const MONTHS=[
 "Jan","Feb","Mar","Apr","May","Jun",
 "Jul","Aug","Sep","Oct","Nov","Dec"
]

export default function UploadDocuments(){

 const [employeeId,setEmployeeId]=useState("")
 const [file,setFile]=useState(null)
 const [files,setFiles]=useState([])

 const [type,setType]=useState("offerLetter")
 const [uploading,setUploading]=useState(false)

 const [month,setMonth]=useState("")
 const [year,setYear]=useState(new Date().getFullYear())

 const [failedUploads,setFailedUploads]=useState([])

 /* =====================================================
    SINGLE FILE SELECT (NORMAL DOCS)
 ===================================================== */

 const handleFileChange=(e)=>{
  const selected=e.target.files[0]
  if(!selected) return

  const allowed=["application/pdf","image/jpeg","image/png","image/webp"]

  if(!allowed.includes(selected.type)){
   toast.error("Only PDF, JPG, PNG allowed")
   return
  }

  setFile(selected)
 }

 /* =====================================================
    FOLDER SELECT (SALARY SLIPS)
 ===================================================== */

 const handleFolderSelect=(e)=>{
  const selected=Array.from(e.target.files)

  if(!selected.length) return

  const pdfOnly=selected.filter(f=>f.type==="application/pdf")

  if(!pdfOnly.length){
   toast.error("Salary slips must be PDF")
   return
  }

  setFiles(pdfOnly)
 }

 const removeFolderFile=(index)=>{
  setFiles(prev=>prev.filter((_,i)=>i!==index))
 }

 /* =====================================================
    UPLOAD
 ===================================================== */

 const handleUpload=async()=>{

  /* ================= SALARY BULK ================= */
  if(type==="salarySlip"){

   if(!files.length){
    toast.error("Select salary slip folder")
    return
   }

   if(!month){
    toast.error("Select month")
    return
   }

   try{
    setUploading(true)

    const formData=new FormData()
    files.forEach(f=>formData.append("files",f))
    formData.append("month",month)
    formData.append("year",year)

    const res=await uploadSalaryFolder(formData)

    toast.success(`Uploaded ${res?.data?.uploaded || 0} salary slips`)

    setFailedUploads(res?.data?.failed || [])

    setFiles([])
    setMonth("")
    setYear(new Date().getFullYear())

   }catch(err){
    toast.error(err?.response?.data?.message || "Upload failed")
   }finally{
    setUploading(false)
   }

   return
  }

  /* ================= NORMAL DOCUMENT ================= */

  if(!employeeId.trim()){
   toast.error("Enter employee ID")
   return
  }

  if(!file){
   toast.error("Select file")
   return
  }

  try{
   setUploading(true)

   const formData=new FormData()
   formData.append("employeeId",employeeId)
   formData.append("type",type)
   formData.append("file",file)

   await uploadDocument(formData)

   toast.success("Document uploaded")

   setFile(null)
   setEmployeeId("")

  }catch(err){
   toast.error(err?.response?.data?.message || "Upload failed")
  }finally{
   setUploading(false)
  }
 }

 /* =====================================================
    UI
 ===================================================== */

 return(
 <div className="min-h-[70vh] flex justify-center items-start pt-10 px-6 bg-gray-50">

  <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border p-8 space-y-6">

   {/* HEADER */}
   <div>
    <h2 className="text-2xl font-semibold text-gray-800">
     Upload Company Document
    </h2>
    <p className="text-gray-500 text-sm">
     Assign official documents to employee
    </p>
   </div>

   {/* DOCUMENT TYPE */}
   <div>
    <label className="text-sm font-medium mb-1 block">
     Document Type
    </label>

    <select
     value={type}
     onChange={e=>{
      setType(e.target.value)
      setFile(null)
      setFiles([])
      setFailedUploads([])
     }}
     className="w-full border rounded-lg px-4 py-2.5"
    >
     <option value="offerLetter">Offer Letter</option>
     <option value="appointmentLetter">Appointment Letter</option>
     <option value="salarySlip">Salary Slip (Bulk Folder)</option>
     <option value="uanLetter">UAN Letter</option>
     <option value="esicSlip">ESIC Slip</option>
    </select>
   </div>

   {/* =====================================================
        SALARY BULK UI
   ===================================================== */}

   {type==="salarySlip" &&(
    <>
     <div className="grid grid-cols-2 gap-4">
      <select
       value={month}
       onChange={e=>setMonth(e.target.value)}
       className="border rounded-lg px-4 py-2.5"
      >
       <option value="">Select Month</option>
       {MONTHS.map(m=><option key={m}>{m}</option>)}
      </select>

      <input
       type="number"
       value={year}
       onChange={e=>setYear(e.target.value)}
       className="border rounded-lg px-4 py-2.5"
      />
     </div>

     <label className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center cursor-pointer hover:bg-gray-50">
      <Folder size={30} className="text-gray-500"/>
      <p className="font-medium mt-2">Select Salary Slip Folder</p>
      <input
       type="file"
       webkitdirectory="true"
       multiple
       className="hidden"
       onChange={handleFolderSelect}
      />
     </label>

     {files.length>0 &&(
      <div className="max-h-44 overflow-auto bg-gray-50 rounded-lg p-3 space-y-2">
       {files.map((f,i)=>(
        <div key={i} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
         <FileText size={14}/>
         <span className="text-sm flex-1 truncate">{f.name}</span>
         <button onClick={()=>removeFolderFile(i)}>
          <X size={14}/>
         </button>
        </div>
       ))}
      </div>
     )}
    </>
   )}

   {/* =====================================================
        NORMAL DOC UI
   ===================================================== */}

   {type!=="salarySlip" &&(
    <>
     <input
      placeholder="Employee ID"
      value={employeeId}
      onChange={e=>setEmployeeId(e.target.value)}
      className="w-full border rounded-lg px-4 py-2.5"
     />

     <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50">
      <UploadCloud size={30}/>
      <p>Select File</p>
      <input type="file" className="hidden" onChange={handleFileChange}/>
     </label>

     {file &&(
      <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
       <FileText size={14}/>
       {file.name}
      </div>
     )}
    </>
   )}

   {/* BUTTON */}
   <button
    onClick={handleUpload}
    disabled={uploading}
    className="w-full bg-blue-600 text-white py-3 rounded-xl flex justify-center gap-2 hover:bg-blue-700 transition"
   >
    {uploading && <Loader2 className="animate-spin"/>}
    {uploading?"Uploading...":"Upload"}
   </button>

   {/* =====================================================
        FAILED UPLOAD CARD
   ===================================================== */}

   {failedUploads.length>0 &&(
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">

     <div className="flex items-center gap-2 mb-2 text-red-700 font-semibold">
      <AlertTriangle size={18}/>
      Failed Uploads ({failedUploads.length})
     </div>

     <div className="max-h-40 overflow-auto space-y-2">
      {failedUploads.map((f,i)=>(
       <div key={i} className="flex justify-between bg-white border rounded-lg px-3 py-2 text-sm">
        <span className="truncate font-medium">{f.file}</span>
        <span className="text-red-600 text-xs">{f.reason}</span>
       </div>
      ))}
     </div>

    </div>
   )}

  </div>
 </div>
 )
}