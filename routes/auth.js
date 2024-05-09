const router = require("express").Router();

const User = require("../models/User");



// REGISTER

router.post("/register",async (req,res)=>{
    try{

        const newuser= new User({
            username:req.body.username,
            email:req.body.email,
            password:req.body.password,
            usertype:req.body.usertype
        })
        const savedUser = await newuser.save();
        res.send(savedUser)
    }catch(err){
        res.send(err)
    }
})

//for session authenticate
router.get("/",(req,res)=>{
    
   
    if(req.session.userid){
      console.log("session found" +  req.session.userid)
        return res.json({value:true, usertype:req.session.usertype})
    }else{
        console.log("session not found" +  req.session.userid)
        return res.json({value:false,userid:"not authenticated"})
    }
})

//Destroy session

router.get("/destroy",async(req,res)=>{
    req.session.destroy();
res.send("destroyed")

})






//login
router.post("/login", async(req,res)=>{
const {email,password}=req.body
let errorr={
    err:"enter correct password please !"
}


User.findOne({email:email}).then((user)=>{console.log(user)
    if(password&&user.password==password){
        console.log("welcome to the shopping app!!")
        req.session.userid=user._id;
        req.session.usertype=user.usertype;
        req.session.username=user.username;

        // console.log("req.session.userid " + req.session.userid)
        let message={msg:"welcome"+""+ user.username ,usertype:user.usertype}
        res.send(message);
         
     }else{
        res.send(errorr)
        
     }
     
})
})

// Get all users for our admin 
router.get("/allusers",async(req,res)=>{
try{
      if(req.session.userid && req.session.usertype=="admin"){

          const allusers= await User.find().select('-password')
          res.send(allusers)
        }else{
            console.log("Normal user can not access it...")
        }
}catch(err){
    res.send(err)
}

})









module.exports = router;