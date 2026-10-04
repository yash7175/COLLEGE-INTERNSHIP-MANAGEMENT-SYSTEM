import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Removing all mock data from College Internship Management System...');

  // 1. Delete all transactional, evaluation, and application records
  console.log('[-] Deleting mock system feedback...');
  await prisma.systemFeedback.deleteMany();

  console.log('[-] Deleting mock notifications...');
  await prisma.notification.deleteMany();

  console.log('[-] Deleting mock student feedback/ratings...');
  await prisma.feedback.deleteMany();

  console.log('[-] Deleting mock evaluations...');
  await prisma.evaluation.deleteMany();

  console.log('[-] Deleting mock interview schedules...');
  await prisma.interview.deleteMany();

  console.log('[-] Deleting mock application timelines...');
  await prisma.applicationTimeline.deleteMany();

  console.log('[-] Deleting mock applications...');
  await prisma.application.deleteMany();

  console.log('[-] Deleting mock student resumes...');
  await prisma.resume.deleteMany();

  console.log('[-] Deleting mock internship postings...');
  await prisma.internship.deleteMany();

  console.log('[-] Deleting mock partner companies...');
  await prisma.company.deleteMany();

  console.log('[-] Deleting mock student profiles...');
  await prisma.student.deleteMany();

  console.log('[-] Deleting mock faculty profiles...');
  await prisma.faculty.deleteMany();

  // 2. Delete all non-admin users
  console.log('[-] Deleting mock student and faculty user accounts...');
  await prisma.user.deleteMany({
    where: {
      role: {
        not: Role.ADMIN,
      },
    },
  });

  // 3. Ensure a clean, verified Super Admin account exists
  const defaultPassword = 'Password@123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash,
      isActive: true,
      isVerified: true,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@example.com',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  console.log('=======================================================');
  console.log('✅ All mock data removed successfully!');
  console.log(`🛡️  Active Admin Account: ${admin.email}`);
  console.log(`🔑 Admin Password: ${defaultPassword}`);
  console.log('=======================================================');

  // 4. Clean sample upload files from backend/uploads
  const uploadsDir = path.join(__dirname, '../uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      if (file.startsWith('sample-') || file.endsWith('.pdf')) {
        try {
          fs.unlinkSync(path.join(uploadsDir, file));
          console.log(`🗑️  Removed sample upload: ${file}`);
        } catch {
          // ignore
        }
      }
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
