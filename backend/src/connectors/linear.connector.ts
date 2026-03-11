import { LinearClient } from '@linear/sdk';

export interface LinearMetrics {
  totalTeams: number;
  totalIssues: number;
  completedIssues: number;
  inProgressIssues: number;
  cycleTime: number; // avg days to close
  velocity: number;  // issues closed per week
  overdueIssues: number;
  completionRate: number;
}

export class LinearConnector {
  private client: LinearClient;

  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey });
  }

  async analyzeWorkspace(): Promise<LinearMetrics> {
    try {
      const teams = await this.client.teams();
      const issues = await this.client.issues({ first: 250 });
      
      const completed = issues.nodes.filter(i => i.completedAt);
      const inProgress = issues.nodes.filter(i => !i.completedAt && !i.canceledAt);
      const overdue = issues.nodes.filter(i => {
        if (!i.dueDate || i.completedAt) return false;
        return new Date(i.dueDate) < new Date();
      });

      // Avg cycle time (days)
      const cycleTimes = completed
        .filter(i => i.completedAt && i.createdAt)
        .map(i => (new Date(i.completedAt!).getTime() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      
      const avgCycleTime = cycleTimes.length > 0
        ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
        : 0;

      // Weekly velocity (last 4 weeks)
      const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      const recentCompleted = completed.filter(i => i.completedAt && new Date(i.completedAt) > fourWeeksAgo);
      const velocity = recentCompleted.length / 4;

      return {
        totalTeams: teams.nodes.length,
        totalIssues: issues.nodes.length,
        completedIssues: completed.length,
        inProgressIssues: inProgress.length,
        cycleTime: Math.round(avgCycleTime * 10) / 10,
        velocity: Math.round(velocity * 10) / 10,
        overdueIssues: overdue.length,
        completionRate: issues.nodes.length > 0 ? Math.round((completed.length / issues.nodes.length) * 100) : 0
      };
    } catch (error: any) {
      throw new Error(`Linear analysis failed: ${error.message}`);
    }
  }
}
