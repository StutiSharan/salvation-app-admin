import {useState,useMemo} from "react"

const CommonTable=({columns,data})=>{

 const [search,setSearch]=useState("")
 const [sortKey,setSortKey]=useState("")
 const [sortOrder,setSortOrder]=useState("asc")

 const [showColumnSelector,setShowColumnSelector]=useState(false)
 const [visibleKeys,setVisibleKeys]=useState(columns.map(c=>c.key))

 /* ======================================================
    GET ALL BACKEND FIELDS
 ====================================================== */

 const allDataKeys=useMemo(()=>{
  if(!data?.length) return []
  return Object.keys(data[0])
 },[data])

 /* ======================================================
    MERGE DEFAULT + BACKEND COLUMNS
 ====================================================== */

 const allColumns=useMemo(()=>{
  const existingKeys=columns.map(c=>c.key)

  const extraCols=allDataKeys
   .filter(key=>!existingKeys.includes(key))
   .map(key=>({
    label:key,
    key
   }))

  return [...columns,...extraCols]
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

  let filtered=data.filter(row=>{
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

 },[data,visibleColumns,search,sortKey,sortOrder])

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

  if(key==="checkinLocation"){
   if(!value?.latitude || !value?.longitude){
    return <span className="text-gray-400 text-xs">Not checked in</span>
   }

   const mapUrl=`https://www.google.com/maps?q=${value.latitude},${value.longitude}`

   return(
    <button
     title={value.address || "Open location"}
     onClick={()=>window.open(mapUrl,"_blank")}
     className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
    >
     View Map
    </button>
   )
  }

  /* ===== NORMAL OBJECT ===== */

  if(typeof value==="object"){
   return JSON.stringify(value)
  }

  return String(value)
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
       <tr key={i} className="bg-white shadow-sm hover:shadow-md rounded-xl">
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

 </div>
 )
}

export default CommonTable