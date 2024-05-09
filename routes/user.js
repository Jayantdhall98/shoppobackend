const router=require("express").Router();
const User = require("../models/User");


router.put("/updateuser/:id",async(req,res)=>{
    try{
        if(req.session.usertype=="admin"){

            const{...rest}=req.body
            await User.updateOne({_id:req.params.id}, rest)
            res.send({success:true,message:"Data updated"})
            
        }else{

            console.log("you have no access to update")
        }
        }catch(err){
        res.send(err)
    }
})





module.exports=router