import express from 'express';
import multer from 'multer';
import { protectRoute } from '../middlewares/auth.middleware.js';
import {
    getMessages,
    getPinnedDirectMessages,
    getUsersForSidebar,
    downloadMessageAttachment,
    markConversationSeen,
    markMessageDelivered,
    searchUsers,
    sendMessage,
    setMessagePinned,
    updateConversationSetting,
    updateDirectConversationNickname,
    updateDirectConversationTheme,
    uploadMessageAttachment,
} from '../controllers/message.controller.js';

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
});

// get users for sidebar
router.get('/users',protectRoute, getUsersForSidebar);
router.get('/search', protectRoute, searchUsers);

// get messages between two users
router.get('/:id', protectRoute, getMessages);

// send message to a user
router.post('/send/:id', protectRoute, sendMessage);

// upload message attachment to object storage
router.post('/attachments', protectRoute, upload.single('file'), uploadMessageAttachment);
router.get('/attachments/:messageId/download', protectRoute, downloadMessageAttachment);
router.patch('/pinned/:messageId', protectRoute, setMessagePinned);
router.patch('/receipts/:messageId/delivered', protectRoute, markMessageDelivered);
router.get('/conversations/:userId/pinned', protectRoute, getPinnedDirectMessages);
router.patch('/conversations/:userId/seen', protectRoute, markConversationSeen);
router.patch('/conversations/:userId/settings', protectRoute, updateConversationSetting);
router.patch('/conversations/:userId/theme', protectRoute, updateDirectConversationTheme);
router.patch('/conversations/:userId/nickname', protectRoute, updateDirectConversationNickname);

export default router;
