export default function Header(){

 const logout=()=>{
  localStorage.clear()
  window.location="/login"
 }

 return(
  <div className="bg-brand text-white px-8 py-4 flex justify-between items-center">

   <h2 className="text-lg font-semibold">
    Dashboard
   </h2>

   <button
    onClick={logout}
    className="bg-danger px-5 py-2 rounded-xl"
   >
    Logout
   </button>

  </div>
 )
}
