import { Router } from 'express';
import {
  getAllMetalRates,
  getMetalRateById,
  getMetalRateByType,
  createMetalRate,
  updateMetalRate,
  deleteMetalRate,
} from '../controllers/metalRates.controller';

const router = Router();

router.get('/', getAllMetalRates);
router.get('/:id', getMetalRateById);
router.get('/type/:metalType', getMetalRateByType);
router.post('/', createMetalRate);
router.put('/:id', updateMetalRate);
router.delete('/:id', deleteMetalRate);

export default router;
