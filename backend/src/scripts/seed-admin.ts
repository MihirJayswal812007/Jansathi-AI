// ===== JanSathi AI — Admin Seed Script =====
// Usage: npx tsx src/scripts/seed-admin.ts <phone_or_email>
// Idempotent — safe to re-run. Creates user if not exists, sets role = "admin".

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const identifier = process.argv[2];

    if (!identifier) {
        console.error("Usage: npx tsx src/scripts/seed-admin.ts <phone_or_email>");
        console.error("  Example: npx tsx src/scripts/seed-admin.ts +919876543210");
        console.error("  Example: npx tsx src/scripts/seed-admin.ts admin@jansathi.ai");
        process.exit(1);
    }

    const isEmail = identifier.includes("@");
    const where = isEmail ? { email: identifier } : { phone: identifier };
    const data = isEmail ? { email: identifier } : { phone: identifier };

    // Find or create user
    let user = await prisma.user.findUnique({ where });

    if (!user) {
        user = await prisma.user.create({
            data: { ...data, role: "admin" },
        });
        console.log(`✅ Created new admin user: ${user.id} (${identifier})`);
    } else if (user.role === "admin") {
        console.log(`ℹ️  User ${identifier} is already an admin (${user.id})`);
    } else {
        await prisma.user.update({
            where: { id: user.id },
            data: { role: "admin" },
        });
        console.log(`✅ Promoted user ${identifier} to admin (${user.id})`);
    }

    // Also update any existing sessions for this user
    const updated = await prisma.session.updateMany({
        where: { userId: user.id },
        data: { role: "admin" },
    });

    if (updated.count > 0) {
        console.log(`   Updated ${updated.count} active session(s) to admin role.`);
    }

    console.log("\nDone. User can now log in via OTP and will have admin access.");
}

main()
    .catch((e) => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
