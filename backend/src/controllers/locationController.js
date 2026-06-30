import prisma from '../config/database.js';

export const getLocations = async (req, res, next) => {
  try {
    const { type, country, isActive } = req.query;

    const where = {};
    if (type) where.type = type;
    if (country) where.country = country;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const locations = await prisma.location.findMany({
      where,
      include: {
        _count: { select: { assets: true } },
      },
      orderBy: [{ country: 'asc' }, { name: 'asc' }],
    });

    res.json({
      success: true,
      data: { locations },
    });
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        assets: {
          select: { id: true, assetTag: true, name: true, type: true, status: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        error: { message: 'Location not found' },
      });
    }

    res.json({
      success: true,
      data: { location },
    });
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const { code, name, type, country, city, address } = req.body;

    const location = await prisma.location.create({
      data: { code, name, type, country, city, address },
    });

    res.status(201).json({
      success: true,
      data: { location },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const location = await prisma.location.update({
      where: { id },
      data: updates,
    });

    res.json({
      success: true,
      data: { location },
    });
  } catch (error) {
    next(error);
  }
};
