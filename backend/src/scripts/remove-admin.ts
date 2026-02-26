import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const identifier = process.argv[2];

    if (!identifier) {
        console.error("Usage: npx tsx src/scripts/remove-admin.ts <phone_or_email>");
        console.error("  Example: npx tsx src/scripts/remove-admin.ts +919876543210");
        console.error("  Example: npx tsx src/scripts/remove-admin.ts admin@jansathi.ai");
        process.exit(1);
    }

    const isEmail = identifier.includes("@");
    const where = isEmail ? { email: identifier } : { phone: identifier };

    // Find user
    const user = await prisma.user.findUnique({ where });

    if (!user) {
        console.error(`❌ User not found with identifier: ${identifier}`);
        process.exit(1);
    }

    if (user.role !== "admin") {
        console.log(`ℹ️  User ${identifier} is already not an admin (Current role: ${user.role})`);
        process.exit(0);
    }

    // Downgrade to standard user
    await prisma.user.update({
        where: { id: user.id },
        data: { role: "user" },
    });
    console.log(`✅ Removed admin privileges from user ${identifier} (${user.id})`);

    // Also update any existing sessions for this user
    const updated = await prisma.session.updateMany({
        where: { userId: user.id },
        data: { role: "user" },
    });

    if (updated.count > 0) {
        console.log(`   Downgraded ${updated.count} active session(s) to "user" role.`);
    }

    console.log("\nDone. User will immediately lose admin access.");
}

main()
    .catch((e) => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
