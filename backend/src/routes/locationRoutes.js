import { Router } from 'express';
import { 
  getLocations, 
  getLocationById, 
  createLocation, 
  updateLocation
} from '../controllers/locationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getLocations);
router.get('/:id', getLocationById);
router.post('/', authorize('ADMIN'), createLocation);
router.put('/:id', authorize('ADMIN'), updateLocation);

export default router;
