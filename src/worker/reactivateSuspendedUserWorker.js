import { parentPort } from 'worker_threads';
import { PrismaClient } from '../../prisma/src/prisma/index.js';
import { reactivateUserEmailNotification } from '../util/email.util.js';

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🛠 Worker started: Reactivating suspended users');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const usersToReactivate = await prisma.userData.findMany({
      where: {
        isSuspended: true,
        suspendedAt: {
          lte: fiveMinutesAgo,
        },
      },
      select: {
        userId: true,
        email: true,
      },
    });

    if (usersToReactivate.length === 0) {
      parentPort.postMessage("No users to reactivate.");
      process.exit(0);
    }

    const userIds = usersToReactivate.map(user => user.userId);

    await prisma.userData.updateMany({
      where: {
        userId: { in: userIds },
      },
      data: {
        isSuspended: false,
        suspendedAt: null,
      },
    });

    for (const user of usersToReactivate) {
      await reactivateUserEmailNotification({ email: user.email });
    }

    parentPort.postMessage(`✅ Reactivated ${usersToReactivate.length} user(s)`);
    process.exit(0);
  } catch (err) {
    parentPort.postMessage(`❌ Worker failed: ${err.message}`);
    process.exit(1);
  }
})();
