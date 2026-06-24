import {useState,useMemo,useEffect} from "react"
import axios from "../api/axios"
import {X} from "lucide-react"
const CommonTable=({columns,data})=>{

 const [search,setSearch]=useState("")
 const [sortKey,setSortKey]=useState("")
 const [sortOrder,setSortOrder]=useState("asc")
const [previewImage,setPreviewImage]=useState(null)
const [imageLoading,setImageLoading]=useState(false)
 const [showColumnSelector,setShowColumnSelector]=useState(false)
 const [visibleKeys,setVisibleKeys]=useState(columns.map(c=>c.key))
const [thumbUrls,setThumbUrls]=useState({})
const [thumbLoading,setThumbLoading]=useState({})
const tableData=Array.isArray(data)?data:[]
 /* ======================================================
    GET ALL BACKEND FIELDS
 ====================================================== */
useEffect(()=>{
	const keys=[...new Set(
	(tableData||[])
			.map(row=>row.profilePhoto)
			.filter(Boolean)
	)]

	keys.forEach(key=>{
		if(!thumbUrls[key] && !thumbLoading[key]){
			fetchSignedImage(key)
		}
	})
},[tableData])
 const allDataKeys=useMemo(()=>{
 if(!tableData?.length) return []
return Object.keys(tableData[0])
 },[tableData])
const fetchSignedImage=async(key)=>{
	if(!key) return null

	if(thumbUrls[key]) return thumbUrls[key]
	if(thumbLoading[key]) return null

	try{
		setThumbLoading(prev=>({...prev,[key]:true}))

		const res=await axios.get(
			`/documents/signed-url?key=${encodeURIComponent(key)}`
		)

		const url=res.data.url

		await new Promise((resolve,reject)=>{
			const img=new Image()
			img.onload=resolve
			img.onerror=reject
			img.src=url
		})

		setThumbUrls(prev=>({...prev,[key]:url}))
		return url

	}catch(err){
		console.log(err)
		return null
	}finally{
		setThumbLoading(prev=>({...prev,[key]:false}))
	}
}
 /* ======================================================
    MERGE DEFAULT + BACKEND COLUMNS
 ====================================================== */

const allColumns=useMemo(()=>{
	const normalizedColumns=columns.map((col,index)=>({
		...col,
		key:col.key || `custom_${index}`
	}))

	const existingKeys=normalizedColumns.map(c=>c.key)

	const extraCols=allDataKeys
		.filter(key=>!existingKeys.includes(key))
		.map(key=>({
			label:key,
			key
		}))

	return [...normalizedColumns,...extraCols]
},[columns,allDataKeys])
 /* ======================================================
    ONLY VISIBLE COLUMNS
 ====================================================== */

 const visibleColumns=allColumns.filter(col=>visibleKeys.includes(col.key))

 /* ======================================================
    FILTER + SORT
 ====================================================== */

const processedData=useMemo(()=>{
	const query=search.toLowerCase()

	let filtered=tableData.filter(row=>{
		return visibleColumns.some(col=>{
			const value=row[col.key]
			if(!value) return false
			return String(value).toLowerCase().includes(query)
		})
	})

	if(sortKey){
		filtered.sort((a,b)=>{
			let v1=a[sortKey]
			let v2=b[sortKey]

			if(sortKey.toLowerCase().includes("date")){
				v1=new Date(v1)
				v2=new Date(v2)
			}

			if(typeof v1==="string"){
				v1=v1.toLowerCase()
				v2=v2.toLowerCase()
			}

			if(v1>v2) return sortOrder==="asc"?1:-1
			if(v1<v2) return sortOrder==="asc"?-1:1
			return 0
		})
	}

	return filtered
},[tableData,visibleColumns,search,sortKey,sortOrder])
 const handleSort=(key)=>{
  if(sortKey===key){
   setSortOrder(prev=>prev==="asc"?"desc":"asc")
  }else{
   setSortKey(key)
   setSortOrder("asc")
  }
 }

 /* ======================================================
    TOGGLE COLUMN
 ====================================================== */

 const toggleColumn=(key)=>{
  setVisibleKeys(prev=>
   prev.includes(key)
    ? prev.filter(k=>k!==key)
    : [...prev,key]
  )
 }

 /* ======================================================
    FORMAT CELL VALUE
 ====================================================== */

 const formatValue=(value,key)=>{

  if(value===null || value===undefined) return "-"

  /* ===== CHECKIN LOCATION → VIEW MAP ===== */
if(key==="profilePhoto"){
	const imgUrl=thumbUrls[value]
	const loading=thumbLoading[value]

	return(
		<button
			onClick={()=>openProfilePreview(value)}
			className="w-14 h-14 rounded-xl overflow-hidden border bg-gray-100 hover:ring-2 hover:ring-blue-400 flex items-center justify-center"
			title="Click to preview"
		>
			{loading?(
				<div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
			):imgUrl?(
				<img
					src={imgUrl}
					alt="Profile"
					loading="eager"
					className="w-full h-full object-cover"
				/>
			):(
				<span className="text-[10px] text-gray-400">No Image</span>
			)}
		</button>
	)
}
 if(key==="checkinLocation"){
	if(!value?.latitude || !value?.longitude){
		return <span className="text-gray-400 text-xs">Not checked in</span>
	}

	const mapUrl=`https://www.google.com/maps?q=${value.latitude},${value.longitude}`

	return(
		<button
			title={value.address || `${value.latitude}, ${value.longitude}`}
			onClick={()=>window.open(mapUrl,"_blank","noopener,noreferrer")}
			className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
		>
			View Map
		</button>
	)
}

  /* ===== NORMAL OBJECT ===== */

if(
 key==="dateOfJoining" ||
 key==="dateOfBirth"
){
 return new Date(value).toLocaleDateString(
  "en-GB",
  {
   day:"numeric",
   month:"short",
   year:"numeric"
  }
 )
}

if(typeof value==="object"){
 return JSON.stringify(value)
}

return String(value)
 }
const openProfilePreview=async(key)=>{
	if(!key) return

	const cachedUrl=thumbUrls[key]

	if(cachedUrl){
		setPreviewImage(cachedUrl)
		return
	}

	setImageLoading(true)

	const url=await fetchSignedImage(key)

	if(url){
		setPreviewImage(url)
	}else{
		alert("Image preview failed")
	}

	setImageLoading(false)
}
 /* ======================================================
    UI
 ====================================================== */

 return(
 <div className="bg-[#F7F8FA] rounded-2xl p-3 sm:p-4">

   {/* ================= TOP BAR ================= */}

   <div className="flex flex-wrap gap-3 justify-between mb-4">

    <input
     placeholder="Search..."
     value={search}
     onChange={e=>setSearch(e.target.value)}
     className="w-72 bg-white rounded-lg px-4 py-2.5 shadow-sm outline-none text-sm"
    />

    <div className="flex items-center gap-4">

     <span className="text-sm text-gray-500">
      {processedData.length} results
     </span>

     <button
      onClick={()=>setShowColumnSelector(!showColumnSelector)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
     >
      All Columns
     </button>

    </div>

   </div>

   {/* ================= COLUMN DROPDOWN ================= */}

   {showColumnSelector && (
    <div className="bg-white border rounded-xl p-4 mb-4 shadow max-h-60 overflow-auto">

     <p className="text-xs text-gray-500 mb-2 font-medium">
      Select columns to display
     </p>

     <div className="grid grid-cols-2 gap-2">

      {allColumns.map(col=>(
       <label key={col.key} className="flex items-center gap-2 text-sm">
        <input
         type="checkbox"
         checked={visibleKeys.includes(col.key)}
         onChange={()=>toggleColumn(col.key)}
        />
        {col.label}
       </label>
      ))}

     </div>

    </div>
   )}

   {/* ================= TABLE ================= */}

   <div className="w-full overflow-x-auto">

    <table className="min-w-[700px] w-full text-sm border-separate border-spacing-y-2">

     <thead>
      <tr className="text-gray-500 text-xs uppercase">
       {visibleColumns.map(col=>{
        const isActive=sortKey===col.key
        return(
         <th
          key={col.key}
          onClick={()=>handleSort(col.key)}
          className="px-4 py-2 text-left cursor-pointer"
         >
          {col.label}
          <span className="ml-1 text-[10px]">
           {!isActive && "⇅"}
           {isActive && sortOrder==="asc" && "▲"}
           {isActive && sortOrder==="desc" && "▼"}
          </span>
         </th>
        )
       })}
      </tr>
     </thead>

     <tbody>
      {processedData.map((row,i)=>(
<tr key={row._id || row.employeeId || row.candidateId || i} className="bg-white shadow-sm hover:shadow-md rounded-xl">
        {visibleColumns.map(col=>(
         <td key={col.key} className="px-4 py-3">
          {col.render
           ? col.render(row)
           : formatValue(row[col.key],col.key)
          }
         </td>
        ))}
       </tr>
      ))}

      {processedData.length===0 && (
       <tr>
        <td colSpan={visibleColumns.length} className="text-center py-10 text-gray-400">
         No results found
        </td>
       </tr>
      )}

     </tbody>

    </table>

   </div>
{(previewImage || imageLoading) && (
	<div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
		<div className="relative bg-white rounded-2xl p-3 max-w-3xl w-full">
			<button
				onClick={()=>{
					setPreviewImage(null)
					setImageLoading(false)
				}}
				className="absolute -top-4 -right-4 bg-white text-gray-700 rounded-full p-2 shadow-lg hover:bg-red-500 hover:text-white"
			>
				<X size={22}/>
			</button>

			{imageLoading?(
				<div className="h-[400px] flex items-center justify-center">
					<div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
				</div>
			):(
				<img
					src={previewImage}
					alt="Preview"
					className="w-full max-h-[80vh] object-contain rounded-xl"
				/>
			)}
		</div>
	</div>
)}
 </div>
 )
}

export default CommonTable