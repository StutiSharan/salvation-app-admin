import axios from "./axios"
import { tokenCheck } from "../utills/tokenCheck"

/*
==============================
 AUTH APIs
==============================
*/

export const loginAdmin=(data)=>{
 return axios.post("/auth/login",data)
}

export const signupAdmin=(data)=>{
 return axios.post("/auth/signup",data)
}


/*
==============================
 EMPLOYEE APIs
==============================
*/

export const getEmployees=()=>{
 if(!tokenCheck()) return
 return axios.get("/employees")
}

export const createEmployee=(data)=>{
 if(!tokenCheck()) return
 return axios.post("/employees",data)
}


/*
==============================
 CANDIDATE APIs
==============================
*/

export const getCandidates=()=>{
 if(!tokenCheck()) return
 return axios.get("/candidates")
}


/*
==============================
 DOCUMENT UPLOAD
==============================
*/

export const uploadDocument=(formData)=>{
 if(!tokenCheck()) return
 return axios.post("/upload",formData,{
  headers:{ "Content-Type":"multipart/form-data" }
 })
}

export const getDocumentUrl=(key)=>{
 if(!tokenCheck()) return
 return axios.get(`/documents/signed-url?key=${key}`)
}

export const generateEmployee=(data)=>{
 if(!tokenCheck()) return
 return axios.post("/employees/generate",data)
}

export const uploadSalaryFolder=(formData)=>{
 if(!tokenCheck()) return
 return axios.post(
  "/employees/salary-slip/bulk-folder",
  formData,
  {
   headers:{
    "Content-Type":"multipart/form-data"
   }
  }
 )
}
export const deleteDocument=(data)=>{
 if(!tokenCheck()) return
 return axios.delete("/documents/delete",{data})
}

export const replaceDocument=(formData)=>{
 if(!tokenCheck()) return
 return axios.post("/documents/replace",formData,{
  headers:{ "Content-Type":"multipart/form-data" }
 })
}