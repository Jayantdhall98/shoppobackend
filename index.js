const express= require("express")
const app= express();
const mongoose=require("mongoose")
const dotenv=require("dotenv")
const userRoute=require("./routes/user")
const authRoute=require("./routes/auth")
const productRoute=require("./routes/product")
const cartRoute=require("./routes/cart")
const orderRoute=require("./routes/order")
const session = require("express-session");
const MongoStore= require("connect-mongo");

const cookieParser = require("cookie-parser");


const cors=require("cors")
dotenv.config();

// declare global {
//     namespace Express {
//       interface Request {
//         // currentUser might not be defined if it is not logged in
//         session: Express.Session;
//       }
//     }
//   }
//   interface Session extends SessionData {
//     id: string;
//     regenerate(callback: (err: any) => void): void;
//     destroy(callback: (err: any) => void): void;
//     reload(callback: (err: any) => void): void;
//     save(callback: (err: any) => void): void;
//     touch(): void;
//     cookie: SessionCookie;
//   }

//   interface User{
//     username: string;
//     id:string 
//   }
  
  
//   type NewSession=Express.Session & User
  
//   declare global {
//     namespace Express {
//       interface Request {
//         // currentUser might not be defined if it is not logged in
//         session: NewSession;
//       }
//     }
//   }
mongoose.connect(process.env.MONGO_URL).then(()=>console.log("DB Connection")).catch((err)=>{console.log(err)});


//mongo db session
const sessionStorage= MongoStore.create({
    mongoUrl:process.env.MONGO_URL,
    dbName:"shoppo",
    collectionName:"sessions",
    ttl:14*24*60*60,
    autoRemove:"native"
})




app.use(cors({
    origin: ['https://shoppobackend.onrender.com'], // Replace with your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Enable CORS credentials (cookies, authorization headers)

}));

app.use(session({
    secret: "secretkeyhaipakki",
saveUninitialized:true,
cookie: { maxAge: 1000 * 60 * 60 * 24 
   },
resave: true,
store:sessionStorage
}))



// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users",userRoute);
app.use("/api/auth",authRoute);
app.use("/api/product",productRoute);
app.use("/api/cart",cartRoute);
app.use("/api/order",orderRoute);



app.get("/key",(req,res)=>{
   res.status(200).json({key:process.env.RAZORPAY_API_KEY})
})

// app.get('/chk', (req, res) => {
//       res.setHeader('Content-Type', 'text/html')
//       res.write('<p>views: ' + req.session.views  + req.session.userid + '</p>')
//       res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
//       res.end('details ' + req.session.views +  "    "+req.session.userid)
//   })

//   app.get('/xyz', (req, res) => {
//     if (req.session.views) {
//       req.session.views++
//       res.setHeader('Content-Type', 'text/html')
//       res.write('<p>views: ' + req.session.views + '</p>')
//       res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
//       res.end(req.session.userid)
//         //   return res.json({value:true,userid:req.session.userid})
//     } else {
//         req.session.userid = "myId"
//         req.session.views = 1
//       res.end('welcome to the session demo. refresh! ' + req.session.views +  "    "+req.session.userid)
//     }
//   })

app.listen(process.env.PORT||5002,()=>{
    console.log("Backend server is running")
     
})

