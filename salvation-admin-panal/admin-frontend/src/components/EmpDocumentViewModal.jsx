// import {useState,useEffect} from "react"
// import axios from "../api/axios"
// import {X,Download} from "lucide-react"

// export default function DocumentViewModal({open,onClose,documents}){

// 	const [active,setActive]=useState(null)
// 	const [preview,setPreview]=useState(null)
// 	const [loading,setLoading]=useState(false)
// 	const [zoom,setZoom]=useState(false)
// 	const [downloading,setDownloading]=useState(false)

// 	/* ======================================================
// 	   SET FIRST TAB
// 	====================================================== */

// 	useEffect(()=>{
// 		if(documents){
// 			const firstKey=Object.keys(documents)[0]
// 			setActive(firstKey)
// 		}
// 	},[documents])

// 	/* ======================================================
// 	   FETCH SIGNED URL
// 	====================================================== */

// 	useEffect(()=>{
// 		if(!active || !documents) return

// 		const fetchPreview=async()=>{
// 			try{
// 				setLoading(true)
// 				setPreview(null)

// 				const filePath=documents[active]

// 				const res=await axios.get(
// 					`/documents/signed-url?key=${encodeURIComponent(filePath)}`
// 				)

// 				setPreview(res.data.url)

// 			}catch(e){
// 				console.log("Preview load failed")
// 			}finally{
// 				setLoading(false)
// 			}
// 		}

// 		fetchPreview()

// 	},[active,documents])

// 	if(!open || !documents) return null

// 	const ext=documents[active]?.split(".").pop()?.toLowerCase()

// 	/* ======================================================
// 	   GET FILE NAME FROM PATH
// 	====================================================== */

// 	const getFileName=()=>{
// 		const path=documents[active]
// 		if(!path) return "document"
// 		return path.split("/").pop()
// 	}

// 	/* ======================================================
// 	   DOWNLOAD FILE
// 	====================================================== */

// 	const downloadFile=async()=>{
// 		if(!preview) return

// 		try{
// 			setDownloading(true)

// 			const res=await fetch(preview)
// 			const blob=await res.blob()

// 			const url=window.URL.createObjectURL(blob)

// 			const a=document.createElement("a")
// 			a.href=url
// 			a.download=getFileName()
// 			document.body.appendChild(a)
// 			a.click()
// 			a.remove()

// 			window.URL.revokeObjectURL(url)

// 		}catch{
// 			alert("Download failed")
// 		}finally{
// 			setDownloading(false)
// 		}
// 	}

// 	return(
// 		<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

// 	<div className="
// 		bg-white
// 		w-full
// 		max-w-3xl
// 		h-[97vh]
// 		rounded-2xl
// 		shadow-xl
// 		flex flex-col
// 		overflow-hidden
// 	">

// 		{/* ================= HEADER ================= */}
// 		<div className="flex justify-between items-center px-5 py-3 border-b shrink-0">
// 			<h2 className="font-semibold text-lg">Employee Documents</h2>
// 			<button onClick={onClose}><X/></button>
// 		</div>

// 		{/* ================= TABS ================= */}
// 		<div className="flex gap-2 flex-wrap px-5 py-3 border-b shrink-0 bg-gray-50">
// 			{Object.keys(documents).map(key=>(
// 				<button
// 					key={key}
// 					onClick={()=>setActive(key)}
// 					className={`px-3 py-1.5 rounded-lg text-sm capitalize transition
// 						${active===key
// 							? "bg-[#0F2747] text-white"
// 							: "bg-gray-100 hover:bg-gray-200"
// 						}`}
// 				>
// 					{key}
// 				</button>
// 			))}
// 		</div>

// 		{/* ================= PREVIEW AREA ================= */}
// 		<div className="flex-1 overflow-auto flex items-center justify-center p-4 relative bg-gray-50">

// 			{/* LOADER */}
// 			{loading && (
// 				<div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
// 					<div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
// 				</div>
// 			)}

// 			{/* PDF */}
// 			{preview && !loading && ext==="pdf" && (
// 				<iframe src={preview} className="w-full h-full rounded-lg"/>
// 			)}

// 			{/* IMAGE */}
// 			{preview && !loading && ext!=="pdf" && (
// 				<img
// 					src={preview}
// 					onClick={()=>setZoom(!zoom)}
// 					className={`transition ${
// 						zoom ? "scale-150" : "max-h-full object-contain"
// 					}`}
// 				/>
// 			)}

// 			{/* EMPTY */}
// 			{!preview && !loading && (
// 				<p className="text-gray-400">No preview available</p>
// 			)}

// 		</div>

// 		{/* ================= FOOTER ================= */}
// 		<div className="px-3 py-1 border-t flex justify-end shrink-0 bg-white">
// 			<button
// 				onClick={downloadFile}
// 				disabled={!preview}
// 				className="flex items-center gap-2 bg-[#0F2747] text-white px-4 py-2 rounded-lg hover:bg-[#14345F] disabled:opacity-50"
// 			>
// 				<Download size={16}/>
// 				Download
// 			</button>
// 		</div>

// 	</div>
// </div>

// 	)
// }
import {useState,useEffect,useMemo} from "react"
import axios from "../api/axios"
import {
	X,
	Download,
	FileText,
	Image as ImageIcon,
	CheckCircle,
	AlertCircle,
	FolderOpen
} from "lucide-react"

const DOCUMENT_LABELS={
	aadhaar:"Aadhaar",
	pan:"PAN",
	bankPassbook:"Bank Passbook",
	marksheet12:"12th Marksheet",
	graduation:"Graduation",
	offerLetter:"Offer Letter",
	appointmentLetter:"Appointment Letter",
	uanLetter:"UAN Letter",
	esicSlip:"ESIC Slip"
}

const EMPLOYEE_DOC_ORDER=[
	"aadhaar",
	"pan",
	"bankPassbook",
	"marksheet12",
	"graduation"
]

const COMPANY_DOC_ORDER=[
	"offerLetter",
	"appointmentLetter",
	"uanLetter",
	"esicSlip"
]

export default function DocumentViewModal({open,onClose,documents,title="Documents"}){

	const [active,setActive]=useState(null)
	const [preview,setPreview]=useState(null)
	const [loading,setLoading]=useState(false)
	const [zoom,setZoom]=useState(false)
	const [downloading,setDownloading]=useState(false)

	const documentList=useMemo(()=>{
		if(!documents) return []

		const isCompany=Object.prototype.hasOwnProperty.call(documents,"salarySlips")
		const fixedKeys=isCompany ? COMPANY_DOC_ORDER : EMPLOYEE_DOC_ORDER

		const list=fixedKeys.map(key=>({
			id:key,
			label:DOCUMENT_LABELS[key] || key,
			field:key,
			key:documents[key] || "",
			type:"document",
			available:Boolean(documents[key])
		}))

		if(isCompany){
			const slips=Array.isArray(documents.salarySlips) ? documents.salarySlips : []

			list.push({
				id:"salarySlips",
				label:"Salary Slips",
				field:"salarySlips",
				key:"",
				type:"folder",
				available:slips.length>0,
				children:slips.map((slip,index)=>({
					id:`salary-${index}`,
					label:`${slip.month || "Month"} ${slip.year || ""}`,
					field:"salarySlips",
					key:slip.key || "",
					type:"salary",
					available:Boolean(slip.key),
					uploadedAt:slip.uploadedAt
				}))
			})
		}

		return list
	},[documents])

	const activeDoc=useMemo(()=>{
		for(const doc of documentList){
			if(doc.id===active) return doc
			if(doc.children){
				const child=doc.children.find(c=>c.id===active)
				if(child) return child
			}
		}
		return null
	},[documentList,active])

	useEffect(()=>{
		if(open && documentList.length){
			const firstAvailable=documentList.find(doc=>doc.available && doc.type!=="folder")
			const salaryFolder=documentList.find(doc=>doc.type==="folder" && doc.children?.length)
			const firstSalary=salaryFolder?.children?.find(child=>child.available)

			setActive(firstAvailable?.id || firstSalary?.id || documentList[0].id)
		}else{
			setActive(null)
			setPreview(null)
		}
	},[open,documentList])

	useEffect(()=>{
		if(!activeDoc){
			setPreview(null)
			return
		}

		if(!activeDoc.key){
			setPreview(null)
			setLoading(false)
			return
		}

		const fetchPreview=async()=>{
			try{
				setLoading(true)
				setPreview(null)
				setZoom(false)

				const res=await axios.get(
					`/documents/signed-url?key=${encodeURIComponent(activeDoc.key)}`
				)

				setPreview(res.data.url)
			}catch(err){
				console.log("Preview load failed",err)
				setPreview(null)
			}finally{
				setLoading(false)
			}
		}

		fetchPreview()
	},[activeDoc])

	if(!open) return null

	const ext=activeDoc?.key?.split(".").pop()?.toLowerCase()
	const isPdf=ext==="pdf"
	const isImage=["jpg","jpeg","png","webp"].includes(ext)

	const getFileName=()=>{
		if(!activeDoc?.key) return "document"
		return activeDoc.key.split("/").pop()
	}

	const downloadFile=async()=>{
		if(!preview) return

		try{
			setDownloading(true)

			const res=await fetch(preview)
			const blob=await res.blob()
			const url=window.URL.createObjectURL(blob)

			const a=document.createElement("a")
			a.href=url
			a.download=getFileName()
			document.body.appendChild(a)
			a.click()
			a.remove()

			window.URL.revokeObjectURL(url)
		}catch{
			alert("Download failed")
		}finally{
			setDownloading(false)
		}
	}

	return(
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white w-full max-w-6xl h-[94vh] rounded-3xl shadow-2xl flex overflow-hidden border">

				<div className="w-80 bg-gray-50 border-r flex flex-col">
					<div className="px-5 py-5 border-b bg-white">
						<h2 className="text-lg font-semibold text-gray-800">{title}</h2>
						<p className="text-xs text-gray-500 mt-1">
							View uploaded and missing documents
						</p>
					</div>

					<div className="flex-1 overflow-auto p-4 space-y-3">
						{documentList.map(doc=>(
							<div key={doc.id}>
								<button
									onClick={()=>{
										if(doc.type==="folder"){
											const firstChild=doc.children?.[0]
											if(firstChild) setActive(firstChild.id)
											else setActive(doc.id)
										}else{
											setActive(doc.id)
										}
									}}
									className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
										active===doc.id
											? "bg-[#0F2747] text-white border-[#0F2747] shadow"
											: "bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
									}`}
								>
									<div className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-2">
											{doc.type==="folder" ? <FolderOpen size={17}/> : <FileText size={17}/>}
											<span className="text-sm font-medium">{doc.label}</span>
										</div>

										{doc.available ? (
											<CheckCircle size={15} className={active===doc.id ? "text-white" : "text-green-600"}/>
										) : (
											<AlertCircle size={15} className={active===doc.id ? "text-white" : "text-red-500"}/>
										)}
									</div>

									<p className={`text-xs mt-1 ${
										active===doc.id ? "text-gray-200" : "text-gray-400"
									}`}>
										{doc.available ? "Document available" : "No document available"}
									</p>
								</button>

								{doc.type==="folder" && (
									<div className="ml-4 mt-2 space-y-2">
										{doc.children?.length ? doc.children.map(child=>(
											<button
												key={child.id}
												onClick={()=>setActive(child.id)}
												className={`w-full text-left px-4 py-2 rounded-xl border transition ${
													active===child.id
														? "bg-[#0F2747] text-white border-[#0F2747]"
														: "bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
												}`}
											>
												<div className="flex justify-between items-center">
													<span className="text-sm">{child.label}</span>
													{child.available ? (
														<CheckCircle size={14} className={active===child.id ? "text-white" : "text-green-600"}/>
													) : (
														<AlertCircle size={14} className={active===child.id ? "text-white" : "text-red-500"}/>
													)}
												</div>
											</button>
										)) : (
											<div className="px-4 py-3 rounded-xl bg-white border text-xs text-gray-400">
												No salary slip available
											</div>
										)}
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				<div className="flex-1 flex flex-col bg-white">
					<div className="flex justify-between items-center px-6 py-4 border-b">
						<div>
							<h3 className="font-semibold text-gray-800 text-lg">
								{activeDoc?.label || "No document selected"}
							</h3>
							<p className="text-xs text-gray-500 truncate max-w-2xl mt-1">
								{activeDoc?.key || "No file uploaded for this document"}
							</p>
						</div>

						<button
							onClick={onClose}
							className="p-2 hover:bg-gray-100 rounded-xl"
						>
							<X size={22}/>
						</button>
					</div>

					<div className="flex-1 overflow-auto flex items-center justify-center p-5 relative bg-gray-100">
						{loading && (
							<div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10">
								<div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
							</div>
						)}

						{preview && !loading && isPdf && (
							<iframe
								src={preview}
								className="w-full h-full rounded-2xl bg-white shadow"
							/>
						)}

						{preview && !loading && isImage && (
							<img
								src={preview}
								onClick={()=>setZoom(!zoom)}
								className={`transition cursor-zoom-in rounded-xl shadow ${
									zoom ? "scale-150" : "max-h-full max-w-full object-contain"
								}`}
							/>
						)}

						{preview && !loading && !isPdf && !isImage && (
							<div className="text-center bg-white rounded-2xl shadow p-8">
								<FileText size={50} className="mx-auto text-gray-400"/>
								<p className="text-gray-600 mt-3 font-medium">Preview not supported</p>
								<p className="text-xs text-gray-400 mt-1">Please download this file</p>
							</div>
						)}

						{!preview && !loading && (
							<div className="text-center bg-white rounded-2xl shadow p-8">
								<AlertCircle size={50} className="mx-auto text-gray-300"/>
								<p className="text-gray-600 mt-3 font-medium">No document available</p>
								<p className="text-xs text-gray-400 mt-1">
									This document is not uploaded yet
								</p>
							</div>
						)}
					</div>

					<div className="px-6 py-4 border-t flex justify-between items-center bg-white">
						<p className="text-xs text-gray-400">
							Click image to zoom in/out
						</p>

						<button
							onClick={downloadFile}
							disabled={!preview || downloading}
							className="flex items-center gap-2 bg-[#0F2747] text-white px-5 py-2.5 rounded-xl hover:bg-[#14345F] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Download size={16}/>
							{downloading ? "Downloading..." : "Download"}
						</button>
					</div>
				</div>

			</div>
		</div>
	)
}