import { Router } from 'express';
import * as wholesalersController from '../controllers/wholesalers.controller';

const router = Router();

router.get('/', wholesalersController.list);
router.patch('/:id/approve', wholesalersController.approve);
router.patch('/:id/reject', wholesalersController.reject);

export default router;
