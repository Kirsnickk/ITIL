import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create IT Department
  const itDepartment = await prisma.department.upsert({
    where: { code: 'IT' },
    update: {},
    create: {
      code: 'IT',
      name: 'Information Technology',
      description: 'IT Department - System Administration',
      isActive: true,
    },
  });
  console.log('✅ Created IT Department:', itDepartment.code);

  // Create Head Office Location
  const headOffice = await prisma.location.upsert({
    where: { code: 'HQ-VN' },
    update: {},
    create: {
      code: 'HQ-VN',
      name: 'Head Office Vietnam',
      type: 'OFFICE',
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      address: 'District 1, Ho Chi Minh City',
      isActive: true,
    },
  });
  console.log('✅ Created Head Office Location:', headOffice.code);

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@itil.com' },
    update: {},
    create: {
      email: 'admin@itil.com',
      username: 'admin',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      departmentId: itDepartment.id,
      isActive: true,
    },
  });
  console.log('✅ Created Admin User:', adminUser.email);

  // Create Manager User
  const managerPasswordHash = await bcrypt.hash('Manager@123', 10);
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@itil.com' },
    update: {},
    create: {
      email: 'manager@itil.com',
      username: 'manager',
      passwordHash: managerPasswordHash,
      firstName: 'IT',
      lastName: 'Manager',
      role: 'MANAGER',
      departmentId: itDepartment.id,
      isActive: true,
    },
  });
  console.log('✅ Created Manager User:', managerUser.email);

  // Create Regular User
  const userPasswordHash = await bcrypt.hash('User@123', 10);
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@itil.com' },
    update: {},
    create: {
      email: 'user@itil.com',
      username: 'user',
      passwordHash: userPasswordHash,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      departmentId: itDepartment.id,
      isActive: true,
    },
  });
  console.log('✅ Created Regular User:', regularUser.email);

  console.log('');
  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('📝 Default Accounts:');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│ Admin Account                               │');
  console.log('│ Email:    admin@itil.com                    │');
  console.log('│ Password: Admin@123                         │');
  console.log('│ Role:     ADMIN                             │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│ Manager Account                             │');
  console.log('│ Email:    manager@itil.com                  │');
  console.log('│ Password: Manager@123                       │');
  console.log('│ Role:     MANAGER                           │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│ User Account                                │');
  console.log('│ Email:    user@itil.com                     │');
  console.log('│ Password: User@123                          │');
  console.log('│ Role:     USER                              │');
  console.log('└─────────────────────────────────────────────┘');
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
