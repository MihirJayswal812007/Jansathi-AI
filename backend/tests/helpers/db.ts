// ===== JanSathi AI — Test DB Helpers =====
// Cleanup utilities for test isolation.

import prisma from "../../src/models/prisma";

/**
 * Clean up all test data from test tables.
 * Call in afterAll() to avoid polluting the dev DB.
 * Uses try/catch on each step to tolerate missing tables.
 */
export async function cleanupTestData() {
    // Delete in order respecting FK constraints
    // Wrap each in try/catch since some tables may not exist in test DB
    const tables = [
        () => prisma.message.deleteMany({}),
        () => prisma.conversation.deleteMany({}),
        () => prisma.analyticsEvent.deleteMany({}),
        () => prisma.otpVerification.deleteMany({}),
        () => prisma.session.deleteMany({}),
        () => prisma.user.deleteMany({}),
    ];

    for (const deleteOp of tables) {
        try {
            await deleteOp();
        } catch {
            // Table may not exist — safe to skip
        }
    }
}

/**
 * Disconnect Prisma client.
 * Call in afterAll() to prevent open handles.
 */
export async function disconnectDb() {
    await prisma.$disconnect();
}
