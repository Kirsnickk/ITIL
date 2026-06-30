import prisma from '../config/database.js';

export const getLicenses = async (req, res, next) => {
  try {
    const { product, vendor, status, type, page = 1, limit = 20 } = req.query;

    const where = {};
    if (product) where.product = { contains: product, mode: 'insensitive' };
    if (vendor) where.vendor = { contains: vendor, mode: 'insensitive' };
    if (status) where.status = status;
    if (type) where.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where,
        skip,
        take,
        orderBy: { expiryDate: 'asc' },
      }),
      prisma.license.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        licenses,
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

export const getLicenseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const license = await prisma.license.findUnique({
      where: { id },
    });

    if (!license) {
      return res.status(404).json({
        success: false,
        error: { message: 'License not found' },
      });
    }

    res.json({
      success: true,
      data: { license },
    });
  } catch (error) {
    next(error);
  }
};

export const createLicense = async (req, res, next) => {
  try {
    const {
      licenseKey,
      product,
      vendor,
      type,
      seatsTotal,
      purchaseDate,
      expiryDate,
      cost,
      renewalCost,
      notes,
    } = req.body;

    const license = await prisma.license.create({
      data: {
        licenseKey,
        product,
        vendor,
        type,
        seatsTotal,
        purchaseDate: new Date(purchaseDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        cost,
        renewalCost,
        notes,
      },
    });

    res.status(201).json({
      success: true,
      data: { license },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLicense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.purchaseDate) updates.purchaseDate = new Date(updates.purchaseDate);
    if (updates.expiryDate) updates.expiryDate = new Date(updates.expiryDate);

    const license = await prisma.license.update({
      where: { id },
      data: updates,
    });

    res.json({
      success: true,
      data: { license },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLicense = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.license.delete({ where: { id } });

    res.json({
      success: true,
      message: 'License deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
