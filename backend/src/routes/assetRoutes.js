import { Router } from 'express';
import { 
  getAssets, 
  getAssetById, 
  createAsset, 
  updateAsset, 
  deleteAsset 
} from '../controllers/assetController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/assets - Get all assets with filtering
router.get('/', getAssets);

// GET /api/v1/assets/:id - Get single asset
router.get('/:id', getAssetById);

// POST /api/v1/assets - Create new asset (Admin/Manager only)
router.post('/', authorize('ADMIN', 'MANAGER'), createAsset);

// PUT /api/v1/assets/:id - Update asset (Admin/Manager only)
router.put('/:id', authorize('ADMIN', 'MANAGER'), updateAsset);

// DELETE /api/v1/assets/:id - Delete asset (Admin only)
router.delete('/:id', authorize('ADMIN'), deleteAsset);

export default router;
