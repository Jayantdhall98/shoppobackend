// const router = require("express").Router();
// const Razorpay = require("razorpay");
// const Payment=require('../models/Payment_confirm')
// const Order=require('../models/Order')
// const dotenv = require("dotenv");
// const crypto=require("crypto");
// dotenv.config();
// const instance = new Razorpay({
//   key_id: process.env.RAZORPAY_API_KEY,
//   key_secret: process.env.RAZORPAY_API_SECRET,
// });




// router.post("/checkout", async (req, res) => {

// const {name,productId,quantity,address,state,city,pincode,mobile,email,amount}=req.body
    
// // console.log(name,productId,quantity,address,state,city,pincode,email,amount)

//   const options = {
//     amount: Number(amount*100),
   
//     currency: "INR",
//   };
//   // const order= await instance.orders.create(options)
//   const order = await instance.orders.create(options);
  
//   res.status(200).json({
//     success:true,
//     order
//   });

//   await Order.create({
//     orderid:order.id,
//     userid:req.session.userid,
//     name:name,
//     products:[
//       {
//         productId:productId,
//         quantity:quantity
//       }
//     ],
//     amount:order.amount,
//     address:{
//     address:address,
//     state:state,
//     city:city,
//     pincode:pincode
//     },
//     mobile:mobile,
//     email:email
//    })



// });



// router.post("/paymentverification", async (req, res) => {
//   const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
  
// const body=razorpay_order_id + "|" + razorpay_payment_id;


// const expectedSignature=crypto.createHmac('sha256',process.env.RAZORPAY_API_SECRET).update(body.toString()).digest('hex');


// const isAuthentic= expectedSignature===razorpay_signature

// if(isAuthentic){

//   await Payment.create({
//     razorpay_order_id:razorpay_order_id,
//     razorpay_payment_id:razorpay_payment_id,
//     razorpay_signature:razorpay_signature,
//     userid:req.session.userid,
//     username:req.session.username
//   })

//   // Database save





//  res.redirect(`http://localhost:5173/paymentsuccess?reference=${razorpay_payment_id}`);
  
  
// }else{
//   res.status(400).json({
//     success:false
//   });

// }



  
// });


// // router.post("/orderplaced",async(req,res)=>{

// // const order= await Order.create({
// //   orderid:req.body.orderid,
// //   userid:req.session.userid,
// //   name:req.body.name,
// //   products:[
// //     {
// //       productId:req.body.productId,
// //       quantity:req.body.quantity
// //     }
// //   ],
// //   amount:req.body.amount,
// //   address:{
// //   address:req.body.address,
// //   state:req.body.state,
// //   city:req.body.city,
// //   pincode:req.body.pincode
// //   },
// //   mobile:req.body.mobile,
// //   email:req.body.email
// //  })
// //  res.send({
// //   msg:"Order Placed",order
// //  })


// // })



// router.get('/getpaidorders', async (req, res) => {
//   try {
//     // Find all payment records
//     const payments = await Payment.find();

//     // Extract order IDs from payment records
//     const orderIds = payments.map(payment => payment.
//       razorpay_order_id);

//     // Find orders where the order ID exists in the payment records
//     const paidOrders = await Order.find({ orderid: { $in: orderIds } });

//     // Return the paid orders in the response
//     res.status(200).json(paidOrders);
//   } catch (error) {
//     // Handle errors
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while fetching paid orders.' });
//   }
// });






// module.exports = router;



const router = require("express").Router();
const Razorpay = require("razorpay");
const Payment = require('../models/Payment_confirm');
const Order = require('../models/Order');
const Product = require("../models/Product");

const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

// Initialize Razorpay instance with your API key and secret
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// Route to create a new order
router.post("/checkout", async (req, res) => {
  try {
    // Extract required data from request body
    const { name, productId, quantity, address, state, city, pincode, mobile, email, amount } = req.body;

    // Check if all required data is present
    if (!name || !productId || !quantity || !address || !state || !city || !pincode || !mobile || !email || !amount) {
      return res.status(400).json({ success: false, error: "Missing required data in the request body." });
    }else{

      
      // Create options for the Razorpay order
      const options = {
        amount: Number(amount * 100), // Amount in paisa (e.g., 50000 paisa = ₹500)
        currency: "INR",
      };
      
      // Create an order using Razorpay API
      const order = await instance.orders.create(options);
      
      // Create a new order document with order ID and other details
      await Order.create({
        orderid: order.id,
        userid: req.session.userid,
        name: name,
        products: [{ productId: productId, quantity: quantity }],
        amount: amount,
        address: { address: address, state: state, city: city, pincode: pincode },
        mobile: mobile,
        email: email
      });
      
      // Send success response with order details
      res.status(200).json({ success: true, order });
    }
  } catch (error) {
    // Handle errors during checkout
    console.error("Error during checkout:", error);
    res.status(500).json({ success: false, error: "An error occurred during checkout." });
  }
});

// Route to verify payment and save payment details
router.post("/paymentverification", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Construct the expected signature and verify authenticity
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET).update(body).digest('hex');
    const isAuthentic = expectedSignature === razorpay_signature;

    // If the signature is authentic, save payment details
    if (isAuthentic) {
      await Payment.create({
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        userid: req.session.userid,
        username: req.session.username
      });

      // Redirect to payment success page with reference ID
      return res.redirect(`http://localhost:5173/paymentsuccess?reference=${razorpay_payment_id}`);
    } else {
      // If signature is not authentic, send error response
      return res.status(400).json({ success: false, error: "Invalid signature." });
    }
  } catch (error) {
    // Handle errors during payment verification
    console.error("Error during payment verification:", error);
    res.status(500).json({ success: false, error: "An error occurred during payment verification." });
  }
});

// Route to fetch paid orders
router.get('/getpaidorders', async (req, res) => {
  try {
    // Find all payment records
    const payments = await Payment.find();

    // Extract order IDs from payment records
    const orderIds = payments.map(payment => payment.razorpay_order_id);

    // Find orders where the order ID exists in the payment records
    const allpaidOrders = await Order.find({ orderid: { $in: orderIds } });

    // Return the paid orders in the response
    res.status(200).json(allpaidOrders);
  } catch (error) {
    // Handle errors while fetching paid orders
    console.error("Error while fetching paid orders:", error);
    res.status(500).json({ error: 'An error occurred while fetching paid orders.' });
  }
});
// Route to fetch paid orders
// router.get('/getuserpaidorders', async (req, res) => {
//   try {
//     // Find all payment records
//     const payments = await Payment.find();

//     // Extract order IDs from payment records
//     const orderIds = payments.map(payment => payment.razorpay_order_id);

//     // Find orders where the order ID exists in the payment records
//     const paidOrders = await Order.find({ orderid: { $in: orderIds }, userid: req.session.userid });

   

//     // Return the paid orders belonging to the current session user in the response
//     res.status(200).json(paidOrders);
//   } catch (error) {
//     // Handle errors while fetching paid orders
//     console.error("Error while fetching paid orders:", error);
//     res.status(500).json({ error: 'An error occurred while fetching paid orders.' });
//   }
// });
router.get('/getuserpaidorders', async (req, res) => {
  try {
    // Find all payment records
    const payments = await Payment.find();

    // Extract order IDs from payment records
    const orderIds = payments.map(payment => payment.razorpay_order_id);

    // Find orders where the order ID exists in the payment records for the current user
    const paidOrders = await Order.find({ orderid: { $in: orderIds }, userid: req.session.userid });

    // Map through paidOrders and fetch product data for each product ID
    const updatedPaidOrders = await Promise.all(paidOrders.map(async (order) => {
      // Fetch product data for each product in the order
      const productsData = await Promise.all(order.products.map(async (product) => {
        const productData = await Product.findById(product.productId);
        return {
          productId: productData._id,
          title: productData.title,
          desc: productData.desc,
          img: productData.img,
          categories: productData.categories,
          price: productData.price,
          quantity: product.quantity
        };
      }));
      
      // Update the order object with product details
      order.products = productsData;
      return order;
    }));

    // Return the updated paid orders belonging to the current session user in the response
    res.status(200).json(updatedPaidOrders);
  } catch (error) {
    // Handle errors while fetching paid orders
    console.error("Error while fetching paid orders:", error);
    res.status(500).json({ error: 'An error occurred while fetching paid orders.' });
  }
});





module.exports = router;
