import { Navigate, Outlet } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import { toast } from "react-toastify"

export default function ProtectedRoute(){

	const token = localStorage.getItem("adminToken")

	// ================= TOKEN MISSING =================
	if(!token){
		toast.error("Unauthorized — please login")
		return <Navigate to="/login" replace/>
	}

	try{
		const decoded = jwtDecode(token)
		const currentTime = Date.now() / 1000

		// ================= TOKEN EXPIRED =================
		if(decoded.exp < currentTime){
			localStorage.removeItem("adminToken")
			toast.error("Session expired — login again")
			return <Navigate to="/login" replace/>
		}

	}catch{
		localStorage.removeItem("adminToken")
		toast.error("Invalid authentication token")
		return <Navigate to="/login" replace/>
	}

	return <Outlet/>
}
