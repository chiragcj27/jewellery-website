import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';

const router = Router();

router.post('/', ordersController.createOrder);
router.get('/', ordersController.getAllOrders);
router.get('/:id', ordersController.getOrderById);
router.patch('/:id/status', ordersController.updateOrderStatus);

export default router;
