import { PrismaClient } from '@prisma/client';
import { GitHubConnector } from '../connectors/github.connector';
import { NotionConnector } from '../connectors/notion.connector';
import { LinearConnector } from '../connectors/linear.connector';
import { SlackConnector } from '../connectors/slack.connector';
import { JiraConnector } from '../connectors/jira.connector';
import { AsanaConnector } from '../connectors/asana.connector';

const prisma = new PrismaClient();

export interface AguaFlowConfig {
  github?: { token: string; org?: string; username?: string };
  notion?: { token: string };
  linear?: { apiKey: string };
  slack?: { token: string };
  jira?: { host: string; email: string; apiToken: string };
  asana?: { token: string; workspaceGid: string };
}

export interface AguaFlowResult {
  // A - Agilidad: execution speed, deployment frequency
  agilidad: {
    score: number;
    deployFrequency: number;
    avgCycleTime: number;
    issueResolutionTime: number;
    details: string[];
  };
  // G - Crecimiento: growth indicators
  crecimiento: {
    score: number;
    repoGrowth: number;
    teamGrowth: number;
    taskCompletionTrend: number;
    details: string[];
  };
  // U - Unidad: team alignment, communication
  unidad: {
    score: number;
    communicationScore: number;
    teamEngagement: number;
    documentationQuality: number;
    details: string[];
  };
  // A - Adaptabilidad: flexibility, tech diversity
  adaptabilidad: {
    score: number;
    techDiversity: number;
    crossFunctional: number;
    responseToChange: number;
    details: string[];
  };
  // F - Flujo: workflow efficiency
  flujo: {
    score: number;
    workflowEfficiency: number;
    bottlenecks: number;
    automationLevel: number;
    details: string[];
  };
  // L - Legacy (removed) → Overall
  overall: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
  rawMetrics: Record<string, any>;
}

const scoreToGrade = (score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

export const aguaFlowService = {
  async runAnalysis(companyId: string, config: AguaFlowConfig): Promise<string> {
    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: { companyId, status: 'ANALYZING' }
    });

    // Run async
    aguaFlowService.processAnalysis(analysis.id, config).catch(async (err) => {
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: 'ERROR', rawData: { error: err.message } }
      });
    });

    return analysis.id;
  },

  async processAnalysis(analysisId: string, config: AguaFlowConfig): Promise<void> {
    const rawMetrics: Record<string, any> = {};
    const connectorResults: Array<{ connector: string; data: any; status: string }> = [];

    // Fetch all connector data in parallel
    const fetchPromises = [];

    if (config.github) {
      fetchPromises.push(
        (async () => {
          try {
            const gh = new GitHubConnector(config.github!.token);
            const data = config.github!.org
              ? await gh.analyzeOrganization(config.github!.org)
              : await gh.analyzeUser(config.github!.username || '');
            rawMetrics.github = data;
            connectorResults.push({ connector: 'github', data, status: 'OK' });
          } catch (e: any) {
            connectorResults.push({ connector: 'github', data: { error: e.message }, status: 'ERROR' });
          }
        })()
      );
    }

    if (config.notion) {
      fetchPromises.push(
        (async () => {
          try {
            const notion = new NotionConnector(config.notion!.token);
            const data = await notion.analyzeWorkspace();
            rawMetrics.notion = data;
            connectorResults.push({ connector: 'notion', data, status: 'OK' });
          } catch (e: any) {
            connectorResults.push({ connector: 'notion', data: { error: e.message }, status: 'ERROR' });
          }
        })()
      );
    }

    if (config.linear) {
      fetchPromises.push(
        (async () => {
          try {
            const linear = new LinearConnector(config.linear!.apiKey);
            const data = await linear.analyzeWorkspace();
            rawMetrics.linear = data;
            connectorResults.push({ connector: 'linear', data, status: 'OK' });
          } catch (e: any) {
            connectorResults.push({ connector: 'linear', data: { error: e.message }, status: 'ERROR' });
          }
        })()
      );
    }

    if (config.slack) {
      fetchPromises.push(
        (async () => {
          try {
            const slack = new SlackConnector(config.slack!.token);
            const data = await slack.analyzeWorkspace();
            rawMetrics.slack = data;
            connectorResults.push({ connector: 'slack', data, status: 'OK' });
          } catch (e: any) {
            connectorResults.push({ connector: 'slack', data: { error: e.message }, status: 'ERROR' });
          }
        })()
      );
    }

    if (config.asana) {
      fetchPromises.push(
        (async () => {
          try {
            const asana = new AsanaConnector(config.asana!.token);
            const data = await asana.analyzeWorkspace(config.asana!.workspaceGid);
            rawMetrics.asana = data;
            connectorResults.push({ connector: 'asana', data, status: 'OK' });
          } catch (e: any) {
            connectorResults.push({ connector: 'asana', data: { error: e.message }, status: 'ERROR' });
          }
        })()
      );
    }

    await Promise.all(fetchPromises);

    // Save connector data
    await prisma.connectorData.createMany({
      data: connectorResults.map(r => ({ analysisId, connector: r.connector, data: r.data, status: r.status }))
    });

    // Calculate AGUA FLOW scores
    const result = aguaFlowService.calculateScores(rawMetrics);

    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        agilityScore: result.agilidad.score,
        growthScore: result.crecimiento.score,
        unityScore: result.unidad.score,
        adaptScore: result.adaptabilidad.score,
        flowScore: result.flujo.score,
        overallScore: result.overall,
        rawData: rawMetrics as any,
        recommendations: result.recommendations as any,
        status: 'COMPLETE',
        completedAt: new Date()
      }
    });
  },

  calculateScores(metrics: Record<string, any>): AguaFlowResult {
    const gh = metrics.github || {};
    const linear = metrics.linear || {};
    const notion = metrics.notion || {};
    const slack = metrics.slack || {};
    const asana = metrics.asana || {};

    // A - AGILIDAD (execution speed)
    const cycleTimeScore = linear.cycleTime ? Math.max(0, 100 - linear.cycleTime * 5) : 50;
    const velocityScore = Math.min(100, (linear.velocity || 0) * 10);
    const commitScore = Math.min(100, (gh.avgCommitsPerDay || 0) * 20);
    const agilidadScore = Math.round((cycleTimeScore + velocityScore + commitScore) / 3);

    // G - CRECIMIENTO
    const repoScore = Math.min(100, (gh.totalRepos || 0) * 5);
    const taskGrowthScore = asana.completionRate || linear.completionRate || 50;
    const crecimientoScore = Math.round((repoScore + taskGrowthScore) / 2);

    // U - UNIDAD
    const commScore = slack.teamEngagement || 50;
    const docScore = notion.documentationScore || 50;
    const unidadScore = Math.round((commScore + docScore) / 2);

    // A - ADAPTABILIDAD
    const techCount = Object.keys(gh.languages || {}).length;
    const techScore = Math.min(100, techCount * 15);
    const adaptabilidadScore = Math.round((techScore + (linear.completionRate || 50)) / 2);

    // F - FLUJO
    const overdueRatio = asana.totalTasks > 0
      ? (1 - asana.overdueTasks / asana.totalTasks) * 100 : 70;
    const contribScore = Math.min(100, (gh.contributors || 0) * 10);
    const flujoScore = Math.round((overdueRatio + contribScore) / 2);

    const overall = Math.round((agilidadScore + crecimientoScore + unidadScore + adaptabilidadScore + flujoScore) / 5);

    const recommendations: string[] = [];
    if (agilidadScore < 60) recommendations.push('Reducir el tiempo de ciclo implementando sprints más cortos y CI/CD automatizado');
    if (crecimientoScore < 60) recommendations.push('Aumentar la tasa de completado de tareas — priorizar backlog y reducir WIP');
    if (unidadScore < 60) recommendations.push('Mejorar documentación en Notion y aumentar comunicación en Slack');
    if (adaptabilidadScore < 60) recommendations.push('Diversificar el stack tecnológico y mejorar cross-functional collaboration');
    if (flujoScore < 60) recommendations.push('Reducir tareas vencidas y aumentar contribuidores activos');
    if (overall >= 80) recommendations.push('¡Excelente desempeño! Considerar escalar a más equipos');

    return {
      agilidad: {
        score: agilidadScore,
        deployFrequency: gh.avgCommitsPerDay || 0,
        avgCycleTime: linear.cycleTime || 0,
        issueResolutionTime: linear.cycleTime || 0,
        details: [`${gh.totalCommits || 0} commits totales`, `${linear.velocity || 0} issues/semana`, `Ciclo promedio: ${linear.cycleTime || 0} días`]
      },
      crecimiento: {
        score: crecimientoScore,
        repoGrowth: gh.totalRepos || 0,
        teamGrowth: gh.contributors || 0,
        taskCompletionTrend: asana.completionRate || 0,
        details: [`${gh.totalRepos || 0} repositorios`, `${asana.completionRate || 0}% tasa de completado`]
      },
      unidad: {
        score: unidadScore,
        communicationScore: slack.teamEngagement || 0,
        teamEngagement: slack.teamEngagement || 0,
        documentationQuality: notion.documentationScore || 0,
        details: [`${notion.totalPages || 0} páginas Notion`, `${slack.activeChannels || 0} canales activos`]
      },
      adaptabilidad: {
        score: adaptabilidadScore,
        techDiversity: techCount,
        crossFunctional: gh.contributors || 0,
        responseToChange: linear.completionRate || 0,
        details: [`${techCount} lenguajes de programación`, `${gh.contributors || 0} contribuidores`]
      },
      flujo: {
        score: flujoScore,
        workflowEfficiency: asana.completionRate || 0,
        bottlenecks: asana.overdueTasks || 0,
        automationLevel: 0,
        details: [`${asana.overdueTasks || 0} tareas vencidas`, `${asana.completionRate || 0}% eficiencia`]
      },
      overall,
      grade: scoreToGrade(overall),
      recommendations,
      rawMetrics: metrics
    };
  },

  async getAnalysis(analysisId: string) {
    return prisma.analysis.findUnique({
      where: { id: analysisId },
      include: { connectorData: true, company: true }
    });
  },

  async listAnalyses(companyId?: string) {
    return prisma.analysis.findMany({
      where: companyId ? { companyId } : undefined,
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });
  }
};
