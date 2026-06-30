import { Router } from 'express';
import { 
  getLicenses, 
  getLicenseById, 
  createLicense, 
  updateLicense,
  deleteLicense
} from '../controllers/licenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getLicenses);
router.get('/:id', getLicenseById);
router.post('/', authorize('ADMIN', 'MANAGER'), createLicense);
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateLicense);
router.delete('/:id', authorize('ADMIN'), deleteLicense);

export default router;
