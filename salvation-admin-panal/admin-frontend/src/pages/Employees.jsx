import {useEffect,useState,useMemo} from "react"
import axios from "../api/axios"
import CommonTable from "../components/CommonTable"
import DocumentViewModal from "../components/EmpDocumentViewModal"

import {
 Users,
 UserCheck,
 UserPlus,
 RefreshCw,
 Eye,
 Copy,
 Check
} from "lucide-react"

export default function Employees(){

 const [employees,setEmployees]=useState([])
 const [loading,setLoading]=useState(true)

 const [openModal,setOpenModal]=useState(false)
 const [selectedDocs,setSelectedDocs]=useState(null)

 useEffect(()=>{ fetchEmployees() },[])

 const fetchEmployees=async()=>{
  try{
   setLoading(true)
   const res=await axios.get("/employees")
   setEmployees(res.data)
  }catch(err){
   console.log(err)
  }finally{
   setLoading(false)
  }
 }

 /* ======================================================
    DATE HELPERS
 ====================================================== */

 const formatDate=(date)=>{
  return new Date(date).toLocaleDateString("en-GB",{
   day:"numeric",
   month:"short",
   year:"numeric"
  })
 }

 const isToday=(date)=>{
  if(!date) return false
  const d=new Date(date)
  const today=new Date()
  const start=new Date(today.setHours(0,0,0,0))
  const end=new Date(today.setHours(23,59,59,999))
  return d>=start && d<=end
 }

 const isThisMonth=(date)=>{
  if(!date) return false
  const d=new Date(date)
  const now=new Date()
  return (
   d.getMonth()===now.getMonth() &&
   d.getFullYear()===now.getFullYear()
  )
 }

 /* ======================================================
    KPI CALCULATIONS
 ====================================================== */

 const activeTodayCount=useMemo(()=>{
  return employees.filter(emp=>isToday(emp.lastLoginAt)).length
 },[employees])

 const newThisMonthCount=useMemo(()=>{
  return employees.filter(emp=>isThisMonth(emp.createdAt)).length
 },[employees])

 /* ======================================================
    TABLE COLUMNS
 ====================================================== */

 const columns=[

  {
   label:"Employee ID",
   key:"employeeId",
   render:(row)=><CopyField value={row.employeeId}/>
  },

  {
   label:"Name",
   key:"fullName",
   sortable:true,
   render:(row)=><CopyField value={row.fullName}/>
  },

  {
   label:"Mobile",
   key:"mobile",
   render:(row)=><CopyField value={row.mobile}/>
  },

  {label:"Address",key:"address"},

  {
   label:"Created",
   key:"createdAt",
   sortable:true,
   render:(row)=>formatDate(row.createdAt)
  },

  {
   label:"Documents",
   key:"documents",
   render:(row)=>(
    <button
     onClick={()=>{
      setSelectedDocs(row.employeeUploads)
      setOpenModal(true)
     }}
     className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg ml-6"
    >
     <Eye size={16}/>
    </button>
   )
  }
 ]

 /* ======================================================
    UI
 ====================================================== */

 return(
  <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen space-y-6">

   {/* HEADER */}
   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
    <div>
     <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800">
      Employees
     </h1>
     <p className="text-gray-500 text-sm mt-1">
      Manage employee records and activity
     </p>
    </div>

    <button
     onClick={fetchEmployees}
     disabled={loading}
     className="flex items-center gap-2 bg-[#0F2747] text-white px-4 py-2 rounded-lg disabled:opacity-50"
    >
     <RefreshCw size={16}/>
     {loading ? "Refreshing..." : "Refresh"}
    </button>
   </div>

   {/* KPI STATS */}
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

    <StatCard
     title="Total Employees"
     value={employees.length}
     icon={<Users size={18}/>}
     color="bg-blue-100 text-blue-600"
    />

    <StatCard
     title="Active Today"
     value={activeTodayCount}
     icon={<UserCheck size={18}/>}
     color="bg-green-100 text-green-600"
    />

    <StatCard
     title="New This Month"
     value={newThisMonthCount}
     icon={<UserPlus size={18}/>}
     color="bg-purple-100 text-purple-600"
    />

   </div>

   {/* TABLE */}
   <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

    <div className="px-6 py-4 bg-gray-50 flex justify-between">
     <div>
      <h2 className="font-semibold">Employee</h2>
      <p className="text-xs text-gray-500">View and manage employee data</p>
     </div>
     <div className="text-sm text-gray-500">{employees.length} records</div>
    </div>

    <div className="h-[520px] overflow-auto">
     {loading
      ? <TableSkeleton/>
      : <CommonTable columns={columns} data={employees}/>
     }
    </div>

   </div>

   {/* DOCUMENT MODAL */}
   <DocumentViewModal
    open={openModal}
    onClose={()=>setOpenModal(false)}
    documents={selectedDocs}
   />

  </div>
 )
}

/* ======================================================
   COPY FIELD COMPONENT
====================================================== */

function CopyField({value}){
 const [copied,setCopied]=useState(false)

 const handleCopy=async()=>{
  try{
   await navigator.clipboard.writeText(value || "")
   setCopied(true)
   setTimeout(()=>setCopied(false),1500)
  }catch{
   alert("Copy failed")
  }
 }

 return(
  <div className="flex items-center gap-2">
   <span className="truncate">{value}</span>

   <button
    onClick={handleCopy}
    className="p-1 rounded hover:bg-gray-200"
    title="Copy"
   >
    {copied ? <Check size={14}/> : <Copy size={14}/>}
   </button>
  </div>
 )
}

/* ======================================================
   KPI CARD
====================================================== */

function StatCard({title,value,icon,color}){
 return(
  <div className="bg-white rounded-2xl shadow-md border p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
   <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${color}`}>
    {icon}
   </div>
   <div>
    <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mt-1">
     {value}
    </h2>
   </div>
  </div>
 )
}

/* ======================================================
   TABLE SKELETON
====================================================== */

function TableSkeleton(){
 return(
  <div className="p-4 sm:p-6 space-y-3">
   {[...Array(8)].map((_,i)=>(
    <div key={i} className="h-5 bg-gray-200 rounded animate-pulse"/>
   ))}
  </div>
 )
}