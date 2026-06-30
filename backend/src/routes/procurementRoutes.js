import { Router } from 'express';
import { 
  getProcurements, 
  getProcurementById, 
  createProcurement, 
  updateProcurement,
  approveProcurement,
  rejectProcurement
} from '../controllers/procurementController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getProcurements);
router.get('/:id', getProcurementById);
router.post('/', createProcurement);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateProcurement);
router.post('/:id/approve', authorize('ADMIN', 'MANAGER'), approveProcurement);
router.post('/:id/reject', authorize('ADMIN', 'MANAGER'), rejectProcurement);

export default router;
