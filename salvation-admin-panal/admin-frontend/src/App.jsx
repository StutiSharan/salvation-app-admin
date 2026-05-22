import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import GenerateEmployee from "./pages/GenerateEmployee"
import DocumentManager from "./pages/DocumentManager"

import Dashboard from "./pages/Dashboard"
import Employees from "./pages/Employees"
import Candidates from "./pages/Candidates"
import UploadDocuments from "./pages/UploadDocuments"
import AnalyticsPage from "./pages/AnalyticsPage"

import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import ForgotPassword from "./pages/auth/ForgotPassword"

export default function App(){
 return(
  <BrowserRouter>

   <ToastContainer position="top-right" autoClose={3000} theme="colored"/>

   <Routes>

    {/* PUBLIC */}
    <Route path="/login" element={<Login/>}/>
    <Route path="/signup" element={<Signup/>}/>
    <Route path="/forgot-password" element={<ForgotPassword/>}/>

    {/* PROTECTED */}
    <Route element={<ProtectedRoute/>}>
     <Route element={<Layout/>}>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/employees" element={<Employees/>}/>
      <Route path="/candidates" element={<Candidates/>}/>
      <Route path="/generate-employee" element={<GenerateEmployee/>}/>
<Route path="/documents" element={<DocumentManager/>}/>
      <Route path="/upload" element={<UploadDocuments/>}/>
      <Route path="/analytics/:type" element={<AnalyticsPage/>}/>
     </Route>
    </Route>

   </Routes>

  </BrowserRouter>
 )
}
