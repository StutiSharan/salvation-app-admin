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

export const getEmployees=(page=1)=>{
	if(!tokenCheck()) return
	return axios.get(`/employees?page=${page}`)
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

export const getCandidates = (page = 1, search = "") => {
  if (!tokenCheck()) return

  return axios.get(
    `/candidates?page=${page}&search=${encodeURIComponent(search)}`
  )
}
export const updateCandidate = async (id, data) => {
  if (!tokenCheck()) return;

  return axios.put(
    `/candidates/${id}`,
    data
  );
};
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
export const updateEmploymentDetails = async(id,data)=>{
 await tokenCheck()

 return axios.put(
  `/employees/${id}/employment-details`,
  data
 )
}
export const bulkImportEmployees = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post(
    "/employees/bulk-import",
    formData
  );
};