import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  
  const token =
    req.cookies.token ||
    req.header("Authorization")?.replace("Bearer ", "");

    console.log("Token exists:", token ? 'yes' : 'no');
    console.log("Cookies:", req.cookies);

  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  
    const user = await User.findById(decodedToken._id).select("-password");
  
    if(!user){
      throw new ApiError(500,'internal server error')
    }
    
    req.user = user;
    next();
    
  } catch (error) {
    console.log("JWT verification error:", error);;
    throw new ApiError(401,error.message)
    
  }
});
