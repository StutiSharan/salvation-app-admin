import {useParams,useNavigate} from "react-router-dom"
import {useEffect,useState,useMemo} from "react"
import {getCandidates,getEmployees} from "../api/AdminApi"
import {Users,Database,Clock,ArrowLeft} from "lucide-react"
import CommonTable from "../components/CommonTable"
import Loader from "../components/Loader"
export default function AnalyticsPage(){

	const {type}=useParams()
	const navigate=useNavigate()

	const [data,setData]=useState([])
	const [loading,setLoading]=useState(true)

	useEffect(()=>{ loadData() },[type])

	const loadData=async()=>{
		setLoading(true)

		const [candRes,empRes]=await Promise.all([
			getCandidates(),
			getEmployees()
		])

		const candidates=candRes.data
		const employees=empRes.data

		const last2Days=new Date()
		last2Days.setDate(last2Days.getDate()-2)
		last2Days.setHours(0,0,0,0)

		switch(type){
			case "allCandidates": setData(candidates); break
			case "allEmployees": setData(employees); break
			case "newCandidates":
				setData(candidates.filter(c=>new Date(c.createdAt)>=last2Days))
				break
			case "employeeLogins":
				setData(employees.filter(e=>{
					return (
						e.createdAt && new Date(e.createdAt)>=last2Days &&
						e.lastLoginAt && new Date(e.lastLoginAt)>=last2Days
					)
				}))
				break
			default: setData([])
		}

		setLoading(false)
	}

	// ================= HIDE UNWANTED FIELDS =================

	const HIDDEN_FIELDS=[
		"__v","updatedAt",
		"profilePhoto","employeeUploads",
		"companyUploads","otp","otpVerified",
		"aadhaarFilePath","resumeFilePath","checkinLocation","_id"
	]

	// ================= DATE FORMAT =================

	const formatDate=(value)=>{
		return new Date(value).toLocaleDateString("en-GB",{
			day:"numeric",
			month:"short",
			year:"numeric"
		})
	}

    const DATE_FIELDS=[
	"createdAt",
	"updatedAt",
	"lastLoginAt",
	"loginAt"
]

const formatValue=(value,key)=>{

	if(value===null || value===undefined || value==="") return "-"

	// mongodb object id
	if(typeof value==="object" && value.$oid){
		return value.$oid
	}

	// format only real date fields
	if(DATE_FIELDS.includes(key)){
		return formatDate(value)
	}

	if(typeof value==="object") return "-"

	return value
}


	// ================= DYNAMIC COLUMNS (FIXED) =================
	// IMPORTANT: collect keys from ALL rows (not first row)

	const columns=useMemo(()=>{

		if(!data.length) return []

		const allKeys=new Set()

		data.forEach(row=>{
			Object.keys(row).forEach(key=>{
				if(!HIDDEN_FIELDS.includes(key)){
					allKeys.add(key)
				}
			})
		})

		return [...allKeys].map(key=>({
			key,
			label:key.replace(/([A-Z])/g," $1").toUpperCase(),
			sortable:true,
			render:(row)=>formatValue(row[key],key)
		}))

	},[data])

	const title=type.replace(/([A-Z])/g," $1")

	if(loading){
		return <Loader size={30}/>
	}

	return(
		<div className="p-6 space-y-5">

			{/* ================= HEADER ================= */}
			<div className="flex justify-between items-center">

				<div>
					<h1 className="text-2xl font-semibold text-gray-800 capitalize">
						{title}
					</h1>
					<p className="text-gray-500 text-sm">
						View and manage {title.toLowerCase()} records
					</p>
				</div>

				<button
					onClick={()=>navigate(-1)}
					className="flex items-center gap-2 bg-[#0F2747] text-white px-4 py-2 rounded-lg shadow hover:bg-[#0c1f3a]"
				>
					<ArrowLeft size={16}/>
					Back
				</button>

			</div>

			{/* ================= KPI ================= */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

				<StatCard icon={<Users size={18}/>} label="Total" value={data.length}/>
				<StatCard icon={<Database size={18}/>} label="Dataset" value={title}/>
				<StatCard icon={<Clock size={18}/>} label="Updated" value={formatDate(new Date())}/>

			</div>

			{/* ================= TABLE ================= */}
			<CommonTable columns={columns} data={data}/>

		</div>
	)
}


/* ================= KPI CARD ================= */

function StatCard({icon,label,value}){
	return(
		<div className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3">

			<div className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg text-[#0F2747]">
				{icon}
			</div>

			<div>
				<p className="text-xs text-gray-500">{label}</p>
				<h2 className="text-lg font-semibold text-[#0F2747]">
					{value}
				</h2>
			</div>

		</div>
	)
}
