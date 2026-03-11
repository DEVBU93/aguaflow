import { Request, Response, NextFunction } from 'express';
import { aguaFlowService, AguaFlowConfig } from '../services/aguaflow.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const analysisController = {
  async createCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await prisma.company.create({ data: req.body });
      res.status(201).json({ success: true, data: company });
    } catch (e) { next(e); }
  },

  async startAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { companyId, config } = req.body as { companyId: string; config: AguaFlowConfig };
      if (!companyId || !config) {
        res.status(400).json({ success: false, message: 'companyId y config son requeridos' });
        return;
      }
      const analysisId = await aguaFlowService.runAnalysis(companyId, config);
      res.status(202).json({
        success: true,
        data: { analysisId, message: 'Análisis iniciado. Consulta el estado en /api/analysis/:id' }
      });
    } catch (e) { next(e); }
  },

  async getAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const analysis = await aguaFlowService.getAnalysis(req.params.id);
      if (!analysis) { res.status(404).json({ success: false, message: 'Análisis no encontrado' }); return; }
      
      if (analysis.status === 'COMPLETE') {
        const scores = aguaFlowService.calculateScores(analysis.rawData as Record<string, any>);
        res.json({ success: true, data: { ...analysis, aguaFlowScores: scores } });
      } else {
        res.json({ success: true, data: analysis });
      }
    } catch (e) { next(e); }
  },

  async listAnalyses(req: Request, res: Response, next: NextFunction) {
    try {
      const analyses = await aguaFlowService.listAnalyses(req.query.companyId as string);
      res.json({ success: true, data: analyses });
    } catch (e) { next(e); }
  },

  async quickAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { config } = req.body as { config: AguaFlowConfig };
      // Create a temp company for quick analysis
      const company = await prisma.company.create({
        data: { name: `Quick Analysis ${new Date().toISOString()}` }
      });
      const analysisId = await aguaFlowService.runAnalysis(company.id, config);
      res.status(202).json({
        success: true,
        data: { analysisId, companyId: company.id }
      });
    } catch (e) { next(e); }
  }
};
