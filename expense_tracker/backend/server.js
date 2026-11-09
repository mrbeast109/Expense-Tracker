import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoute.js';
    
const app = express();
const PORT = process.env.PORT || 5001;

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//database
connectDB();

//routes
app.use("/api/user",userRouter);

app.get('/',(req,res) => {
    res.send("backend is running");
})

app.listen(PORT,() => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})