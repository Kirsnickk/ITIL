import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function minimalSeed() {
  console.log('🌱 Minimal seed - creating admin + sample data...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing database...');
    await prisma.asset.deleteMany({});
    await prisma.license.deleteMany({});
    await prisma.procurementRequest.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.department.deleteMany({});
    console.log('   ✓ Database cleared\n');

    // Create admin
    console.log('👤 Creating admin account...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@itil.com',
        username: 'admin',
        passwordHash: adminPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log('   ✓ Admin created: admin@itil.com / Admin@123\n');

    // Create departments
    console.log('📋 Creating departments...');
    const departments = await prisma.department.createMany({
      data: [
        { name: 'IT', code: 'IT' },
        { name: 'Finance', code: 'FIN' },
        { name: 'HR', code: 'HR' },
        { name: 'Operations', code: 'OPS' },
        { name: 'Marketing', code: 'MKT' },
      ],
    });
    console.log(`   ✓ Created ${departments.count} departments\n`);

    // Create locations
    console.log('📍 Creating locations...');
    const locations = await prisma.location.createMany({
      data: [
        { name: 'Head Office', code: 'HO', type: 'OFFICE', address: 'Ho Chi Minh City', country: 'VN' },
        { name: 'Store 1', code: 'ST01', type: 'STORE', address: 'District 1, HCMC', country: 'VN' },
        { name: 'Store 2', code: 'ST02', type: 'STORE', address: 'District 3, HCMC', country: 'VN' },
      ],
    });
    console.log(`   ✓ Created ${locations.count} locations\n`);

    // Create sample user
    console.log('👥 Creating sample user...');
    const userPassword = await bcrypt.hash('User@123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'user@itil.com',
        username: 'testuser',
        passwordHash: userPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        isActive: true,
      },
    });
    console.log('   ✓ User created: user@itil.com / User@123\n');

    console.log('═══════════════════════════════════════');
    console.log('✅ Minimal seed completed!');
    console.log('═══════════════════════════════════════');
    console.log('📊 Summary:');
    console.log('   - Admin: admin@itil.com / Admin@123');
    console.log('   - User: user@itil.com / User@123');
    console.log(`   - Departments: ${departments.count}`);
    console.log(`   - Locations: ${locations.count}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

minimalSeed()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
