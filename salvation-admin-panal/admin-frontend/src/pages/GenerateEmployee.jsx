import {useState} from "react"
import {UserPlus2,Loader2,RefreshCw} from "lucide-react"
import {toast} from "react-toastify"
import {createEmployee} from "../api/AdminApi"

export default function GenerateEmployee(){

 const [mobile,setMobile]=useState("")
 const [loading,setLoading]=useState(false)
 const [generatedId,setGeneratedId]=useState(null)

 /* ================= GENERATE ================= */

 const handleGenerate=async()=>{

  if(!mobile.trim()){
   toast.error("Enter login mobile")
   return
  }

  try{
   setLoading(true)

   const res=await createEmployee({
    loginMobile:mobile
   })

   if(!res) return

   setGeneratedId(res.data.employeeId)
   toast.success("Employee created successfully")
   setMobile("")

  }catch(err){
   toast.error(err?.response?.data?.message || "Failed to generate employee")
  }
  finally{
   setLoading(false)
  }
 }

 /* ================= REFRESH ================= */

 const handleRefresh=()=>{
  setMobile("")
  setGeneratedId(null)
  toast.info("Form reset")
 }

 return(
  <div className="min-h-screen bg-gray-50 p-6 space-y-6">

   {/* ================= HEADER ================= */}
   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

    <div>
     <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800">
      Generate Employee ID
     </h1>
     <p className="text-gray-500 text-sm mt-1">
      Create new employee account with unique ID
     </p>
    </div>

    <button
     onClick={handleRefresh}
     className="flex items-center gap-2 bg-[#0F2747] text-white px-4 py-2 rounded-lg shadow hover:bg-[#14345F] transition w-full sm:w-auto"
    >
     <RefreshCw size={16}/>
     Refresh
    </button>

   </div>

   {/* ================= FORM CARD ================= */}
   <div className="flex justify-center mt-15">

    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-8 space-y-6">

     {/* MOBILE INPUT */}
     <div>
      <label className="text-sm font-medium text-gray-600 mb-1 block">
       Login Mobile Number
      </label>

      <input
       value={mobile}
       onChange={e=>setMobile(e.target.value)}
       placeholder="Enter employee mobile"
       className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#0F2747] outline-none"
      />
     </div>

     {/* GENERATE BUTTON */}
     <button
      onClick={handleGenerate}
      disabled={loading}
      className="
       w-full bg-[#0F2747] text-white py-3 rounded-xl font-medium
       hover:bg-[#14345F] transition disabled:opacity-50
       flex items-center justify-center gap-2
      "
     >
      {loading && <Loader2 className="animate-spin" size={18}/>}
      {loading ? "Generating..." : "Generate Employee ID"}
     </button>

     {/* RESULT */}
     {generatedId && (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">

       <p className="text-sm text-gray-600">
        Employee created successfully
       </p>

       <p className="text-2xl font-semibold text-green-700 mt-1">
        {generatedId}
       </p>

      </div>
     )}

    </div>

   </div>

  </div>
 )
}
