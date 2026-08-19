import {useEffect,useState,useMemo} from "react"
import axios from "../api/axios"
import CommonTable from "../components/CommonTable"
import DocumentViewModal from "../components/EmpDocumentViewModal"
import {ChevronLeft,ChevronRight} from "lucide-react"
import { exportToExcel } from "../utills/exportToExcel"

import {
 Users,
 UserCheck,
 UserPlus,
 RefreshCw,
 Eye,
 Copy,
 Check,
 Trash2,
  Edit,
 X
} from "lucide-react"
import { updateEmploymentDetails } from "../api/AdminApi"
export default function Employees(){

 const [employees,setEmployees]=useState([])
 const [employeeTotal, setEmployeeTotal] = useState(0)
 const [loading,setLoading]=useState(true)
 const [search,setSearch]=useState("")  
const [activeTodayCount,setActiveTodayCount]=useState(0)
const [newThisMonthCount,setNewThisMonthCount]=useState(0)
 const [openModal,setOpenModal]=useState(false)
 const [selectedDocs,setSelectedDocs]=useState(null)
const [exporting,setExporting] = useState(false)
 const [deleteModal,setDeleteModal]=useState(false)
 const [confirmModal,setConfirmModal]=useState(false)
 const [selectedEmp,setSelectedEmp]=useState(null)
 const [deleteReason,setDeleteReason]=useState("")
 const [deleteLoading,setDeleteLoading]=useState(false)
const [docTitle,setDocTitle]=useState("")
const [page,setPage]=useState(1)
const [employmentModal,setEmploymentModal] = useState(false)
const [savingEmployment,setSavingEmployment] = useState(false)

const [employmentForm,setEmploymentForm] = useState({
 designation:"",
 dateOfJoining:"",
 dateOfBirth:""
})

const [pagination,setPagination]=useState({
	total:0,
	page:1,
	limit:10,
	totalPages:1,
	hasNextPage:false,
	hasPrevPage:false
})
useEffect(() => {
  setPage(1)
}, [search])

useEffect(() => {
  fetchEmployees(page)
}, [page, search])

const fetchEmployees=async(currentPage=page)=>{
	try{
		setLoading(true)
const res=await axios.get(
  `/employees?page=${currentPage}&search=${encodeURIComponent(search)}`
)
		setEmployees(res.data.data || [])
setEmployeeTotal(res.data.pagination?.total || 0)

setActiveTodayCount(
  res.data.stats?.activeToday || 0
)

setNewThisMonthCount(
  res.data.stats?.newThisMonth || 0
)
    
		setPagination(res.data.pagination || {
			total:0,
			page:1,
			limit:10,
			totalPages:1,
			hasNextPage:false,
			hasPrevPage:false
		})
	}catch(err){
		console.log(err)
		setEmployees([])
	}finally{
		setLoading(false)
	}
}
const openEmploymentModal=(emp)=>{
 setSelectedEmp(emp)

 setEmploymentForm({
  designation:emp.designation || "",
  dateOfJoining: emp.dateOfJoining
 ? new Date(emp.dateOfJoining)
     .toISOString()
     .split("T")[0]
 : "",

dateOfBirth: emp.dateOfBirth
 ? new Date(emp.dateOfBirth)
     .toISOString()
     .split("T")[0]
 : ""
 })

 setEmploymentModal(true)
}
// const handleExport = async()=>{

//  try{

//   setExporting(true)

//   exportToExcel(
//    employees,
//    "Employees",
//    [
//     "_id",
//     "__v",
//     "otp",
//     "sessionExpiresAt"
//    ]
//   )

//  }catch(err){
//   console.log(err)
//  }finally{
//   setTimeout(()=>{
//    setExporting(false)
//   },500)
//  }

// }

const handleExport = async () => {
  try {
    setExporting(true)

    // Fetch ALL employees matching the current search
    const res = await axios.get(
      `/employees?page=1&limit=100000&search=${encodeURIComponent(search)}`
    )

    const allEmployees = res.data.data || []

    if (!allEmployees.length) {
      alert("No data found")
      return
    }

    exportToExcel(
      allEmployees,
      search
        ? `Employees_${search}`
        : "Employees",
      [
        "_id",
        "__v",
        "otp",
        "sessionExpiresAt"
      ]
    )

  } catch (err) {
    console.log("Export error:", err)
    alert(
      err.response?.data?.message ||
      "Failed to export employees"
    )
  } finally {
    setExporting(false)
  }
}
const saveEmploymentDetails = async()=>{
 try{

  setSavingEmployment(true)

  await updateEmploymentDetails(
   selectedEmp._id,
   employmentForm
  )

  await fetchEmployees(page)

  setEmploymentModal(false)

 }catch(err){
  console.log(err)
  alert(
   err.response?.data?.message ||
   "Failed to save details"
  )
 }finally{
  setSavingEmployment(false)
 }
}
 const openDeleteModal=(emp)=>{
  setSelectedEmp(emp)
  setDeleteReason("")
  setDeleteModal(true)
 }

 const handleDeleteConfirm=()=>{
  if(!deleteReason.trim()){
   alert("Please write delete reason")
   return
  }
  setDeleteModal(false)
  setConfirmModal(true)
 }

 const deleteEmployee=async()=>{
  try{
   setDeleteLoading(true)

   await axios.delete(`/employees/delete/${selectedEmp._id}`,{
    data:{
     reason:deleteReason,
     deletedBy:"Admin"
    }
   })

   setEmployees(prev=>prev.filter(emp=>emp._id!==selectedEmp._id))
   setConfirmModal(false)
   setSelectedEmp(null)
   setDeleteReason("")
  }catch(err){
   console.log(err)
   alert(err.response?.data?.message || "Delete failed")
  }finally{
   setDeleteLoading(false)
  }
 }

 const formatDate=(date)=>{
  return new Date(date).toLocaleDateString("en-GB",{
   day:"numeric",
   month:"short",
   year:"numeric"
  })
 }
const formatTime = (date) => {
  if (!date) return "-"

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
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
  return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()
 }



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
	label:"Father Name",
	key:"fatherName",
	sortable:true,
	render:(row)=><CopyField value={row.fatherName || "-"}/>
},
  {
   label:"Login Mobile",
   key:"loginMobile",
   render:(row)=><CopyField value={row.loginMobile}/>
  },
  {label:"Address",key:"address"},
{
	label:"Check In",
	key:"checkinLocation",
	render:(row)=>{
		const value=row.checkinLocation

		if(!value?.latitude || !value?.longitude){
			return (
				<span className="text-gray-400 text-xs">
					Not Checked In
				</span>
			)
		}

		const mapUrl=`https://www.google.com/maps?q=${value.latitude},${value.longitude}`

		return(
			<button
				onClick={()=>window.open(mapUrl,"_blank")}
				className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
			>
				View Check In
			</button>
		)
	}
},
{
	label:"Check Out",
	key:"checkoutLocation",
	render:(row)=>{
		const value=row.checkoutLocation

		if(!value?.latitude || !value?.longitude){
			return (
				<span className="text-gray-400 text-xs">
					Not Checked Out
				</span>
			)
		}

		const mapUrl=`https://www.google.com/maps?q=${value.latitude},${value.longitude}`

		return(
			<button
				onClick={()=>window.open(mapUrl,"_blank")}
				className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
			>
				View Check Out
			</button>
		)
	}
},
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
		<div className="flex gap-2 justify-center">
			{row.employeeUploads && (
				<button
					onClick={()=>{
						setSelectedDocs(row.employeeUploads)
                  setDocTitle("Employee Uploads")
						setOpenModal(true)
					}}
					className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs flex items-center gap-1"
				>
					<Eye size={14}/>
					Emp
				</button>
			)}

			{row.companyUploads && (
				<button
					onClick={()=>{
						setSelectedDocs(row.companyUploads)
                  setDocTitle("Company Uploads")
						setOpenModal(true)
					}}
					className="px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-xs flex items-center gap-1"
				>
					<Eye size={14}/>
					Company
				</button>
			)}
		</div>
	)
},
  {
   label:"Action",
   key:"action",
  render:(row)=>(
 <div className="flex gap-2">

<button
 onClick={()=>openEmploymentModal(row)}
 className="px-3 py-2 bg-blue-500 text-gray-100 hover:bg-blue-100  hover:text-blue-800 rounded-lg text-xs font-medium"
>
 Employment Details
</button>

  <button
   onClick={()=>openDeleteModal(row)}
   className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
   title="Delete employee"
  >
   <Trash2 size={16}/>
  </button>

 </div>
)
  },
  {
  label: "Check In At",
  key: "checkedInAt",
  render: (row) =>
    row.checkinLocation?.checkedInAt
      ? formatTime(row.checkinLocation.checkedInAt)
      : "-"
},
{
  label: "Check Out At",
  key: "checkedOutAt",
  render: (row) =>
    row.checkoutLocation?.checkedOutAt
      ? formatTime(row.checkoutLocation.checkedOutAt)
      : "-"
},
  
 ]

 return(
  <div className="py-4 px-4 bg-gray-50 min-h-screen space-y-6" style={{zoom:"0.85"}}>

   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
    <div>
     <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800">
      Employees
     </h1>
     <p className="text-gray-500 text-sm mt-1">
      Manage employee records and activity
     </p>
    </div>

   <div className="flex gap-2">

  <button
    onClick={handleExport}
    disabled={exporting}
    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
  >
    {exporting ? "Exporting..." : "Export Excel"}
  </button>

  <button
    onClick={fetchEmployees}
    disabled={loading}
    className="flex items-center gap-2 bg-[#0F2747] text-white px-4 py-2 rounded-lg disabled:opacity-50"
  >
    <RefreshCw size={16}/>
    {loading ? "Refreshing..." : "Refresh"}
  </button>

</div>
   </div>

   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
<StatCard
  title="Total Employees"
  value={employeeTotal}
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

   <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
    <div className="px-6 py-4 bg-gray-50 flex justify-between">
     <div>
      <h2 className="font-semibold">Employee</h2>
      <p className="text-xs text-gray-500">View and manage employee data</p>
     </div>
<div className="text-sm text-gray-500">
  {employeeTotal} records
</div>
    </div>

    <div className="h-[520px] overflow-auto">
     {loading ? <TableSkeleton/> : <CommonTable
    columns={columns}
    data={employees}
    search={search}
    onSearch={setSearch}
/>}
    </div>
    <Pagination
	page={page}
	pagination={pagination}
	onPageChange={setPage}
/>
   </div>

   <DocumentViewModal
    open={openModal}
    onClose={()=>setOpenModal(false)}
    documents={selectedDocs}
   />

   {deleteModal && selectedEmp && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
     <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
       <h2 className="text-lg font-semibold text-gray-800">Delete Employee</h2>
       <button onClick={()=>setDeleteModal(false)} className="p-1 hover:bg-gray-100 rounded">
        <X size={18}/>
       </button>
      </div>

      <div className="space-y-2 text-sm mb-4">
       <p><span className="font-medium">Employee ID:</span> {selectedEmp.employeeId}</p>
       <p><span className="font-medium">Name:</span> {selectedEmp.fullName || "N/A"}</p>
      </div>

      <label className="text-sm font-medium text-gray-700">Reason</label>
      <textarea
       value={deleteReason}
       onChange={(e)=>setDeleteReason(e.target.value)}
       placeholder="Write reason for deleting employee..."
       className="w-full mt-2 border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-200"
       rows={4}
      />

      <div className="flex justify-end gap-3 mt-5">
       <button
        onClick={()=>setDeleteModal(false)}
        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
       >
        Cancel
       </button>
       <button
        onClick={handleDeleteConfirm}
        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
       >
        Delete
       </button>
      </div>
     </div>
    </div>
   )}

   {confirmModal && selectedEmp && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
     <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h2>
      <p className="text-sm text-gray-600">
       Are you sure you want to delete <b>{selectedEmp.fullName}</b>?
      </p>

      <div className="flex justify-end gap-3 mt-6">
       <button
     onClick={()=>setConfirmModal(false)}
        disabled={deleteLoading}
        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
       >
        Cancel
       </button>
       <button
        onClick={deleteEmployee}
        disabled={deleteLoading}
        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
       >
        {deleteLoading ? "Deleting..." : "Yes, Delete"}
       </button>
      </div>
     </div>
    </div>
   )}
{employmentModal && selectedEmp && (
 <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <div className="bg-white w-full max-w-md rounded-2xl p-6">

   <div className="flex justify-between items-center mb-5">
    <h2 className="text-lg font-semibold">
      Employment Details
    </h2>

    <button
      onClick={()=>setEmploymentModal(false)}
    >
      <X size={18}/>
    </button>
   </div>

   <div className="space-y-4">

    <div>
      <label className="text-sm font-medium">
        Designation
      </label>

      <input
        type="text"
        value={employmentForm.designation}
        onChange={(e)=>
          setEmploymentForm(prev=>({
            ...prev,
            designation:e.target.value
          }))
        }
        className="w-full border rounded-lg p-2 mt-1"
      />
    </div>

    <div>
      <label className="text-sm font-medium">
        Date Of Joining
      </label>

      <input
        type="date"
        value={employmentForm.dateOfJoining}
        onChange={(e)=>
          setEmploymentForm(prev=>({
            ...prev,
            dateOfJoining:e.target.value
          }))
        }
        className="w-full border rounded-lg p-2 mt-1"
      />
    </div>

    <div>
      <label className="text-sm font-medium">
        Date Of Birth
      </label>

      <input
        type="date"
        value={employmentForm.dateOfBirth}
        onChange={(e)=>
          setEmploymentForm(prev=>({
            ...prev,
            dateOfBirth:e.target.value
          }))
        }
        className="w-full border rounded-lg p-2 mt-1"
      />
    </div>

   </div>

   <div className="flex justify-end gap-3 mt-6">

    <button
      onClick={()=>setEmploymentModal(false)}
      className="px-4 py-2 bg-gray-100 rounded-lg"
    >
      Cancel
    </button>

 <button
 onClick={saveEmploymentDetails}
 disabled={savingEmployment}
 className="px-4 py-2 bg-[#0F2747] text-white rounded-lg disabled:opacity-50"
>
 {savingEmployment ? "Saving..." : "Save"}
</button>

   </div>

  </div>

 </div>
)}
  </div>
 )
}

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
   <button onClick={handleCopy} className="p-1 rounded hover:bg-gray-200" title="Copy">
    {copied ? <Check size={14}/> : <Copy size={14}/>}
   </button>
  </div>
 )
}

function StatCard({title,value,icon,color}){
 return(
  <div className="bg-white rounded-2xl shadow-md border p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
   <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${color}`}>
    {icon}
   </div>
   <div>
    <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mt-1">{value}</h2>
   </div>
  </div>
 )
}

function TableSkeleton(){
 return(
  <div className="p-4 sm:p-6 space-y-3">
   {[...Array(8)].map((_,i)=>(
    <div key={i} className="h-5 bg-gray-200 rounded animate-pulse"/>
   ))}
  </div>
 )
}

function Pagination({page,pagination,onPageChange}){
	const goToPage=(newPage)=>{
		if(newPage<1 || newPage>pagination.totalPages) return
		onPageChange(newPage)
	}

	return(
		<div className="px-4 py-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
			<div className="text-xs text-gray-500">
				Page <span className="font-semibold text-[#0F2747]">{pagination.page}</span>
				{" "}of <span className="font-semibold text-[#0F2747]">{pagination.totalPages}</span>
				{" "}• Total <span className="font-semibold text-[#0F2747]">{pagination.total}</span>
			</div>

			<div className="flex items-center gap-1">
				<button
					onClick={()=>goToPage(page-1)}
					disabled={!pagination.hasPrevPage}
					className="h-8 px-2 rounded-lg text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
				>
					<ChevronLeft size={15}/>
					Prev
				</button>

				{Array.from({length:pagination.totalPages},(_,i)=>i+1)
					.slice(Math.max(0,page-2),Math.min(pagination.totalPages,page+1))
					.map(num=>(
						<button
							key={num}
							onClick={()=>goToPage(num)}
							className={`h-8 w-8 rounded-lg text-xs font-medium ${
								page===num
									?"bg-[#0F2747] text-white"
									:"text-gray-600 hover:bg-gray-100"
							}`}
						>
							{num}
						</button>
					))
				}

				<button
					onClick={()=>goToPage(page+1)}
					disabled={!pagination.hasNextPage}
					className="h-8 px-2 rounded-lg text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
				>
					Next
					<ChevronRight size={15}/>
				</button>
			</div>

      
		</div>
	)
}