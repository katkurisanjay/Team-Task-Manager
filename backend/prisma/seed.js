const bcrypt = require('bcrypt');
const prisma = require('../src/config/db');

async function main() {
  console.log('🌱 Starting seed...');

  // Clean up
  await prisma.ticket.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const password_hash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Alice Admin',
      email: 'alice@example.com',
      password_hash,
      role: 'ADMIN',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'Bob Member',
      email: 'bob@example.com',
      password_hash,
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Charlie Member',
      email: 'charlie@example.com',
      password_hash,
      role: 'MEMBER',
    },
  });

  console.log('✅ Users created');

  // 2. Create Workspace
  const workspace1 = await prisma.workspace.create({
    data: {
      name: 'Website Redesign',
      description: 'Q3 Marketing site overhaul',
      owner_id: admin.id,
      members: {
        create: [
          { user_id: admin.id },
          { user_id: member1.id },
          { user_id: member2.id }
        ]
      }
    }
  });

  console.log('✅ Workspace created');

  // 3. Create Tickets
  await prisma.ticket.create({
    data: {
      title: 'Design new landing page',
      description: 'Create Figma mocks for the hero section.',
      status: 'DONE',
      workspace_id: workspace1.id,
      assignee_id: member1.id,
      created_by: admin.id,
    }
  });

  await prisma.ticket.create({
    data: {
      title: 'Implement Auth Flow',
      description: 'Setup JWT and HttpOnly cookies.',
      status: 'IN_PROGRESS',
      workspace_id: workspace1.id,
      assignee_id: member2.id,
      created_by: admin.id,
    }
  });

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2);

  await prisma.ticket.create({
    data: {
      title: 'Setup Database',
      description: 'Initialize Prisma and PostgreSQL.',
      status: 'TODO',
      due_date: pastDate, // Overdue
      workspace_id: workspace1.id,
      assignee_id: admin.id,
      created_by: admin.id,
    }
  });

  console.log('✅ Tickets created');
  console.log('🎉 Seed complete! Use alice@example.com (ADMIN) and password123 to log in.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
