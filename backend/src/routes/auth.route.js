import express from 'express';
import {
    checkAuth, googleCallback, googleLogin, login, logout, signup, updateProfile, deleteAccount,
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { authLimiter, uploadLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.post('/signup', authLimiter, signup); 

router.post('/login', authLimiter, login);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

router.post('/logout', logout);

router.put('/update-profile', protectRoute, uploadLimiter, updateProfile);

router.get('/check' , protectRoute, checkAuth);

router.delete('/delete-account', protectRoute, deleteAccount);

export default router;
