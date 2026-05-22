import {useState} from "react"
import {Link} from "react-router-dom"

export default function ForgotPassword(){

 const [email,setEmail]=useState("")

 const handleSubmit=(e)=>{
  e.preventDefault()
  console.log(email)
  alert("Reset link sent (connect backend)")
 }

 return(
  <div className="min-h-screen flex items-center justify-center gradient-bg">

   <form
    onSubmit={handleSubmit}
    className="bg-white/90 backdrop-blur-md p-8 rounded-xl2 shadow-glass w-96"
   >

    <h2 className="text-2xl font-semibold text-center mb-6">
     Reset Password
    </h2>

    <Input
     label="Enter your email"
     type="email"
     value={email}
     onChange={e=>setEmail(e.target.value)}
    />

    <button className="w-full btn-primary mt-3">
     Send Reset Link
    </button>

    <p className="text-center text-sm mt-4">
     <Link to="/login" className="text-indigo-600">
      Back to login
     </Link>
    </p>

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
