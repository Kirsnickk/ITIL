import prisma from '../config/database.js';

// GET /api/v1/assets
export const getAssets = async (req, res, next) => {
  try {
    const { 
      type, 
      status, 
      locationId, 
      departmentId, 
      search,
      page = 1,
      limit = 20 
    } = req.query;

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (locationId) where.locationId = locationId;
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { assetTag: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take,
        include: {
          location: { select: { id: true, code: true, name: true } },
          department: { select: { id: true, code: true, name: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        assets,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/assets/:id
export const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        location: true,
        department: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        maintenanceRecords: {
          orderBy: { startDate: 'desc' },
          take: 10,
        },
        attachments: true,
        changeHistory: {
          orderBy: { changedAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { message: 'Asset not found' },
      });
    }

    res.json({
      success: true,
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/assets
export const createAsset = async (req, res, next) => {
  try {
    const assetData = req.body;

    const asset = await prisma.asset.create({
      data: assetData,
      include: {
        location: { select: { id: true, code: true, name: true } },
        department: { select: { id: true, code: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'Asset',
        entityId: asset.id,
        details: `Created asset: ${asset.assetTag}`,
      },
    });

    res.status(201).json({
      success: true,
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/assets/:id
export const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get old asset for change history
    const oldAsset = await prisma.asset.findUnique({ where: { id } });
    if (!oldAsset) {
      return res.status(404).json({
        success: false,
        error: { message: 'Asset not found' },
      });
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: updates,
      include: {
        location: { select: { id: true, code: true, name: true } },
        department: { select: { id: true, code: true, name: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Create change history for modified fields
    const changedFields = Object.keys(updates).filter(
      key => oldAsset[key] !== updates[key]
    );

    await Promise.all(
      changedFields.map(field =>
        prisma.changeHistory.create({
          data: {
            assetId: id,
            field,
            oldValue: String(oldAsset[field] || ''),
            newValue: String(updates[field] || ''),
            changedBy: req.user.id,
          },
        })
      )
    );

    res.json({
      success: true,
      data: { asset },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/assets/:id
export const deleteAsset = async (req, res, next) => {
  try {
    const { id } = req.params;

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { message: 'Asset not found' },
      });
    }

    await prisma.asset.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'Asset',
        entityId: id,
        details: `Deleted asset: ${asset.assetTag}`,
      },
    });

    res.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
