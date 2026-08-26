import {useEffect,useState} from "react"
import {getCandidates} from "../api/AdminApi"
import axios from "../api/axios"
import CommonTable from "../components/CommonTable"
import Loader from "../components/Loader"
import { exportToExcel } from "../utills/exportToExcel"
import {RefreshCw,X,Copy,Check,ChevronLeft,ChevronRight,  Edit} from "lucide-react"

export default function Candidates(){
	const [candidates,setCandidates]=useState([])
	const [candidateTotal, setCandidateTotal] = useState(0)
	const [loading,setLoading]=useState(true)
	const [error,setError]=useState("")
	const [page,setPage]=useState(1)
	const [exporting,setExporting] = useState(false)
	const [search, setSearch] = useState("")
	const [pagination,setPagination]=useState({
		total:0,
		page:1,
		limit:10,
		totalPages:1,
		hasNextPage:false,
		hasPrevPage:false
	})

	const [preview,setPreview]=useState(null)
	const [previewKey,setPreviewKey]=useState(null)
	const [previewType,setPreviewType]=useState("")
	const [previewLoading,setPreviewLoading]=useState(false)
	const [zoom,setZoom]=useState(false)
const [editModal,setEditModal] = useState(false)
const [selectedCandidate,setSelectedCandidate] = useState(null)
const [candidateForm,setCandidateForm] = useState({
  fullName:"",
  mobile:""
})
const [savingCandidate,setSavingCandidate] = useState(false)
useEffect(() => {
  setPage(1)
}, [search])

useEffect(() => {
  fetchCandidates(page)
}, [page, search])
// const handleExport = async()=>{

//  try{

//   setExporting(true)

//   exportToExcel(
//    candidates,
//    "Candidates",
//    [
//     "_id",
//     "__v",
//     "resumeFilePath",
//     "aadhaarFilePath"
//    ]
//   )

//  }catch(err){
//   console.log(err)
//  }finally{

//   setTimeout(()=>{
//    setExporting(false)
//   },500)

//  }

// }

const handleExport = async () => {
  try {
    setExporting(true)

    // Get ALL candidates matching the current search
    const res = await axios.get(
      `/candidates?page=1&limit=100000&search=${encodeURIComponent(search)}`
    )

    const allCandidates = res.data.data || []

    if (!allCandidates.length) {
      alert("No data found")
      return
    }

    exportToExcel(
      allCandidates,
      search ? `Candidates_${search}` : "Candidates",
      [
        "_id",
        "__v",
        "resumeFilePath",
        "aadhaarFilePath"
      ]
    )

  } catch (err) {
    console.log("Export error:", err)

    alert(
      err.response?.data?.message ||
      "Failed to export candidates"
    )
  } finally {
    setExporting(false)
  }
}
	const fetchCandidates = async (
  currentPage = page,
  currentSearch = search
) => {
  try {
    setLoading(true)

    const res = await getCandidates(currentPage, currentSearch)

    setCandidates(res.data.data || [])
    setPagination(res.data.pagination)
  } catch (err) {
    console.error(err)
    setError("Failed to load candidates")
  } finally {
    setLoading(false)
  }
}
	const openPreview=async(key)=>{
		if(!key) return
		try{
			setPreviewLoading(true)

			const res=await axios.get(`/documents/signed-url?key=${encodeURIComponent(key)}`)

			setPreview(res.data?.url)
			setPreviewKey(key)
			setPreviewType(key.split(".").pop().toLowerCase())
		}catch(err){
			console.log(err)
			alert("Preview failed")
		}finally{
			setPreviewLoading(false)
		}
	}

	const downloadFile=async()=>{
		if(!previewKey) return

		try{
			const res=await axios.get(`/documents/signed-url?key=${encodeURIComponent(previewKey)}`)
			const url=res.data?.url

			const a=document.createElement("a")
			a.href=url
			a.target="_blank"
			a.rel="noopener"
			a.download=previewKey.split("/").pop()
			document.body.appendChild(a)
			a.click()
			a.remove()
		}catch(err){
			console.log(err)
			window.open(preview,"_blank")
		}
	}
const openEditCandidateModal = (candidate) => {
  setSelectedCandidate(candidate)

  setCandidateForm({
    fullName: candidate.fullName || "",
    mobile: candidate.mobile || ""
  })

  setEditModal(true)
}
const updateCandidate = async () => {
  try {
    setSavingCandidate(true)

    const payload = {}

    // Name was changed
    if (
      candidateForm.fullName.trim() !==
      (selectedCandidate.fullName || "").trim()
    ) {
      payload.fullName = candidateForm.fullName.trim()
    }

    // Mobile was changed
    if (
      candidateForm.mobile.trim() !==
      (selectedCandidate.mobile || "").trim()
    ) {
      payload.mobile = candidateForm.mobile.trim()
    }

    // Nothing changed
    if (Object.keys(payload).length === 0) {
      alert("No changes to update")
      return
    }

    console.log("📤 Updating candidate with:", payload)

    const res = await axios.put(
      `/candidates/${selectedCandidate._id}`,
      payload
    )

    console.log("✅ Candidate updated:", res.data)

    await fetchCandidates(page, search)

    setEditModal(false)
    setSelectedCandidate(null)

  } catch (err) {
    console.log(
      "❌ Update candidate error:",
      err.response?.data || err
    )

    alert(
      err.response?.data?.message ||
      "Failed to update candidate"
    )

  } finally {
    setSavingCandidate(false)
  }
}
	const columns=[
		{
			label:"Candidate ID",
			key:"candidateId",
			render:r=><CopyField value={r.candidateId}/>
		},
		{
			label:"Name",
			key:"fullName",
			render:r=><CopyField value={r.fullName}/>
		},
		{
			label:"Father",
			key:"fatherName"
		},
		{
			label:"Mobile",
			key:"mobile",
			render:r=><CopyField value={r.mobile}/>
		},
		{
			label:"Address",
			key:"address"
		},
		{
			label:"Resume",
			key:"resumeFilePath",
			render:r=><FilePreview path={r.resumeFilePath} openPreview={openPreview}/>
		},
		{
			label:"Aadhaar",
			key:"aadhaarFilePath",
			render:r=><FilePreview path={r.aadhaarFilePath} openPreview={openPreview}/>
		},
		{
			label:"Created",
			key:"createdAt",
			render:r=>r.createdAt?new Date(r.createdAt).toLocaleDateString("en-GB"):"-"
		},
		{
  label:"Action",
  key:"action",
  render:(row)=>(
    <button
      onClick={()=>openEditCandidateModal(row)}
      className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs flex items-center gap-1"
    >
      <Edit size={14}/>
      Edit
    </button>
  )
}
	]

	if(error) return <div className="p-8 text-red-500">{error}</div>

	return(
		<div className="p-6 bg-gray-50 min-h-screen" style={{zoom:"0.85"}}>
			<div className="flex justify-between mb-6">

  <h1 className="text-2xl font-semibold">
    Candidates
  </h1>

  <div className="flex gap-2">

    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {exporting
        ? "Exporting..."
        : "Export Excel"}
    </button>

    <button
      onClick={()=>fetchCandidates(page)}
      disabled={loading}
      className="flex items-center gap-2 bg-[#0F2747] text-white px-4 py-2 rounded disabled:opacity-50"
    >
      <RefreshCw size={16}/>
      {loading
        ? "Refreshing..."
        : "Refresh"}
    </button>

  </div>

</div>

			<div className="bg-white rounded shadow">
				<div className="p-4 border-b text-sm text-gray-500">
					{pagination.total} records
				</div>

				<div className="h-[520px] overflow-auto">
					{loading
						?<Loader size={40}/>
						:<CommonTable
    columns={columns}
    data={candidates}
    search={search}
    onSearch={setSearch}
/>
					}
				</div>

				<Pagination
					page={page}
					pagination={pagination}
					onPageChange={setPage}
				/>
			</div>

			{preview && (
				<div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl w-full max-w-3xl flex flex-col overflow-hidden">
						<div className="flex justify-between p-4 border-b">
							<h2>Document Preview</h2>
							<button onClick={()=>setPreview(null)}><X/></button>
						</div>

						<div className="flex-1 flex items-center justify-center p-4">
							{previewLoading
								?<Loader size={70}/>
								:previewType==="pdf"
									?<iframe src={preview} className="w-full h-[70vh]"/>
									:<img
										src={preview}
										onClick={()=>setZoom(!zoom)}
										className={zoom?"scale-150":"max-h-[65vh] object-contain"}
									/>
							}
						</div>

						<div className="p-4 border-t flex justify-end">
							<button
								onClick={downloadFile}
								className="bg-[#0F2747] text-white px-4 py-2 rounded"
							>
								Download
							</button>
						</div>
					</div>
				</div>
			)}
			{editModal && selectedCandidate && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">

        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Candidate
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Update candidate name or mobile number
          </p>
        </div>

        <button
          onClick={() => setEditModal(false)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X size={18}/>
        </button>

      </div>

      <div className="space-y-4">

        {/* CANDIDATE ID */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Candidate ID
          </label>

          <input
            type="text"
            value={selectedCandidate.candidateId || ""}
            disabled
            className="w-full border rounded-lg p-2 mt-1 bg-gray-100 text-gray-500"
          />
        </div>

        {/* NAME */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Candidate Name
          </label>

          <input
            type="text"
            value={candidateForm.fullName}
            onChange={(e)=>{
              setCandidateForm(prev=>({
                ...prev,
                fullName:e.target.value
              }))
            }}
            placeholder="Enter candidate name"
            className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-[#0F2747]"
          />
        </div>

        {/* MOBILE */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Mobile Number
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={candidateForm.mobile}
            onChange={(e)=>{
              const value = e.target.value
                .replace(/\D/g,"")
                .slice(0,10)

              setCandidateForm(prev=>({
                ...prev,
                mobile:value
              }))
            }}
            placeholder="Enter 10 digit mobile number"
            className="w-full border rounded-lg p-2 mt-1 outline-none focus:ring-2 focus:ring-[#0F2747]"
          />
        </div>

      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={()=>setEditModal(false)}
          disabled={savingCandidate}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={updateCandidate}
          disabled={savingCandidate}
          className="px-4 py-2 bg-[#0F2747] text-white rounded-lg disabled:opacity-50"
        >
          {savingCandidate
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>

    </div>

  </div>
)}
		</div>
	)
}

function CopyField({value}){
	const [copied,setCopied]=useState(false)

	const handleCopy=async()=>{
		try{
			await navigator.clipboard.writeText(value||"")
			setCopied(true)
			setTimeout(()=>setCopied(false),1500)
		}catch(e){
			console.log("copy failed")
		}
	}

	return(
		<div className="flex items-center gap-2">
			<span className="truncate">{value || "-"}</span>
			<button onClick={handleCopy} className="p-1 hover:bg-gray-200 rounded">
				{copied?<Check size={14}/>:<Copy size={14}/>}
			</button>
		</div>
	)
}

function FilePreview({path,openPreview}){
	const [thumb,setThumb]=useState(null)

	useEffect(()=>{
		if(!path) return

		axios.get(`/documents/signed-url?key=${encodeURIComponent(path)}`)
			.then(res=>setThumb(res.data?.url))
			.catch(()=>{})
	},[path])

	if(!path) return "—"

	const ext=path.split(".").pop().toLowerCase()

	if(["jpg","jpeg","png","webp"].includes(ext)){
		return thumb
			?<img
				src={thumb}
				onClick={()=>openPreview(path)}
				className="w-12 h-12 rounded cursor-pointer object-cover"
			/>
			:<div className="w-12 h-12 bg-gray-200 rounded animate-pulse"/>
	}

	if(ext==="pdf"){
		return(
			<div
				onClick={()=>openPreview(path)}
				className="w-12 h-12 flex items-center justify-center rounded bg-red-50 text-red-600 cursor-pointer text-xs"
			>
				PDF
			</div>
		)
	}

	return "—"
}

function Pagination({page,pagination,onPageChange}){
	const goToPage=(newPage)=>{
		if(newPage<1 || newPage>pagination.totalPages) return
		onPageChange(newPage)
	}

	return(
		<div className="px-4 py-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
			<div className="text-xs text-gray-500">
				Page <span className="font-semibold text-[#0F2747]">{pagination.page}</span>
				{" "}of <span className="font-semibold text-[#0F2747]">{pagination.totalPages}</span>
				{" "}• Total <span className="font-semibold text-[#0F2747]">{pagination.total}</span>
			</div>

			<div className="flex items-center gap-1">
				<button
					onClick={()=>goToPage(page-1)}
					disabled={!pagination.hasPrevPage}
					className="h-8 px-2 rounded-lg text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
				>
					<ChevronLeft size={15}/>
					Prev
				</button>

				{Array.from({length:pagination.totalPages},(_,i)=>i+1)
					.slice(Math.max(0,page-2),Math.min(pagination.totalPages,page+1))
					.map(num=>(
						<button
							key={num}
							onClick={()=>goToPage(num)}
							className={`h-8 w-8 rounded-lg text-xs font-medium ${
								page===num
									?"bg-[#0F2747] text-white"
									:"text-gray-600 hover:bg-gray-100"
							}`}
						>
							{num}
						</button>
					))
				}

				<button
					onClick={()=>goToPage(page+1)}
					disabled={!pagination.hasNextPage}
					className="h-8 px-2 rounded-lg text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
				>
					Next
					<ChevronRight size={15}/>
				</button>
			</div>
			
		</div>
	)
}