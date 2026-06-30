import prisma from '../config/database.js';

export const getProcurements = async (req, res, next) => {
  try {
    const { status, departmentId, requestorId, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (requestorId) where.requestorId = requestorId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [requests, total] = await Promise.all([
      prisma.procurementRequest.findMany({
        where,
        skip,
        take,
        include: {
          requestor: { select: { id: true, firstName: true, lastName: true, email: true } },
          department: { select: { id: true, code: true, name: true } },
          approvals: {
            include: {
              approver: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          _count: { select: { attachments: true } },
        },
        orderBy: { requestDate: 'desc' },
      }),
      prisma.procurementRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        requests,
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

export const getProcurementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.procurementRequest.findUnique({
      where: { id },
      include: {
        requestor: { select: { id: true, firstName: true, lastName: true, email: true } },
        department: true,
        approvals: {
          include: {
            approver: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { message: 'Procurement request not found' },
      });
    }

    res.json({
      success: true,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const createProcurement = async (req, res, next) => {
  try {
    const { title, description, departmentId, estimatedCost, priority, vendor, notes } = req.body;

    // Generate request number
    const count = await prisma.procurementRequest.count();
    const requestNumber = `ITP${String(count + 1).padStart(5, '0')}`;

    const request = await prisma.procurementRequest.create({
      data: {
        requestNumber,
        title,
        description,
        requestorId: req.user.id,
        departmentId,
        estimatedCost,
        priority,
        vendor,
        notes,
        status: 'DRAFT',
      },
      include: {
        requestor: { select: { id: true, firstName: true, lastName: true, email: true } },
        department: { select: { id: true, code: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProcurement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const request = await prisma.procurementRequest.update({
      where: { id },
      data: updates,
      include: {
        requestor: { select: { id: true, firstName: true, lastName: true, email: true } },
        department: { select: { id: true, code: true, name: true } },
      },
    });

    res.json({
      success: true,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const approveProcurement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const [request, approval] = await prisma.$transaction([
      prisma.procurementRequest.update({
        where: { id },
        data: { status: 'APPROVED', approvedDate: new Date() },
      }),
      prisma.approval.create({
        data: {
          procurementId: id,
          approverId: req.user.id,
          status: 'APPROVED',
          comments,
          approvedAt: new Date(),
        },
      }),
    ]);

    res.json({
      success: true,
      data: { request, approval },
    });
  } catch (error) {
    next(error);
  }
};

export const rejectProcurement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const [request, approval] = await prisma.$transaction([
      prisma.procurementRequest.update({
        where: { id },
        data: { status: 'REJECTED' },
      }),
      prisma.approval.create({
        data: {
          procurementId: id,
          approverId: req.user.id,
          status: 'REJECTED',
          comments,
          approvedAt: new Date(),
        },
      }),
    ]);

    res.json({
      success: true,
      data: { request, approval },
    });
  } catch (error) {
    next(error);
  }
};
