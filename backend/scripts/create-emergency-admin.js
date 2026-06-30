import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function createEmergencyAdmin() {
  console.log('🚨 Creating emergency admin account...\n');

  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@itil.com' }
    });

    if (existing) {
      console.log('✅ Admin account already exists!');
      console.log(`   Email: admin@itil.com`);
      console.log(`   ID: ${existing.id}`);
      console.log(`   Role: ${existing.role}\n`);
      return;
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@itil.com',
        password: hashedPassword,
        fullName: 'System Administrator',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Emergency admin account created!');
    console.log(`   Email: admin@itil.com`);
    console.log(`   Password: Admin@123`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Role: ${admin.role}\n`);

    // Show database stats
    const [userCount, assetCount, deptCount, locCount] = await Promise.all([
      prisma.user.count(),
      prisma.asset.count(),
      prisma.department.count(),
      prisma.location.count(),
    ]);

    console.log('📊 Current database state:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Assets: ${assetCount}`);
    console.log(`   Departments: ${deptCount}`);
    console.log(`   Locations: ${locCount}\n`);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    throw error;
  }
}

createEmergencyAdmin()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
