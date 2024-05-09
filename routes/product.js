const router=require("express").Router();

const Product = require("../models/Product");



// REGISTER

router.post("/uploadproduct",async (req,res)=>{
  
try{
       if(req.session.usertype=="admin"||"subadmin" && req.session.userid){

           const newProduct= new Product(req.body)
           const savedProduct = await newProduct.save();
          
           res.send(savedProduct)
        }else{
            console.log("normal user have no access")
           
        }
    
}catch(err){
    res.send(err)
}

})
// Get all products 

router.get("/allproducts",async (req,res)=>{
const allproducts= await Product.find().sort({_id:-1})


res.send(allproducts)

})
// Get products by id 

// router.get("/cartproducts/:id",async (req,res)=>{
// const cartproducts= await Product.findById({_id:req.params.id}).sort({_id:-1})


// res.send(cartproducts)

// })

router.get("/products/:id",async(req,res)=>{
    const products= await Product.findById({_id:req.params.id})
    res.send(products);
})




module.exports=router
