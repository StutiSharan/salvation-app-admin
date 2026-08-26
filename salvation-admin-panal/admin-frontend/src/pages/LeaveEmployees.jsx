import {useEffect,useState} from "react"
import CommonTable from "../components/CommonTable"
import {ChevronLeft,ChevronRight} from "lucide-react"
import { exportToExcel } from "../utills/exportToExcel"
export default function LeaveEmployees(){
	const [data,setData]=useState([])
	const [loading,setLoading]=useState(true)
	const [page,setPage]=useState(1)
	const [exporting,setExporting] = useState(false)
	const [restoreModal, setRestoreModal] = useState(false)
const [selectedEmployee, setSelectedEmployee] = useState(null)
const [restoring, setRestoring] = useState(false)
	const [pagination,setPagination]=useState({
		total:0,
		page:1,
		limit:10,
		totalPages:1,
		hasNextPage:false,
		hasPrevPage:false
	})
const handleExport = async()=>{

 try{

  setExporting(true)

  exportToExcel(
   tableData,
   "LeaveEmployees",
   ["_id"]
  )

 }catch(err){
  console.log(err)
 }finally{

  setTimeout(()=>{
   setExporting(false)
  },500)

 }

}
	const fetchLeaveEmployees=async(currentPage=page)=>{
		try{
			setLoading(true)

			const token=localStorage.getItem("adminToken")

			const res=await fetch(
				`${import.meta.env.VITE_API_URL}/employees/leave?page=${currentPage}`,
				{
					headers:{
						Authorization:`Bearer ${token}`
					}
				}
			)

			const result=await res.json()

			if(result.success){
				setData(result.data||[])
				setPagination(result.pagination||pagination)
			}
		}catch(err){
			console.error(err)
		}finally{
			setLoading(false)
		}
	}

	const restoreEmployee = async () => {
  if (!selectedEmployee) return

  try {
    setRestoring(true)

    const token = localStorage.getItem("adminToken")

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/employees/leave/${selectedEmployee._id}/restore`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    )

    const result = await res.json()

    if (result.success) {
      alert("Employee restored successfully")

      setRestoreModal(false)
      setSelectedEmployee(null)

      fetchLeaveEmployees(page)
    } else {
      alert(result.message || "Restore failed")
    }

  } catch (err) {
    console.error(err)
    alert("Restore failed")
  } finally {
    setRestoring(false)
  }
}

	useEffect(()=>{
		fetchLeaveEmployees(page)
	},[page])

	const tableData=data.map(item=>({
		_id:item._id,
		employeeId:item.employeeData?.employeeId||"-",
		fullName:item.employeeData?.fullName||"-",
		loginMobile:item.employeeData?.loginMobile||"-",
		mobile:item.employeeData?.mobile||"-",
		reason:item.reason||"-",
		deletedBy:item.deletedBy||"-",
		leftAt:item.leftAt?new Date(item.leftAt).toLocaleString():"-"
	}))

	const columns=[
		{label:"Employee ID",key:"employeeId"},
		{label:"Full Name",key:"fullName"},
		{label:"Login Mobile",key:"loginMobile"},
		{label:"Mobile",key:"mobile"},
		{label:"Reason",key:"reason"},
		{label:"Deleted By",key:"deletedBy"},
		{label:"Left At",key:"leftAt"},
		{
			label:"Action",
			key:"action",
			render:(row)=>(
				<button
  onClick={() => {
    setSelectedEmployee(row)
    setRestoreModal(true)
  }}
  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs"
>
  Restore
</button>
			)
		}
	]

	const goToPage=(newPage)=>{
		if(newPage<1 || newPage>pagination.totalPages) return
		setPage(newPage)
	}

	return(
		<div className="p-4 sm:p-6" style={{zoom:"0.89"}}>
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

	<div>
		<h1 className="text-2xl font-semibold text-[#0F2747]">
			Leave Employees
		</h1>

		<p className="text-sm text-gray-500 mt-1">
			Employees deleted from active employee list
		</p>
	</div>

	<button
		onClick={handleExport}
		disabled={exporting}
		className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
	>
		{exporting ? "Exporting..." : "Export Excel"}
	</button>

</div>

			{loading?(
				<div className="bg-white rounded-xl p-6 text-gray-500">
					Loading leave employees...
				</div>
			):(
				<>
					<CommonTable columns={columns} data={tableData}/>
<div className="mt-4 bg-white rounded-xl px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
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

		<div className="flex items-center gap-1">
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
		</div>

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
				</>
			)}

			{restoreModal && selectedEmployee && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">

        <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-600 text-xl">
            ↻
          </span>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Restore Employee?
          </h2>

          <p className="text-sm text-gray-500">
            Confirm employee restoration
          </p>
        </div>

      </div>

      {/* EMPLOYEE DETAILS */}
      <div className="bg-gray-50 border rounded-xl p-4 mb-5">

        <p className="text-sm text-gray-500">
          Employee ID
        </p>

        <p className="font-semibold text-[#0F2747] mb-3">
          {selectedEmployee.employeeId}
        </p>

        <p className="text-sm text-gray-500">
          Employee Name
        </p>

        <p className="font-semibold text-gray-800">
          {selectedEmployee.fullName}
        </p>

      </div>

      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to restore this employee?
        The employee will be moved back to the active employee list.
      </p>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3">

        <button
          onClick={() => {
            setRestoreModal(false)
            setSelectedEmployee(null)
          }}
          disabled={restoring}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={restoreEmployee}
          disabled={restoring}
          className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
        >
          {restoring ? "Restoring..." : "Yes, Restore"}
        </button>

      </div>

    </div>

  </div>
)}
		</div>
	)
}