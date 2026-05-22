export default function Loader({
 size=60,          // responsive size
 fullScreen=false,
 overlay=false,
 color="#3B82F6",
 bgColor="#ffffff"  // blue glow
}){

 const loader=(
  <div
   className="loader-circle"
   style={{
    width:size,
    height:size,
    "--dot-color":color
   }}
  >
   {[...Array(12)].map((_,i)=>(
    <span key={i} style={{"--i":i}}/>
   ))}
  </div>
 )

 if(fullScreen){
  return(
   <div className="fixed inset-0 bg-[#081C34] flex items-center justify-center z-50">
    {loader}
   </div>
  )
 }

 if(overlay){
  return(
   <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-xl">
    {loader}
   </div>
  )
 }

 return(
  <div className="flex items-center justify-center py-10">
   {loader}
  </div>
 )
}
