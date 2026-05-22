import {useState} from "react"
import {Link,useNavigate} from "react-router-dom"
import {loginAdmin} from "../../api/AdminApi"

export default function Login(){

 const navigate=useNavigate()

 const [email,setEmail]=useState("")
 const [password,setPassword]=useState("")
 const [loading,setLoading]=useState(false)

 const handleLogin=async(e)=>{
  e.preventDefault()
  setLoading(true)

  try{
   const res=await loginAdmin({email,password})

   // SAVE TOKEN
   localStorage.setItem("adminToken",res.data.token)

   // SAVE ADMIN INFO (optional)
   localStorage.setItem("adminUser",JSON.stringify(res.data.admin))

   // REDIRECT DASHBOARD
   navigate("/")

  }catch(err){
   alert(err.response?.data?.message || "Login failed")
  }finally{
   setLoading(false)
  }
 }

 return(
  <div className="min-h-screen flex items-center justify-center gradient-bg">

   <form
    onSubmit={handleLogin}
    className="bg-white/90 backdrop-blur-md p-8 rounded-xl2 shadow-glass w-96"
   >

    <h2 className="text-2xl font-semibold text-center mb-6">
     Admin Login
    </h2>

    <Input
     label="Email"
     type="email"
     value={email}
     onChange={e=>setEmail(e.target.value)}
    />

    <Input
     label="Password"
     type="password"
     value={password}
     onChange={e=>setPassword(e.target.value)}
    />

    <button className="w-full btn-primary mt-3">
     {loading ? "Logging in..." : "Login"}
    </button>

    <div className="flex justify-between text-sm mt-4">
     <Link to="/forgot-password" className="text-indigo-600">
      Forgot password?
     </Link>

     <Link to="/signup" className="text-indigo-600">
      Sign up
     </Link>
    </div>

   </form>

  </div>
 )
}

function Input({label,...props}){
 return(
  <div className="mb-4">
   <label className="text-sm text-gray-600 mb-1 block">{label}</label>
   <input
    {...props}
    required
    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
   />
  </div>
 )
}
