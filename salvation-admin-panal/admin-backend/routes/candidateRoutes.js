const router=require("express").Router()
const auth=require("../middleware/authMiddleware")
const c=require("../controllers/candidateController")

router.get("/",auth,c.getCandidates)
router.put(
  "/:id",
  c.updateCandidate
);
module.exports=router
