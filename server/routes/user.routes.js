import { Router } from "express";
import { SignUp,editProfile,forgetPassword,getProfile,login, logout,otherUsers,  resendVerificationEmail , resetPassword, verifyUser } from "../controllers/user.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router= Router();

router.post('/SignUp',SignUp);
router.post('/login',login)
router.get('/verify-email/:verificationToken',verifyUser) 
router.post('/resend-verification-email',resendVerificationEmail) 
router.post('/forget-password',forgetPassword)
router.post('/reset-password/:resetPasswordToken',resetPassword)

// secured routes
router.get('/get-profile', verifyJwt, getProfile);
router.post('/logout', verifyJwt, logout);
router.get('/other-users', verifyJwt, otherUsers);
router.patch('/edit-profile',verifyJwt,upload.single('avatar'),editProfile)

export default router;