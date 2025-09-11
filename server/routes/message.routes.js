import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { sendMessage , getMessages} from "../controllers/message.controller.js";

const router= Router();

// secured routes
router.post('/send/:recieverId', verifyJwt, sendMessage);
router.get('/get-messages/:otherParticipantId', verifyJwt, getMessages);

export default router;