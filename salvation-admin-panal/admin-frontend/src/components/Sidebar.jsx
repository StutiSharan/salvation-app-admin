import {NavLink,useNavigate} from "react-router-dom"
import {
 LayoutDashboard,
 Users,
 UserCheck,
 Upload,
 LogOut,
  UserPlus2 ,
  File,
} from "lucide-react"

export default function Sidebar({closeMobile}){

 const navigate=useNavigate()

 const logout=()=>{
  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminUser")
  navigate("/login")
  closeMobile?.()
 }

 return(
  <div className="w-64 h-full bg-[#0F2747] text-white flex flex-col">

   {/* LOGO */}
   <div className="p-6 border-b border-white/10">
    <h1 className="text-xl font-semibold">
     Salvation Admin
    </h1>
   </div>

   {/* MENU */}
   <div className="flex-1 p-4 space-y-2">

    <MenuItem to="/" closeMobile={closeMobile} icon={<LayoutDashboard size={18}/>}>
     Dashboard
    </MenuItem>

    <MenuItem to="/employees" closeMobile={closeMobile} icon={<Users size={18}/>}>
     Employees
    </MenuItem>

    <MenuItem to="/candidates" closeMobile={closeMobile} icon={<UserCheck size={18}/>}>
     Candidates
    </MenuItem>
    <MenuItem
 to="/generate-employee"
 closeMobile={closeMobile}
 icon={<UserPlus2 size={18}/>}
>
 Generate Emp ID
</MenuItem>

    <MenuItem to="/upload" closeMobile={closeMobile} icon={<Upload size={18}/>}>
     Upload Documents
    </MenuItem>

<MenuItem to="/documents" icon={<File size={18}/>}>
 Document Manager
</MenuItem>
   </div>

   {/* LOGOUT */}
   <div className="p-4 border-t border-white/10">
    <button
     onClick={logout}
     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition"
    >
     <LogOut size={18}/>
     Logout
    </button>
   </div>

  </div>
 )
}

function MenuItem({to,icon,children,closeMobile}){
 return(
  <NavLink
   to={to}
   onClick={()=>closeMobile?.()}
   className={({isActive})=>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition
     ${isActive?"bg-white/15 font-medium":"hover:bg-white/10"}`
   }
  >
   {icon}
   {children}
  </NavLink>
 )
}
