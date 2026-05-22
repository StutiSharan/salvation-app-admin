const Employee = require("../models/Employee")

module.exports = async()=>{

 const lastEmployee = await Employee
  .findOne({employeeId:/^EMP-/})
  .sort({createdAt:-1})
  .select("employeeId")

 if(!lastEmployee){
  return "EMP-0001"
 }

 const lastNumber = parseInt(lastEmployee.employeeId.split("-")[1])

 const nextNumber = lastNumber + 1

 return "EMP-" + String(nextNumber).padStart(4,"0")
}
