import {useState} from "react"
import {Link,useNavigate} from "react-router-dom"

export default function Signup(){

 const navigate=useNavigate()

 const [form,setForm]=useState({
  name:"",
  email:"",
  password:""
 })

 const handleChange=(e)=>{
  setForm({...form,[e.target.name]:e.target.value})
 }

 const handleSignup=(e)=>{
  e.preventDefault()

  console.log(form)
  navigate("/login")
 }

 return(
  <div className="min-h-screen flex items-center justify-center gradient-bg">

   <form
    onSubmit={handleSignup}
    className="bg-white/90 backdrop-blur-md p-8 rounded-xl2 shadow-glass w-96"
   >

    <h2 className="text-2xl font-semibold text-center mb-6">
     Create Admin Account
    </h2>

    <Input label="Full Name" name="name" onChange={handleChange}/>
    <Input label="Email" type="email" name="email" onChange={handleChange}/>
    <Input label="Password" type="password" name="password" onChange={handleChange}/>

    <button className="w-full btn-primary mt-3">
     Sign Up
    </button>

    <p className="text-center text-sm mt-4">
     Already have account?
     <Link to="/login" className="text-indigo-600 ml-1">
      Login
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
