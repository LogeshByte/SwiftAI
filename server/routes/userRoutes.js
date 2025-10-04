import express from 'express';
import { auth } from '../middlewares/auth';
import { getUserCreations , getPublishedCreations, toggleLikeCreations} from '../controllers/userController';

const userRouter = express.Router();

userRouter.get('/get-user-creations',auth,getUserCreations);

userRouter.get('/get-published-creations',auth,getPublishedCreations);

userRouter.post('/toggle-like-creations',auth,toggleLikeCreations);

export default userRouter;