import { Router } from 'express';
import assetRoutes from './assetRoutes.js';
import procurementRoutes from './procurementRoutes.js';
import licenseRoutes from './licenseRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import locationRoutes from './locationRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/assets', assetRoutes);
router.use('/procurement', procurementRoutes);
router.use('/licenses', licenseRoutes);
router.use('/departments', departmentRoutes);
router.use('/locations', locationRoutes);

export default router;
