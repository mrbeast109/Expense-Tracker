import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){ 
        return res.status(401).json({
            success: false,
            message: "Permission hai toh sahi token dikhao"
        });
    }
    const token = authHeader.split(" ")[1];
    
    try {       //token verification
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Pheli bar aaye ho kya?"
            })
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification failed : ",error);
        return res.status(401).json({
            success: false,
            message: "Token validity questionable hai"
        });
    }
}