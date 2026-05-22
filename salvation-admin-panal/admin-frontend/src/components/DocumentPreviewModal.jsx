import {X,Download} from "lucide-react"

export default function DocumentPreviewModal({open,onClose,url}){

 if(!open) return null

 return(
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">

   <div className="bg-white rounded-xl max-w-3xl w-full p-4 relative">

    {/* CLOSE */}
    <button
     onClick={onClose}
     className="absolute top-3 right-3"
    >
     <X/>
    </button>

    {/* IMAGE */}
    <img
     src={url}
     className="max-h-[70vh] w-full object-contain"
    />

    {/* DOWNLOAD */}
    <div className="flex justify-end mt-4">
     <a
      href={url}
      download
      className="flex items-center gap-2 bg-[#0F2747] text-white px-4 py-2 rounded-lg"
     >
      <Download size={16}/>
      Download
     </a>
    </div>

   </div>

  </div>
 )
}
