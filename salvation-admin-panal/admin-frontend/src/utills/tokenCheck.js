import { jwtDecode } from "jwt-decode"
import { toast } from "react-toastify"

const logout = () => {
	localStorage.removeItem("adminToken")
	localStorage.removeItem("admin")

	setTimeout(()=>{
		window.location.replace("/login")
	},1500)
}

export const tokenCheck = () => {

	const token = localStorage.getItem("adminToken")

	if(!token){
		toast.error("Unauthorized — token not found")
		logout()
		return false
	}

	try{
		const decoded = jwtDecode(token)

		if(decoded.exp * 1000 < Date.now()){
			toast.error("Session expired — please login again")
			logout()
			return false
		}

		return true

	}catch{
		toast.error("Invalid authentication token")
		logout()
		return false
	}
}
