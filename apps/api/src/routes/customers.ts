import { Router } from 'express';
import * as customersController from '../controllers/customers.controller';

const router = Router();

router.get('/', customersController.list);

export default router;
