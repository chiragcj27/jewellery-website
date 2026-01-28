import { Router } from 'express';
import * as subcategoriesController from '../controllers/subcategories.controller';

const router = Router();

router.get('/', subcategoriesController.getAll);
router.get('/:id', subcategoriesController.getById);
router.post('/', subcategoriesController.create);
router.put('/:id', subcategoriesController.update);
router.delete('/:id', subcategoriesController.remove);

export default router;
