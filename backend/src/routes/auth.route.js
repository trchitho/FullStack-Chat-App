import express from 'express';
import {
    checkAuth, googleCallback, googleLogin, login, logout, signup, updateProfile, deleteAccount,
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup); 

router.post('/login', login);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

router.post('/logout', logout);

router.put('/update-profile', protectRoute , updateProfile);

router.get('/check' , protectRoute, checkAuth)

router.delete('/delete-account', protectRoute, deleteAccount);

export default router;
