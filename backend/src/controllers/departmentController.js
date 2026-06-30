import prisma from '../config/database.js';

export const getDepartments = async (req, res, next) => {
  try {
    const { search, isActive } = req.query;

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        _count: {
          select: { users: true, assets: true, procurementRequests: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: { departments },
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        _count: { select: { assets: true, procurementRequests: true } },
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: { message: 'Department not found' },
      });
    }

    res.json({
      success: true,
      data: { department },
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { code, name, description, managerId } = req.body;

    const department = await prisma.department.create({
      data: { code, name, description, managerId },
    });

    res.status(201).json({
      success: true,
      data: { department },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: updates,
    });

    res.json({
      success: true,
      data: { department },
    });
  } catch (error) {
    next(error);
  }
};
