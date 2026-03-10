// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const passwordHash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@teamsync.dev" },
    update: {},
    create: {
      email: "demo@teamsync.dev",
      name: "Alex Johnson",
      passwordHash,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "jane@teamsync.dev" },
    update: {},
    create: {
      email: "jane@teamsync.dev",
      name: "Jane Smith",
      passwordHash,
    },
  });

  // Create organization
  const org = await prisma.organization.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corp",
      slug: "acme-corp",
    },
  });

  // Add members
  await prisma.teamMember.upsert({
    where: {
      userId_organizationId: { userId: user.id, organizationId: org.id },
    },
    update: {},
    create: { userId: user.id, organizationId: org.id, role: "ADMIN" },
  });

  await prisma.teamMember.upsert({
    where: {
      userId_organizationId: { userId: user2.id, organizationId: org.id },
    },
    update: {},
    create: { userId: user2.id, organizationId: org.id, role: "MEMBER" },
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete overhaul of the marketing website",
      status: "ACTIVE",
      organizationId: org.id,
      createdById: user.id,
      color: "#6366f1",
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App v2",
      description: "Next generation mobile experience",
      status: "PLANNING",
      organizationId: org.id,
      createdById: user.id,
      color: "#10b981",
    },
  });

  // Create tasks
  const tasks = [
    {
      title: "Design new landing page",
      status: "DONE",
      priority: "HIGH",
      projectId: project1.id,
      assignedToId: user.id,
    },
    {
      title: "Implement dark mode",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      projectId: project1.id,
      assignedToId: user.id,
    },
    {
      title: "Write API documentation",
      status: "TODO",
      priority: "LOW",
      projectId: project1.id,
      assignedToId: user2.id,
    },
    {
      title: "Setup CI/CD pipeline",
      status: "BACKLOG",
      priority: "MEDIUM",
      projectId: project1.id,
    },
    {
      title: "User research interviews",
      status: "IN_REVIEW",
      priority: "HIGH",
      projectId: project2.id,
      assignedToId: user2.id,
    },
    {
      title: "Define app architecture",
      status: "TODO",
      priority: "URGENT",
      projectId: project2.id,
      assignedToId: user.id,
    },
    {
      title: "Create wireframes",
      status: "DONE",
      priority: "HIGH",
      projectId: project2.id,
      assignedToId: user.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        ...task,
        createdById: user.id,
        completedAt: task.status === "DONE" ? new Date() : null,
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log("📧 Login: demo@teamsync.dev / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
