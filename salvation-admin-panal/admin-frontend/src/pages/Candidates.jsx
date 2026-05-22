import {useEffect,useState} from "react"
import axios from "../api/axios"
import CommonTable from "../components/CommonTable"
import Loader from '../components/Loader'
import {
RefreshCw,
X,
Copy,
Check
} from "lucide-react"

export default function Candidates(){

const [candidates,setCandidates]=useState([])
const [loading,setLoading]=useState(true)
const [error,setError]=useState("")

const [preview,setPreview]=useState(null)
const [previewKey,setPreviewKey]=useState(null)
const [previewType,setPreviewType]=useState("")
const [previewLoading,setPreviewLoading]=useState(false)
const [zoom,setZoom]=useState(false)

useEffect(()=>{ fetchCandidates() },[])

/* ======================================================
FETCH
====================================================== */

const fetchCandidates=async()=>{
try{
setLoading(true)
const res=await axios.get("/candidates")
setCandidates(res.data || [])
}catch(err){
console.error(err)
setError("Failed to load candidates")
}finally{
setLoading(false)
}
}

/* ======================================================
COPY FIELD
====================================================== */

const CopyField=({value})=>{
const [copied,setCopied]=useState(false)

const handleCopy=async()=>{
try{
await navigator.clipboard.writeText(value||"")
setCopied(true)
setTimeout(()=>setCopied(false),1500)
}catch(e){
console.log("copy failed")
}
}

return(

   <div className="flex items-center gap-2">
    <span className="truncate">{value}</span>
    <button onClick={handleCopy} className="p-1 hover:bg-gray-200 rounded">
     {copied ? <Check size={14}/> : <Copy size={14}/>}
    </button>
   </div>
  )
 }

/* ======================================================
OPEN PREVIEW
====================================================== */

const openPreview=async(key)=>{
if(!key) return
try{
setPreviewLoading(true)

const res=await axios.get(`/documents/signed-url?key=${encodeURIComponent(key)}`)

setPreview(res.data?.url)
setPreviewKey(key)
setPreviewType(key.split(".").pop().toLowerCase())

}catch(err){
console.log(err)
alert("Preview failed")
}finally{
setPreviewLoading(false)
}
}

/* ======================================================
FILE PREVIEW (THUMB)
====================================================== */

const FilePreview=({path})=>{
const [thumb,setThumb]=useState(null)

useEffect(()=>{
if(!path) return

axios.get(`/documents/signed-url?key=${encodeURIComponent(path)}`)
.then(res=>setThumb(res.data?.url))
.catch(()=>{})
},[path])

if(!path) return "—"

const ext=path.split(".").pop().toLowerCase()

if(["jpg","jpeg","png","webp"].includes(ext)){
return thumb
? <img
src={thumb}
onClick={()=>openPreview(path)}
className="w-12 h-12 rounded border cursor-pointer object-cover"
/>
: <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"/>
}

if(ext==="pdf"){
return(
<div
onClick={()=>openPreview(path)}
className="w-12 h-12 flex items-center justify-center border rounded bg-red-50 text-red-600 cursor-pointer"
>
PDF </div>
)
}

return null
}

/* ======================================================
DOWNLOAD
====================================================== */

const downloadFile=async()=>{
if(!previewKey) return

try{
const res=await axios.get(`/documents/signed-url?key=${encodeURIComponent(previewKey)}`)
const url=res.data?.url

const a=document.createElement("a")
a.href=url
a.target="_blank"
a.rel="noopener"
a.download=previewKey.split("/").pop()
document.body.appendChild(a)
a.click()
a.remove()

}catch(err){
console.log(err)
window.open(preview,"_blank")
}
}

/* ======================================================
TABLE
====================================================== */

const columns=[
{label:"Candidate ID",render:r=><CopyField value={r.candidateId}/>},
{label:"Name",render:r=><CopyField value={r.fullName}/>},
{label:"Father",key:"fatherName"},
{label:"Mobile",render:r=><CopyField value={r.mobile}/>},
{label:"Address",key:"address"},
{label:"Resume",render:r=><FilePreview path={r.resumeFilePath}/>},
{label:"Aadhaar",render:r=><FilePreview path={r.aadhaarFilePath}/>},
{
label:"Created",
render:r=>new Date(r.createdAt).toLocaleDateString("en-GB")
}
]

if(error) return <div className="p-8 text-red-500">{error}</div>

/* ======================================================
UI
====================================================== */

return(

  <div className="p-6 bg-gray-50 min-h-screen">

   <div className="flex justify-between mb-6">
    <h1 className="text-2xl font-semibold">Candidates</h1>

<button
 onClick={fetchCandidates}
 disabled={loading}
 className="flex gap-2 bg-[#0F2747] text-white px-4 py-2 rounded"
>
 <RefreshCw size={16}/>
 {loading?"Refreshing":"Refresh"}
</button>

   </div>

   <div className="bg-white rounded shadow">
    <div className="p-4 border-b">{candidates.length} records</div>
    <div className="h-[520px] overflow-auto">
{loading
 ? <Loader size={40}/>
 : <CommonTable columns={columns} data={candidates}/>
}  
  </div>
   </div>

{/* ================= MODAL ================= */}

{preview && ( <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

 <div className="bg-white rounded-xl w-full max-w-3xl flex flex-col overflow-hidden">

  <div className="flex justify-between p-4 border-b">
   <h2>Document Preview</h2>
   <button onClick={()=>setPreview(null)}><X/></button>
  </div>

  <div className="flex-1 flex items-center justify-center p-4">

   {previewLoading
 ? <Loader size={70}/>
    : previewType==="pdf"
      ? <iframe src={preview} className="w-full h-[70vh]"/>
      : <img src={preview} onClick={()=>setZoom(!zoom)} className={zoom?"scale-150":"max-h-[65vh] object-contain"}/>
   }

  </div>

  <div className="p-4 border-t flex justify-end">
   <button onClick={downloadFile} className="bg-[#0F2747] text-white px-4 py-2 rounded">
    Download
   </button>
  </div>

 </div>
</div>


)}

  </div>
 )
}
