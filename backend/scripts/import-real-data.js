import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load .env file from backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

// Helper: Read JSON file
function readJSON(filename) {
  const filePath = path.join(__dirname, 'extracted-data', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ File not found: ${filePath}`);
    console.error(`   ℹ️  Current directory: ${__dirname}`);
    console.error(`   ℹ️  Looking for: ${filename}`);
    throw new Error(`File not found: ${filename}`);
  }
  
  // Check if file is readable
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
  } catch (err) {
    console.error(`   ❌ File not readable: ${filePath}`);
    throw new Error(`File not readable: ${filename}`);
  }
  
  // Read and parse JSON
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`   ❌ Error reading/parsing ${filename}: ${err.message}`);
    throw err;
  }
}

// Helper: Generate asset tag from asset ID
function generateAssetTag(assetId) {
  return assetId || `ASSET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper: Map asset type to Prisma enum
function mapAssetType(type) {
  const mapping = {
    'Desktop': 'DESKTOP',
    'Laptop': 'LAPTOP',
    'Monitor': 'MONITOR',
    'Printer': 'PRINTER',
    'Server': 'SERVER',
    'Network Device': 'NETWORK_EQUIPMENT',
    'Scanner': 'OTHER',
    'Projector': 'OTHER',
    'Phone': 'MOBILE_DEVICE',
    'Tablet': 'MOBILE_DEVICE',
  };
  return mapping[type] || 'OTHER';
}

// Helper: Map asset status to Prisma enum
function mapAssetStatus(status) {
  const mapping = {
    'In Use': 'IN_USE',
    'Available': 'AVAILABLE',
    'Maintenance': 'MAINTENANCE',
    'Retired': 'RETIRED',
    'Lost': 'DISPOSED',
    'Broken': 'MAINTENANCE',
  };
  return mapping[status] || 'AVAILABLE';
}

// Helper: Clear database
async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  await prisma.asset.deleteMany({});
  await prisma.license.deleteMany({});
  await prisma.procurementRequest.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.department.deleteMany({});
  console.log('   ✓ Database cleared\n');
}

async function main() {
  console.log('🌱 Starting real data import from Excel extraction...\n');

  // Clear existing data first
  await clearDatabase();

  // Read JSON data
  console.log('📂 Reading JSON files...');
  const usersData = readJSON('users.json');
  const assetsData = readJSON('assets.json');
  const departmentsData = readJSON('departments.json');
  const locationsData = readJSON('locations.json');
  console.log(`   ✓ Users: ${usersData.length}`);
  console.log(`   ✓ Assets: ${assetsData.length}`);
  console.log(`   ✓ Departments: ${departmentsData.length}`);
  console.log(`   ✓ Locations: ${locationsData.length}\n`);

  // ============================================
  // DEPARTMENTS
  // ============================================
  console.log('🏢 Importing departments...');
  const departmentMap = {};
  let deptCount = 0;
  
  for (const dept of departmentsData) {
    try {
      const created = await prisma.department.create({
        data: {
          name: dept.name,
          code: dept.code,
          description: `${dept.name} Department`,
          isActive: true,
        },
      });
      departmentMap[dept.name] = created.id;
      deptCount++;
    } catch (error) {
      console.log(`   ⚠️  Skip duplicate department: ${dept.name}`);
    }
  }
  console.log(`   ✓ Created ${deptCount} departments\n`);

  // ============================================
  // LOCATIONS
  // ============================================
  console.log('📍 Importing locations...');
  const locationMap = {};
  let locCount = 0;
  
  for (const loc of locationsData) {
    try {
      const created = await prisma.location.create({
        data: {
          name: loc.name,
          code: loc.code,
          type: loc.type,
          country: 'VN',
          isActive: true,
        },
      });
      locationMap[loc.code] = created.id;
      locCount++;
    } catch (error) {
      console.log(`   ⚠️  Skip duplicate location: ${loc.code}`);
    }
  }
  console.log(`   ✓ Created ${locCount} locations\n`);

  // ============================================
  // USERS
  // ============================================
  console.log('👤 Importing users...');
  const userMap = {};
  let userCount = 0;
  
  // Create default password hash for all users
  const defaultPassword = await bcrypt.hash('User@123', 10);
  
  for (const user of usersData) {
    try {
      // Find department ID
      const departmentId = user.department ? departmentMap[user.department] : null;
      
      // Determine role based on job title or department
      let role = 'USER';
      if (user.jobTitle && (
        user.jobTitle.includes('Manager') || 
        user.jobTitle.includes('Director') ||
        user.jobTitle.includes('Head')
      )) {
        role = 'MANAGER';
      }
      if (user.department && user.department.includes('BOD')) {
        role = 'ADMIN';
      }
      
      const created = await prisma.user.create({
        data: {
          email: user.email,
          password: defaultPassword,
          fullName: user.fullName || user.displayName || user.email.split('@')[0],
          role: role,
          isActive: true,
          departmentId: departmentId,
        },
      });
      userMap[user.email] = created.id;
      userMap[user.assetId] = created.id; // Map by asset ID too for asset assignment
      userCount++;
    } catch (error) {
      console.log(`   ⚠️  Skip duplicate user: ${user.email}`);
    }
  }
  console.log(`   ✓ Created ${userCount} users (default password: User@123)\n`);

  // ============================================
  // ASSETS
  // ============================================
  console.log('💻 Importing assets...');
  let assetCount = 0;
  const seenAssetTags = new Set();
  
  for (const asset of assetsData) {
    try {
      // Generate unique asset tag
      let assetTag = generateAssetTag(asset.assetId);
      let counter = 1;
      while (seenAssetTags.has(assetTag)) {
        assetTag = `${asset.assetId}-${counter}`;
        counter++;
      }
      seenAssetTags.add(assetTag);
      
      // Map location
      const locationId = asset.assignedTo ? locationMap[asset.assignedTo] : null;
      
      // Map assigned user (try by asset ID from user data)
      const assignedUserId = asset.assignedTo ? userMap[asset.assignedTo] : null;
      
      // Parse purchase date
      let purchaseDate = null;
      if (asset.purchaseDate) {
        try {
          purchaseDate = new Date(asset.purchaseDate);
        } catch (e) {
          // Ignore invalid dates
        }
      }
      
      // Create asset
      await prisma.asset.create({
        data: {
          assetTag: assetTag,
          name: asset.assetDescription || asset.description || 'Unknown Asset',
          type: mapAssetType(asset.assetType),
          status: mapAssetStatus(asset.status),
          brand: asset.brand,
          model: asset.model,
          serialNumber: asset.serialNumber,
          specifications: JSON.stringify({
            cpu: asset.cpu,
            ram: asset.ram,
            hardDisk: asset.hardDisk,
            hardDiskType: asset.hardDiskType,
            additionalSpecs: asset.additionalSpecs,
            hostname: asset.hostname,
            oldHostname: asset.oldHostname,
          }),
          purchaseDate: purchaseDate,
          vendor: asset.vendor,
          notes: asset.note,
          locationId: locationId,
          assignedToId: assignedUserId,
        },
      });
      assetCount++;
    } catch (error) {
      console.log(`   ⚠️  Error importing asset ${asset.assetId}: ${error.message}`);
    }
  }
  console.log(`   ✓ Created ${assetCount} assets\n`);

  // ============================================
  // EMERGENCY ADMIN ACCOUNT
  // ============================================
  console.log('👤 Creating emergency admin account...');
  
  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@itil.com' }
    });
    
    if (!existingAdmin) {
      // Create admin account
      const adminPassword = await bcrypt.hash('Admin@123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@itil.com',
          password: adminPassword,
          fullName: 'System Administrator',
          role: 'ADMIN',
          isActive: true,
        },
      });
      console.log('   ✓ Emergency admin created (admin@itil.com / Admin@123)');
    } else {
      console.log('   ✓ Admin account already exists');
    }
  } catch (error) {
    console.log(`   ⚠️  Could not create admin: ${error.message}`);
  }
  console.log();

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═══════════════════════════════════════');
  console.log('🎉 REAL DATA IMPORT COMPLETE');
  console.log('═══════════════════════════════════════\n');
  console.log(`✅ Departments: ${deptCount}`);
  console.log(`✅ Locations: ${locCount}`);
  console.log(`✅ Users: ${userCount}`);
  console.log(`✅ Assets: ${assetCount}`);
  console.log('\n📝 Default credentials:');
  console.log('   Email: Any user email from Excel (e.g., uyen.nguyenhaphuong@mapactive.vn)');
  console.log('   Password: User@123');
  console.log('\n   Or use the seed admin account:');
  console.log('   Email: admin@itil.com');
  console.log('   Password: Admin@123\n');
}

main()
  .catch((e) => {
    console.error('❌ Import error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
