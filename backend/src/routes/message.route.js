import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { getMessages, getUsersForSidebar , sendMessage} from '../controllers/message.controller.js';

const router = express.Router();

// get users for sidebar
router.get('/users',protectRoute, getUsersForSidebar);

// get messages between two users
router.get('/:id', protectRoute, getMessages);

// send message to a user
router.post('/send/:id', protectRoute, sendMessage);

export default router;