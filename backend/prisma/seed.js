import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // ============================================
  // DEPARTMENTS
  // ============================================
  console.log('📊 Creating departments...');
  
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'IT' },
      update: {},
      create: {
        code: 'IT',
        name: 'Information Technology',
        description: 'IT infrastructure, software, and technical support',
      },
    }),
    prisma.department.upsert({
      where: { code: 'HR' },
      update: {},
      create: {
        code: 'HR',
        name: 'Human Resources',
        description: 'Employee management and organizational development',
      },
    }),
    prisma.department.upsert({
      where: { code: 'FIN' },
      update: {},
      create: {
        code: 'FIN',
        name: 'Finance & Accounting',
        description: 'Financial planning, accounting, and budget management',
      },
    }),
    prisma.department.upsert({
      where: { code: 'OPS' },
      update: {},
      create: {
        code: 'OPS',
        name: 'Operations',
        description: 'Store operations and logistics management',
      },
    }),
    prisma.department.upsert({
      where: { code: 'SALES' },
      update: {},
      create: {
        code: 'SALES',
        name: 'Sales & Marketing',
        description: 'Sales strategy, marketing campaigns, customer engagement',
      },
    }),
  ]);
  console.log(`✅ Created ${departments.length} departments`);

  // ============================================
  // LOCATIONS
  // ============================================
  console.log('📍 Creating locations...');
  
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { code: 'HQ-VN' },
      update: {},
      create: {
        code: 'HQ-VN',
        name: 'Head Office Vietnam',
        type: 'OFFICE',
        country: 'Vietnam',
        city: 'Ho Chi Minh City',
        address: '123 Nguyen Hue Street, District 1',
      },
    }),
    prisma.location.upsert({
      where: { code: 'STORE-HCM-01' },
      update: {},
      create: {
        code: 'STORE-HCM-01',
        name: 'HCMC Store District 1',
        type: 'STORE',
        country: 'Vietnam',
        city: 'Ho Chi Minh City',
        address: '456 Le Loi Boulevard, District 1',
      },
    }),
    prisma.location.upsert({
      where: { code: 'STORE-HCM-02' },
      update: {},
      create: {
        code: 'STORE-HCM-02',
        name: 'HCMC Store District 7',
        type: 'STORE',
        country: 'Vietnam',
        city: 'Ho Chi Minh City',
        address: '789 Nguyen Van Linh, District 7',
      },
    }),
    prisma.location.upsert({
      where: { code: 'STORE-HN-01' },
      update: {},
      create: {
        code: 'STORE-HN-01',
        name: 'Hanoi Store Hoan Kiem',
        type: 'STORE',
        country: 'Vietnam',
        city: 'Hanoi',
        address: '321 Hang Bai Street, Hoan Kiem District',
      },
    }),
    prisma.location.upsert({
      where: { code: 'STORE-DA-01' },
      update: {},
      create: {
        code: 'STORE-DA-01',
        name: 'Da Nang Store Hai Chau',
        type: 'STORE',
        country: 'Vietnam',
        city: 'Da Nang',
        address: '654 Tran Phu Street, Hai Chau District',
      },
    }),
    prisma.location.upsert({
      where: { code: 'STORE-PP-01' },
      update: {},
      create: {
        code: 'STORE-PP-01',
        name: 'Phnom Penh Store Central',
        type: 'STORE',
        country: 'Cambodia',
        city: 'Phnom Penh',
        address: '123 Monivong Boulevard, Khan Daun Penh',
      },
    }),
    prisma.location.upsert({
      where: { code: 'STORE-VTE-01' },
      update: {},
      create: {
        code: 'STORE-VTE-01',
        name: 'Vientiane Store Downtown',
        type: 'STORE',
        country: 'Laos',
        city: 'Vientiane',
        address: '456 Lane Xang Avenue, Chanthabouly District',
      },
    }),
    prisma.location.upsert({
      where: { code: 'WH-HCM-01' },
      update: {},
      create: {
        code: 'WH-HCM-01',
        name: 'HCMC Central Warehouse',
        type: 'WAREHOUSE',
        country: 'Vietnam',
        city: 'Ho Chi Minh City',
        address: 'Thu Duc Industrial Zone, Thu Duc District',
      },
    }),
  ]);
  console.log(`✅ Created ${locations.length} locations`);

  // ============================================
  // USERS
  // ============================================
  console.log('👤 Creating users...');
  
  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
  const hashedManagerPassword = await bcrypt.hash('Manager@123', 10);
  const hashedUserPassword = await bcrypt.hash('User@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@itil.com' },
    update: {},
    create: {
      email: 'admin@itil.com',
      username: 'admin',
      passwordHash: hashedAdminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      departmentId: departments[0].id, // IT
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@itil.com' },
    update: {},
    create: {
      email: 'manager@itil.com',
      username: 'manager',
      passwordHash: hashedManagerPassword,
      firstName: 'Department',
      lastName: 'Manager',
      role: 'MANAGER',
      departmentId: departments[3].id, // Operations
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@itil.com' },
    update: {},
    create: {
      email: 'user@itil.com',
      username: 'user',
      passwordHash: hashedUserPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      departmentId: departments[4].id, // Sales
    },
  });

  console.log('✅ Created 3 users (Admin, Manager, User)');

  // ============================================
  // ASSETS
  // ============================================
  console.log('💻 Creating assets...');
  
  const assets = await prisma.asset.createMany({
    data: [
      // Laptops
      { assetTag: 'LAPTOP-001', name: 'Dell Latitude 7420', type: 'LAPTOP', manufacturer: 'Dell', model: 'Latitude 7420', serialNumber: 'DL7420-2024-001', purchaseDate: new Date('2024-01-15'), purchaseCost: 1500, status: 'IN_USE', locationId: locations[0].id, departmentId: departments[0].id, assignedToId: adminUser.id },
      { assetTag: 'LAPTOP-002', name: 'MacBook Pro 14"', type: 'LAPTOP', manufacturer: 'Apple', model: 'MacBook Pro M2', serialNumber: 'MBP14-2024-002', purchaseDate: new Date('2024-02-10'), purchaseCost: 2300, status: 'IN_USE', locationId: locations[0].id, departmentId: departments[0].id },
      { assetTag: 'LAPTOP-003', name: 'Lenovo ThinkPad X1', type: 'LAPTOP', manufacturer: 'Lenovo', model: 'ThinkPad X1 Carbon', serialNumber: 'LNV-X1-2024-003', purchaseDate: new Date('2024-03-05'), purchaseCost: 1800, status: 'IN_USE', locationId: locations[1].id, departmentId: departments[3].id, assignedToId: managerUser.id },
      { assetTag: 'LAPTOP-004', name: 'HP EliteBook 840', type: 'LAPTOP', manufacturer: 'HP', model: 'EliteBook 840 G9', serialNumber: 'HP840-2024-004', purchaseDate: new Date('2024-01-20'), purchaseCost: 1600, status: 'AVAILABLE', locationId: locations[7].id, departmentId: departments[3].id },
      { assetTag: 'LAPTOP-005', name: 'Dell XPS 13', type: 'LAPTOP', manufacturer: 'Dell', model: 'XPS 13 9320', serialNumber: 'DXPS13-2024-005', purchaseDate: new Date('2024-04-01'), purchaseCost: 1700, status: 'IN_USE', locationId: locations[2].id, departmentId: departments[4].id, assignedToId: regularUser.id },
      
      // Desktops
      { assetTag: 'DESK-001', name: 'Dell OptiPlex 7090', type: 'DESKTOP', manufacturer: 'Dell', model: 'OptiPlex 7090', serialNumber: 'DOP7090-2023-001', purchaseDate: new Date('2023-11-10'), purchaseCost: 1200, status: 'IN_USE', locationId: locations[1].id, departmentId: departments[1].id },
      { assetTag: 'DESK-002', name: 'HP ProDesk 400', type: 'DESKTOP', manufacturer: 'HP', model: 'ProDesk 400 G9', serialNumber: 'HP400-2023-002', purchaseDate: new Date('2023-10-15'), purchaseCost: 900, status: 'IN_USE', locationId: locations[3].id, departmentId: departments[2].id },
      
      // Monitors
      { assetTag: 'MON-001', name: 'Dell UltraSharp 27"', type: 'MONITOR', manufacturer: 'Dell', model: 'U2723DE', serialNumber: 'DUS27-2024-001', purchaseDate: new Date('2024-01-15'), purchaseCost: 550, status: 'IN_USE', locationId: locations[0].id, departmentId: departments[0].id },
      { assetTag: 'MON-002', name: 'LG UltraWide 34"', type: 'MONITOR', manufacturer: 'LG', model: '34WN80C-B', serialNumber: 'LGUW34-2024-002', purchaseDate: new Date('2024-02-20'), purchaseCost: 650, status: 'IN_USE', locationId: locations[0].id, departmentId: departments[0].id },
      { assetTag: 'MON-003', name: 'Samsung 24" LED', type: 'MONITOR', manufacturer: 'Samsung', model: 'S24A600', serialNumber: 'SS24-2023-003', purchaseDate: new Date('2023-12-01'), purchaseCost: 280, status: 'AVAILABLE', locationId: locations[7].id, departmentId: departments[3].id },
      { assetTag: 'MON-004', name: 'ASUS ProArt 27"', type: 'MONITOR', manufacturer: 'ASUS', model: 'PA278QV', serialNumber: 'ASPA27-2024-004', purchaseDate: new Date('2024-03-10'), purchaseCost: 480, status: 'IN_USE', locationId: locations[4].id, departmentId: departments[4].id },
      
      // Printers
      { assetTag: 'PRINT-001', name: 'HP LaserJet Pro M404', type: 'PRINTER', manufacturer: 'HP', model: 'LaserJet Pro M404dn', serialNumber: 'HPM404-2023-001', purchaseDate: new Date('2023-09-15'), purchaseCost: 450, status: 'IN_USE', locationId: locations[0].id, departmentId: departments[1].id },
      { assetTag: 'PRINT-002', name: 'Canon imageCLASS', type: 'PRINTER', manufacturer: 'Canon', model: 'MF445dw', serialNumber: 'CNMF445-2023-002', purchaseDate: new Date('2023-08-20'), purchaseCost: 520, status: 'IN_USE', locationId: locations[1].id, departmentId: departments[3].id },
      { assetTag: 'PRINT-003', name: 'Brother HL-L3290', type: 'PRINTER', manufacturer: 'Brother', model: 'HL-L3290CDW', serialNumber: 'BRL3290-2024-003', purchaseDate: new Date('2024-01-05'), purchaseCost: 380, status: 'MAINTENANCE', locationId: locations[3].id, departmentId: departments[2].id },
      
      // Servers
      { assetTag: 'SRV-001', name: 'Dell PowerEdge R450', type: 'SERVER', manufacturer: 'Dell', model: 'PowerEdge R450', serialNumber: 'DPE450-2023-001', purchaseDate: new Date('2023-07-01'), purchaseCost: 5500, status: 'IN_USE', locationId: locations[0].id, departmentId: departments[0].id },
      { assetTag: 'SRV-002', name: 'HP ProLiant DL380', type: 'SERVER', manufacturer: 'HP', model: 'ProLiant DL380 Gen10', serialNumber: 'HPDL380-2023-002', purchaseDate: new Date('2023-06-15'), purchaseCost: 6200, status: 'IN_USE', locationId: locations[0].id, departmentId: departments[0].id },
      
      // Network Devices
      { assetTag: 'NET-001', name: 'Cisco Catalyst Switch', type: 'NETWORK_DEVICE', manufacturer: 'Cisco', model: 'Catalyst 2960-X', serialNumber: 'CSC2960-2023-001', purchaseDate: new Date('2023-05-10'), purchaseCost: 1800, status: 'IN_USE', locationId: locations[0].id, departmentId: departments[0].id },
      { assetTag: 'NET-002', name: 'Ubiquiti UniFi AP', type: 'NETWORK_DEVICE', manufacturer: 'Ubiquiti', model: 'UniFi AP AC Pro', serialNumber: 'UBIAP-2024-002', purchaseDate: new Date('2024-02-01'), purchaseCost: 150, status: 'IN_USE', locationId: locations[1].id, departmentId: departments[0].id },
      { assetTag: 'NET-003', name: 'TP-Link Router', type: 'NETWORK_DEVICE', manufacturer: 'TP-Link', model: 'Archer AX73', serialNumber: 'TPLAX73-2024-003', purchaseDate: new Date('2024-03-15'), purchaseCost: 180, status: 'AVAILABLE', locationId: locations[7].id, departmentId: departments[0].id },
    ],
  });
  console.log(`✅ Created ${assets.count} assets`);

  // ============================================
  // LICENSES
  // ============================================
  console.log('🔑 Creating licenses...');
  
  const licenses = await prisma.license.createMany({
    data: [
      { licenseKey: 'M365-ENT-2024-001', product: 'Microsoft 365 Enterprise', vendor: 'Microsoft', type: 'SUBSCRIPTION', seatsTotal: 150, seatsUsed: 87, purchaseDate: new Date('2024-01-01'), expiryDate: new Date('2025-01-01'), cost: 18000, renewalCost: 18500, status: 'ACTIVE' },
      { licenseKey: 'ADOBE-CC-2024-001', product: 'Adobe Creative Cloud All Apps', vendor: 'Adobe', type: 'SUBSCRIPTION', seatsTotal: 25, seatsUsed: 18, purchaseDate: new Date('2024-02-01'), expiryDate: new Date('2025-02-01'), cost: 13500, renewalCost: 14000, status: 'ACTIVE' },
      { licenseKey: 'ACAD-2024-001', product: 'AutoCAD Professional', vendor: 'Autodesk', type: 'SUBSCRIPTION', seatsTotal: 10, seatsUsed: 8, purchaseDate: new Date('2024-03-01'), expiryDate: new Date('2025-03-01'), cost: 18000, renewalCost: 18500, status: 'ACTIVE' },
      { licenseKey: 'ZOOM-BIZ-2024-001', product: 'Zoom Business', vendor: 'Zoom', type: 'SUBSCRIPTION', seatsTotal: 100, seatsUsed: 72, purchaseDate: new Date('2024-01-15'), expiryDate: new Date('2025-01-15'), cost: 1800, renewalCost: 1900, status: 'ACTIVE' },
      { licenseKey: 'SLACK-ENT-2024-001', product: 'Slack Enterprise Grid', vendor: 'Slack', type: 'SUBSCRIPTION', seatsTotal: 200, seatsUsed: 145, purchaseDate: new Date('2024-02-01'), expiryDate: new Date('2025-02-01'), cost: 2400, renewalCost: 2500, status: 'ACTIVE' },
      { licenseKey: 'JIRA-SOFT-2024-001', product: 'Jira Software Premium', vendor: 'Atlassian', type: 'SUBSCRIPTION', seatsTotal: 50, seatsUsed: 32, purchaseDate: new Date('2024-01-20'), expiryDate: new Date('2025-01-20'), cost: 7000, renewalCost: 7200, status: 'ACTIVE' },
      { licenseKey: 'FIGMA-PRO-2024-001', product: 'Figma Professional', vendor: 'Figma', type: 'SUBSCRIPTION', seatsTotal: 15, seatsUsed: 12, purchaseDate: new Date('2024-03-01'), expiryDate: new Date('2025-03-01'), cost: 2160, renewalCost: 2250, status: 'ACTIVE' },
      { licenseKey: 'TABLEAU-CRE-2023-001', product: 'Tableau Creator', vendor: 'Tableau', type: 'SUBSCRIPTION', seatsTotal: 5, seatsUsed: 4, purchaseDate: new Date('2023-12-01'), expiryDate: new Date('2024-12-01'), cost: 4200, renewalCost: 4350, status: 'PENDING_RENEWAL' },
    ],
  });
  console.log(`✅ Created ${licenses.count} licenses`);

  // ============================================
  // PROCUREMENT REQUESTS
  // ============================================
  console.log('📦 Creating procurement requests...');
  
  const procurements = await prisma.procurementRequest.createMany({
    data: [
      { requestNumber: 'PR-2024-001', title: 'Dell Laptops for Sales Team', description: '10 Dell Latitude 7420 laptops for new sales hires', requestorId: managerUser.id, departmentId: departments[4].id, estimatedCost: 15000, priority: 'HIGH', status: 'PENDING_APPROVAL', requestDate: new Date('2024-06-15'), vendor: 'Dell Technologies' },
      { requestNumber: 'PR-2024-002', title: 'Office Furniture for New Store', description: 'Desks, chairs, and storage cabinets for Hanoi store expansion', requestorId: managerUser.id, departmentId: departments[3].id, estimatedCost: 8500, priority: 'MEDIUM', status: 'APPROVED', requestDate: new Date('2024-06-10'), approvedDate: new Date('2024-06-20'), vendor: 'Office Depot Vietnam' },
      { requestNumber: 'PR-2024-003', title: 'Network Infrastructure Upgrade', description: 'Cisco switches and access points for warehouse', requestorId: adminUser.id, departmentId: departments[0].id, estimatedCost: 12000, actualCost: 11500, priority: 'HIGH', status: 'COMPLETED', requestDate: new Date('2024-05-01'), approvedDate: new Date('2024-05-05'), completedDate: new Date('2024-06-15'), vendor: 'Cisco Systems' },
      { requestNumber: 'PR-2024-004', title: 'Printer Maintenance Parts', description: 'Replacement toner and drums for HP and Canon printers', requestorId: regularUser.id, departmentId: departments[3].id, estimatedCost: 2500, priority: 'MEDIUM', status: 'IN_PROGRESS', requestDate: new Date('2024-06-20'), approvedDate: new Date('2024-06-22'), vendor: 'HP Vietnam' },
      { requestNumber: 'PR-2024-005', title: 'Software Licenses Renewal', description: 'Annual renewal for Adobe Creative Cloud and AutoCAD', requestorId: adminUser.id, departmentId: departments[0].id, estimatedCost: 32000, priority: 'URGENT', status: 'PENDING_APPROVAL', requestDate: new Date('2024-06-25'), vendor: 'Adobe & Autodesk' },
    ],
  });
  console.log(`✅ Created ${procurements.count} procurement requests`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Departments: ${departments.length}`);
  console.log(`   - Locations: ${locations.length}`);
  console.log(`   - Users: 3 (Admin, Manager, User)`);
  console.log(`   - Assets: ${assets.count}`);
  console.log(`   - Licenses: ${licenses.count}`);
  console.log(`   - Procurement Requests: ${procurements.count}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
