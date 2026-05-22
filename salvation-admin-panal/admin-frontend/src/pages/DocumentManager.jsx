import {useEffect,useState} from "react"
import {
 getEmployees,
 getDocumentUrl,
 deleteDocument,
 replaceDocument
} from "../api/AdminApi"
import axios from "axios"
import {
 Download,
 Trash2,
 Pencil,
 Search,
 X,
 RefreshCw
} from "lucide-react"

import {toast} from "react-toastify"

export default function DocumentManager(){

const [employees,setEmployees]=useState([])
const [search,setSearch]=useState("")
const [employee,setEmployee]=useState(null)
const [tab,setTab]=useState("employee")
const [preview,setPreview]=useState(null)
const [previewType,setPreviewType]=useState("")
const [refreshing,setRefreshing]=useState(false)

useEffect(()=>{loadEmployees()},[])

/* ================= LOAD EMPLOYEES ================= */

const loadEmployees=async()=>{
 const res=await getEmployees()
 setEmployees(res.data)
}

/* ================= SEARCH ================= */

const handleSearch=()=>{
 const emp=employees.find(e=>e.employeeId===search.trim())
 if(!emp) return toast.error("Employee not found")
 setEmployee(emp)
}

/* ================= REFRESH DOCUMENTS ONLY ================= */

const refreshDocuments=async()=>{
 if(!employee) return

 try{
  setRefreshing(true)

  const res=await getEmployees()
  const updatedEmployees=res.data
  setEmployees(updatedEmployees)

  const updatedEmployee=updatedEmployees.find(
   e=>e.employeeId===employee.employeeId
  )

  if(updatedEmployee){
   setEmployee(updatedEmployee)
   toast.success("Documents refreshed")
  }

 }catch{
  toast.error("Refresh failed")
 }finally{
  setRefreshing(false)
 }
}

/* ================= PREVIEW ================= */

const openPreview=async(key)=>{
 const res=await getDocumentUrl(key)
 const url=res.data.url
 setPreview(url)
 setPreviewType(url.includes(".pdf")?"pdf":"image")
}

const download=async(key)=>{
 try{

  // 1. get signed URL from backend
  const res=await getDocumentUrl(key)
  const fileUrl=res.data.url

  // 2. download file as blob
  const fileResponse=await axios.get(fileUrl,{
   responseType:"blob"
  })

  // 3. create download link
  const fileName=key.split("/").pop()

  const url=window.URL.createObjectURL(new Blob([fileResponse.data]))
  const link=document.createElement("a")
  link.href=url
  link.setAttribute("download",fileName)

  document.body.appendChild(link)
  link.click()

  link.remove()
  window.URL.revokeObjectURL(url)

 }catch(err){
  console.error(err)
  toast.error("Download failed")
 }
}

/* ================= DELETE ================= */

const deleteDoc=async(type,docKey,extra={})=>{
 if(!window.confirm("Delete document?")) return

 await deleteDocument({
  employeeId:employee.employeeId,
  type,
  docKey,
  ...extra
 })

 toast.success("Deleted")
 refreshDocuments()
}

/* ================= REPLACE ================= */

const replaceDoc=async(file,type,docKey,extra={})=>{
 const form=new FormData()
 form.append("file",file)
 form.append("employeeId",employee.employeeId)
 form.append("type",type)
 form.append("docKey",docKey)
 Object.entries(extra).forEach(([k,v])=>form.append(k,v))

 await replaceDocument(form)
 toast.success("Updated")
 refreshDocuments()
}

return(
<div className="min-h-screen bg-gray-50 px-3 sm:px-6 py-4 sm:py-6">

{/* SEARCH */}
<div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-4 sm:p-6 mb-6">
<h2 className="text-lg sm:text-2xl font-semibold mb-4">
Document Manager
</h2>

<div className="flex flex-col sm:flex-row gap-3">
<input
 value={search}
 onChange={(e)=>setSearch(e.target.value)}
 placeholder="Search by Employee ID"
 className="flex-1 border px-4 py-2 rounded-lg"
/>

<button
 onClick={handleSearch}
 className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2"
>
<Search size={18}/> Search
</button>
</div>
</div>


{/* EMPLOYEE PANEL */}
{employee && (
<div className="max-w-6xl mx-auto bg-white shadow rounded-xl p-4 sm:p-6">

<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

<div>
<h3 className="text-lg sm:text-xl font-semibold">{employee.fullName}</h3>
<p className="text-gray-500">{employee.employeeId}</p>
</div>

<div className="flex flex-wrap items-center gap-2">

<button
 onClick={()=>setTab("employee")}
 className={`px-4 py-2 rounded ${tab==="employee"?"bg-blue-600 text-white":"bg-gray-200"}`}
>
Employee Docs
</button>

<button
 onClick={()=>setTab("company")}
 className={`px-4 py-2 rounded ${tab==="company"?"bg-blue-600 text-white":"bg-gray-200"}`}
>
Company Docs
</button>

<button
 onClick={refreshDocuments}
 disabled={refreshing}
 className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
>
<RefreshCw size={16} className={refreshing?"animate-spin":""}/>
Refresh
</button>

</div>

</div>


{/* DOCUMENT GRID */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

{tab==="employee" &&
Object.entries(employee.employeeUploads).map(([name,key])=>{
 if(!key) return null
 return(
 <DocCard
 key={name}
 name={name}
 onPreview={()=>openPreview(key)}
 onDownload={()=>download(key)}
 onDelete={()=>deleteDoc("employee",name)}
 onReplace={(file)=>replaceDoc(file,"employee",name)}
 />
 )
})
}

{tab==="company" && (
<>
{Object.entries(employee.companyUploads).map(([name,value])=>{
 if(name==="salarySlips") return null
 if(!value) return null

 return(
 <DocCard
 key={name}
 name={name}
 onPreview={()=>openPreview(value)}
 onDownload={()=>download(value)}
 onDelete={()=>deleteDoc("company",name)}
 onReplace={(file)=>replaceDoc(file,"company",name)}
 />
 )
})}

<SalarySlipManager
 salarySlips={employee.companyUploads.salarySlips}
 onPreview={openPreview}
 onDownload={download}
 onDelete={(slip)=>deleteDoc("salary","salarySlip",{month:slip.month,year:slip.year})}
 onReplace={(file,slip)=>replaceDoc(file,"salary","salarySlip",{month:slip.month,year:slip.year})}
/>
</>
)}

</div>
</div>
)}


{/* PREVIEW MODAL */}
{preview && (
<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3">
<div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] relative">
<button onClick={()=>setPreview(null)} className="absolute top-3 right-3 z-10"><X/></button>
{previewType==="image" && <img src={preview} className="w-full h-full object-contain"/>}
{previewType==="pdf" && <iframe src={preview} className="w-full h-full"/>}
</div>
</div>
)}

</div>
)
}


/* ================= DOCUMENT CARD ================= */

function DocCard({name,onPreview,onDownload,onDelete,onReplace}){
return(
<div className="bg-gray-100 rounded-xl p-4 shadow hover:shadow-lg transition">
<h4 className="font-semibold capitalize mb-3">{name}</h4>

<div className="flex flex-wrap gap-2">
<button onClick={onPreview} className="flex-1 bg-blue-600 text-white py-1 rounded">Preview</button>
<button onClick={onDownload} className="bg-green-500 text-white p-2 rounded"><Download size={16}/></button>
<label className="bg-yellow-500 text-white p-2 rounded cursor-pointer">
<Pencil size={16}/>
<input type="file" hidden onChange={(e)=>onReplace(e.target.files[0])}/>
</label>
<button onClick={onDelete} className="bg-red-500 text-white p-2 rounded"><Trash2 size={16}/></button>
</div>
</div>
)
}


/* ================= SALARY MANAGER ================= */

function SalarySlipManager({salarySlips,onPreview,onDownload,onDelete,onReplace}){

const [open,setOpen]=useState(false)
const [year,setYear]=useState("all")

const years=[...new Set(salarySlips.map(s=>s.year))].sort((a,b)=>b-a)
const filtered=year==="all"?salarySlips:salarySlips.filter(s=>s.year===Number(year))

return(
<>
<div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between gap-3">
<div>
<h4 className="text-lg font-semibold">Salary Slips</h4>
<p className="text-sm">Total: {salarySlips.length}</p>
</div>
<button onClick={()=>setOpen(true)} className="bg-white text-blue-600 px-4 py-2 rounded-lg">View Slips</button>
</div>

{open && (
<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3">
<div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
<button onClick={()=>setOpen(false)} className="absolute right-3 top-3"><X/></button>

<select value={year} onChange={(e)=>setYear(e.target.value)} className="border px-3 py-2 rounded mb-4">
<option value="all">All Years</option>
{years.map(y=>(<option key={y}>{y}</option>))}
</select>

<div className="overflow-x-auto">
<table className="w-full border min-w-[500px]">
<thead className="bg-gray-100">
<tr>
<th className="p-2">Month</th>
<th className="p-2">Year</th>
<th className="p-2">Actions</th>
</tr>
</thead>
<tbody>
{filtered.map((slip,i)=>(
<tr key={i} className="border-t">
<td className="p-2">{slip.month}</td>
<td className="p-2">{slip.year}</td>
<td className="p-2 flex gap-2">
<button onClick={()=>onPreview(slip.key)} className="bg-blue-600 text-white px-3 py-1 rounded">Preview</button>
<button onClick={()=>onDownload(slip.key)} className="bg-green-500 text-white px-3 py-1 rounded">Download</button>
<label className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer">
Replace
<input hidden type="file" onChange={(e)=>onReplace(e.target.files[0],slip)}/>
</label>
<button onClick={()=>onDelete(slip)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
</td>
</tr>
))}
</tbody>
</table>
</div>

</div>
</div>
)}
</>
)
}