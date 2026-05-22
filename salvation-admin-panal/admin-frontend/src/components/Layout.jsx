import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import { Menu } from "lucide-react"

export default function Layout(){

 const [open,setOpen]=useState(false)

 useEffect(()=>{
  document.body.style.overflow=open ? "hidden" : "auto"
 },[open])

 return(
  <div className="min-h-screen bg-gray-50">

   {/* MOBILE TOP NAV */}
   <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white shadow-sm flex items-center px-4 z-40">
    <button
     onClick={()=>setOpen(true)}
     className="p-2 rounded-md hover:bg-gray-100"
    >
     <Menu size={22}/>
    </button>

    <h1 className="ml-3 font-semibold text-gray-800">
     Salvation Admin
    </h1>
   </header>

   {/* DESKTOP SIDEBAR */}
   <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-30">
    <Sidebar/>
   </aside>

   {/* MOBILE DRAWER */}
   <div className={`fixed inset-0 z-50 lg:hidden ${open?"pointer-events-auto":"pointer-events-none"}`}>
    <div
     onClick={()=>setOpen(false)}
     className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${open?"opacity-100":"opacity-0"}`}
    />
    <aside className={`absolute left-0 top-0 h-full w-64 bg-[#0F2747] transform transition-transform ${open?"translate-x-0":"-translate-x-full"}`}>
     <Sidebar closeMobile={()=>setOpen(false)}/>
    </aside>
   </div>

   {/* PAGE CONTENT */}
   <main className="pt-14 lg:pt-0 lg:ml-64 min-h-screen overflow-x-hidden">
    <Outlet/>
   </main>

  </div>
 )
}
