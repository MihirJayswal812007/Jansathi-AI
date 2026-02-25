// ===== JanSathi AI — Database Seed Script =====
// Seeds the Supabase PostgreSQL database with demo data for CommPulse dashboard

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MODES = ["janseva", "janshiksha", "jankrishi", "janvyapar", "jankaushal"] as const;
const INTENTS = ["scheme_check", "crop_disease", "product_listing", "resume_help", "concept_explain"];
const EVENT_TYPES = ["message_sent", "voice_start", "quick_action_click", "mode_select", "page_view"];

async function main() {
    console.log("🌱 Seeding JanSathi AI database...\n");

    // Clean existing data
    await prisma.analyticsEvent.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.user.deleteMany();
    console.log("  ✓ Cleared existing data");

    // Create 150 demo users
    const users = [];
    for (let i = 0; i < 150; i++) {
        const user = await prisma.user.create({
            data: {
                name: `User ${i + 1}`,
                language: Math.random() > 0.3 ? "hi" : "en",
                state: ["UP", "MP", "Rajasthan", "Bihar", "Maharashtra"][Math.floor(Math.random() * 5)],
                favoriteModules: [MODES[Math.floor(Math.random() * MODES.length)]],
                voiceEnabled: true,
                fontSize: "normal",
                createdAt: new Date(Date.now() - Math.random() * 7 * 86400000),
                lastActiveAt: new Date(Date.now() - Math.random() * 2 * 86400000),
            },
        });
        users.push(user);
    }
    console.log(`  ✓ Created ${users.length} users`);

    // Create 420 conversations with messages
    let messageCount = 0;
    for (let i = 0; i < 420; i++) {
        const mode = MODES[Math.floor(Math.random() * MODES.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const startedAt = new Date(Date.now() - Math.random() * 7 * 86400000);

        const conv = await prisma.conversation.create({
            data: {
                userId: user.id,
                mode,
                satisfaction: Math.floor(Math.random() * 3) + 3, // 3-5
                resolved: Math.random() > 0.15,
                startedAt,
                messages: {
                    create: [
                        {
                            role: "user",
                            content: `Demo query about ${mode}`,
                            intent: INTENTS[Math.floor(Math.random() * INTENTS.length)],
                            confidence: 0.8 + Math.random() * 0.2,
                            timestamp: startedAt,
                        },
                        {
                            role: "assistant",
                            content: `Demo response for ${mode}`,
                            responseTimeMs: 800 + Math.floor(Math.random() * 1500),
                            timestamp: new Date(startedAt.getTime() + 1500),
                        },
                    ],
                },
            },
        });
        messageCount += 2;
    }
    console.log(`  ✓ Created 420 conversations with ${messageCount} messages`);

    // Create 800 analytics events
    for (let i = 0; i < 800; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const timestamp = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000);
        const user = users[Math.floor(Math.random() * users.length)];

        await prisma.analyticsEvent.create({
            data: {
                type: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
                userId: user.id,
                mode: MODES[Math.floor(Math.random() * MODES.length)],
                metadata: { intent: INTENTS[Math.floor(Math.random() * INTENTS.length)] },
                sessionId: `session-${Math.floor(Math.random() * 300)}`,
                timestamp,
            },
        });
    }
    console.log(`  ✓ Created 800 analytics events`);

    console.log("\n✅ Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
