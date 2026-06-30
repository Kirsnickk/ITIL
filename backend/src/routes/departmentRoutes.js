import { Router } from 'express';
import { 
  getDepartments, 
  getDepartmentById, 
  createDepartment, 
  updateDepartment
} from '../controllers/departmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize('ADMIN'), createDepartment);
router.put('/:id', authorize('ADMIN'), updateDepartment);

export default router;
