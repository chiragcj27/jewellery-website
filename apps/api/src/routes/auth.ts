import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/register/customer', authController.registerCustomer);
router.post('/register/wholesaler', authController.registerWholesaler);
router.post('/login', authController.login);
router.get('/me', authController.me);

export default router;
