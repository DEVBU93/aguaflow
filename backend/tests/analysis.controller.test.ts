/**
 * Tests — Analysis Controller (AguaFlow)
 * Verifica endpoints de análisis AGUA FLOW
 */
import { Request, Response, NextFunction } from 'express';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    analysis: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    }
  }))
}));

jest.mock('../services/aguaflow.service', () => ({
  aguaFlowService: {
    runAnalysis: jest.fn().mockResolvedValue('analysis-id-123'),
    getResults: jest.fn().mockResolvedValue({ overall: 82, grade: 'A' }),
    listAnalyses: jest.fn().mockResolvedValue([]),
  }
}));

import { analysisController } from '../controllers/analysis.controller';

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};
const next: NextFunction = jest.fn();

describe('analysisController.list', () => {
  it('should return empty array when no analyses exist', async () => {
    const res = mockRes();
    await analysisController.list({} as Request, res, next);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

describe('analysisController.create', () => {
  it('should return 400 if companyName is missing', async () => {
    const req = { body: {} } as Request;
    const res = mockRes();
    await analysisController.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should start analysis and return 202', async () => {
    const req = { body: { companyName: 'Test Corp', config: {} } } as Request;
    const res = mockRes();
    await analysisController.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(202);
  });
});
