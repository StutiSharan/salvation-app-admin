import {useState,useEffect} from "react"
import axios from "../api/axios"
import {X,Download} from "lucide-react"

export default function DocumentViewModal({open,onClose,documents}){

	const [active,setActive]=useState(null)
	const [preview,setPreview]=useState(null)
	const [loading,setLoading]=useState(false)
	const [zoom,setZoom]=useState(false)
	const [downloading,setDownloading]=useState(false)

	/* ======================================================
	   SET FIRST TAB
	====================================================== */

	useEffect(()=>{
		if(documents){
			const firstKey=Object.keys(documents)[0]
			setActive(firstKey)
		}
	},[documents])

	/* ======================================================
	   FETCH SIGNED URL
	====================================================== */

	useEffect(()=>{
		if(!active || !documents) return

		const fetchPreview=async()=>{
			try{
				setLoading(true)
				setPreview(null)

				const filePath=documents[active]

				const res=await axios.get(
					`/documents/signed-url?key=${encodeURIComponent(filePath)}`
				)

				setPreview(res.data.url)

			}catch(e){
				console.log("Preview load failed")
			}finally{
				setLoading(false)
			}
		}

		fetchPreview()

	},[active,documents])

	if(!open || !documents) return null

	const ext=documents[active]?.split(".").pop()?.toLowerCase()

	/* ======================================================
	   GET FILE NAME FROM PATH
	====================================================== */

	const getFileName=()=>{
		const path=documents[active]
		if(!path) return "document"
		return path.split("/").pop()
	}

	/* ======================================================
	   DOWNLOAD FILE
	====================================================== */

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
		<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

	<div className="
		bg-white
		w-full
		max-w-3xl
		h-[97vh]
		rounded-2xl
		shadow-xl
		flex flex-col
		overflow-hidden
	">

		{/* ================= HEADER ================= */}
		<div className="flex justify-between items-center px-5 py-3 border-b shrink-0">
			<h2 className="font-semibold text-lg">Employee Documents</h2>
			<button onClick={onClose}><X/></button>
		</div>

		{/* ================= TABS ================= */}
		<div className="flex gap-2 flex-wrap px-5 py-3 border-b shrink-0 bg-gray-50">
			{Object.keys(documents).map(key=>(
				<button
					key={key}
					onClick={()=>setActive(key)}
					className={`px-3 py-1.5 rounded-lg text-sm capitalize transition
						${active===key
							? "bg-[#0F2747] text-white"
							: "bg-gray-100 hover:bg-gray-200"
						}`}
				>
					{key}
				</button>
			))}
		</div>

		{/* ================= PREVIEW AREA ================= */}
		<div className="flex-1 overflow-auto flex items-center justify-center p-4 relative bg-gray-50">

			{/* LOADER */}
			{loading && (
				<div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
					<div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
				</div>
			)}

			{/* PDF */}
			{preview && !loading && ext==="pdf" && (
				<iframe src={preview} className="w-full h-full rounded-lg"/>
			)}

			{/* IMAGE */}
			{preview && !loading && ext!=="pdf" && (
				<img
					src={preview}
					onClick={()=>setZoom(!zoom)}
					className={`transition ${
						zoom ? "scale-150" : "max-h-full object-contain"
					}`}
				/>
			)}

			{/* EMPTY */}
			{!preview && !loading && (
				<p className="text-gray-400">No preview available</p>
			)}

		</div>

		{/* ================= FOOTER ================= */}
		<div className="px-3 py-1 border-t flex justify-end shrink-0 bg-white">
			<button
				onClick={downloadFile}
				disabled={!preview}
				className="flex items-center gap-2 bg-[#0F2747] text-white px-4 py-2 rounded-lg hover:bg-[#14345F] disabled:opacity-50"
			>
				<Download size={16}/>
				Download
			</button>
		</div>

	</div>
</div>

	)
}
