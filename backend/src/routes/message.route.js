import express from 'express';
import multer from 'multer';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { getMessages, getUsersForSidebar, sendMessage, uploadMessageAttachment } from '../controllers/message.controller.js';

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
});

// get users for sidebar
router.get('/users',protectRoute, getUsersForSidebar);

// get messages between two users
router.get('/:id', protectRoute, getMessages);

// send message to a user
router.post('/send/:id', protectRoute, sendMessage);

// upload message attachment to object storage
router.post('/attachments', protectRoute, upload.single('file'), uploadMessageAttachment);

export default router;
