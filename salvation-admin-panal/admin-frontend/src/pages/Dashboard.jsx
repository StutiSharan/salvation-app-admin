import {useEffect,useState} from "react"
import {useNavigate} from "react-router-dom"
import {getCandidates,getEmployees} from "../api/AdminApi"
import Loader from "../components/Loader"
import {Line,Bar} from "react-chartjs-2"
import {
 Chart as ChartJS,
 CategoryScale,
 LinearScale,
 PointElement,
 LineElement,
 BarElement,
 Tooltip,
 Legend,
 Filler
} from "chart.js"

ChartJS.register(
 CategoryScale,
 LinearScale,
 PointElement,
 LineElement,
 BarElement,
 Tooltip,
 Legend,
 Filler
)

export default function Dashboard(){

 const navigate=useNavigate()

 const [candidates,setCandidates]=useState([])
 const [employees,setEmployees]=useState([])
 const [loading,setLoading]=useState(true)

 useEffect(()=>{ loadData() },[])

 const loadData=async()=>{
  try{
   const [candRes,empRes]=await Promise.all([
    getCandidates(),
    getEmployees()
   ])
   setCandidates(candRes.data)
   setEmployees(empRes.data)
  }finally{
   setLoading(false)
  }
 }

 if(loading){
  return <Loader fullScreen/>
 }

 // ================= DATE HELPERS =================
const last2Days=new Date()
last2Days.setDate(last2Days.getDate()-2)
last2Days.setHours(0,0,0,0)


 const last7Days=[...Array(7)].map((_,i)=>{
  const d=new Date()
  d.setDate(d.getDate()-(6-i))
  return d
 })

 const formatDay=(d)=>d.getDate()

 const countByDate=(data,field)=>{
  return last7Days.map(day=>{
   return data.filter(item=>{
    if(!item[field]) return false
    const itemDate=new Date(item[field])
    return itemDate.toDateString()===day.toDateString()
   }).length
  })
 }

 // ================= KPI =================

 const newCandidates=candidates.filter(
  c=>new Date(c.createdAt)>=last2Days
 )

const newEmployeeLogins=employees.filter(emp=>{
 return (
  emp.createdAt &&
  new Date(emp.createdAt)>=last2Days &&   // new employee
  emp.lastLoginAt &&
  new Date(emp.lastLoginAt)>=last2Days    // logged in
 )
})


 // ================= CHART =================

 const chartOptions={
  responsive:true,
  maintainAspectRatio:false,
  plugins:{ legend:{display:false} },
  scales:{
   x:{ grid:{display:false} },
   y:{ grid:{color:"#EEF2F7"}, beginAtZero:true }
  }
 }

 const candidateChart={
  labels:last7Days.map(formatDay),
  datasets:[{
   data:countByDate(candidates,"createdAt"),
   borderColor:"#0F2747",
   backgroundColor:"rgba(15,39,71,0.15)",
   fill:true,
   tension:0.4
  }]
 }

 const employeeChart={
  labels:last7Days.map(formatDay),
  datasets:[{
   data:countByDate(employees,"lastLoginAt"),
   backgroundColor:"#0F2747",
   borderRadius:6
  }]
 }

 return(
  <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">

   {/* HEADER */}
   <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6 sm:mb-8">
    Admin Dashboard
   </h1>

   {/* ================= KPI ================= */}

   <div className="
    grid gap-4 sm:gap-6 mb-8 sm:mb-10
    grid-cols-2
    sm:grid-cols-2
    lg:grid-cols-3
    xl:grid-cols-4
   ">

    <KpiCard
     title="Total Candidates"
     value={candidates.length}
     onClick={()=>navigate("/analytics/allCandidates")}
    />

    <KpiCard
     title="Total Employees"
     value={employees.length}
     onClick={()=>navigate("/analytics/allEmployees")}
    />

    <KpiCard
     title="New Candidates"
     value={newCandidates.length}
     badge="LAST 2 DAYS"
     onClick={()=>navigate("/analytics/newCandidates")}
    />

   <KpiCard
 title="New Employee Logins"
 value={newEmployeeLogins.length}
 badge="LAST 2 DAYS"
 onClick={()=>navigate("/analytics/employeeLogins")}
/>


   </div>

   {/* ================= CHARTS ================= */}

   <div className="
    grid gap-6 lg:gap-8
    grid-cols-1
    lg:grid-cols-2
   ">

    <ChartCard title="Candidate Registrations">
     <Line data={candidateChart} options={chartOptions}/>
    </ChartCard>

    <ChartCard title="Employee Login Activity">
     <Bar data={employeeChart} options={chartOptions}/>
    </ChartCard>

   </div>

  </div>
 )
}

/* ======================================================
 KPI CARD
====================================================== */

function KpiCard({title,value,badge,onClick}){
 return(
  <div
   onClick={onClick}
   className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition cursor-pointer"
  >
   {badge && (
    <span className="absolute top-3 left-3 text-[10px] sm:text-xs bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full font-medium">
     {badge}
    </span>
   )}

   <div className="mt-4 sm:mt-6">
    <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
    <h2 className="text-2xl sm:text-3xl font-semibold mt-1 sm:mt-2 text-[#0F2747]">
     {value}
    </h2>
   </div>
  </div>
 )
}

/* ======================================================
 CHART CARD
====================================================== */

function ChartCard({title,children}){
 return(
  <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-sm">

   <span className="absolute top-3 right-3 text-[10px] sm:text-xs bg-blue-500 text-white px-2 sm:px-3 py-1 rounded-full">
    THIS WEEK
   </span>

   <h2 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-gray-700">
    {title}
   </h2>

   {/* responsive chart height */}
   <div className="h-[260px] sm:h-[320px] lg:h-[360px]">
    {children}
   </div>

  </div>
 )
}
