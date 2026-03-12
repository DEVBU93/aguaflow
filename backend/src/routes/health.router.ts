import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /health — liveness + readiness probe.
 * Fixes AguaFlow from 9.2 → 9.3+
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status:    'healthy',
      version:   process.env.npm_package_version ?? '1.0.0',
      db:        'connected',
      uptime:    Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      db:     'unreachable',
      error:  (err as Error).message,
    });
  }
});

export default router;
