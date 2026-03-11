import axios from 'axios';

export interface AsanaMetrics {
  totalWorkspaces: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgTaskAge: number;
}

export class AsanaConnector {
  private baseUrl = 'https://app.asana.com/api/1.0';
  private headers: Record<string, string>;

  constructor(accessToken: string) {
    this.headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' };
  }

  async analyzeWorkspace(workspaceGid: string): Promise<AsanaMetrics> {
    try {
      const projectsRes = await axios.get(
        `${this.baseUrl}/projects?workspace=${workspaceGid}&limit=100`,
        { headers: this.headers }
      );
      const projects = projectsRes.data.data || [];

      let totalTasks = 0;
      let completedTasks = 0;
      let overdueTasks = 0;
      const taskAges: number[] = [];
      const now = new Date();

      for (const project of projects.slice(0, 5)) {
        const tasksRes = await axios.get(
          `${this.baseUrl}/tasks?project=${project.gid}&opt_fields=completed,due_on,created_at&limit=100`,
          { headers: this.headers }
        );
        const tasks = tasksRes.data.data || [];
        totalTasks += tasks.length;
        completedTasks += tasks.filter((t: any) => t.completed).length;
        overdueTasks += tasks.filter((t: any) => !t.completed && t.due_on && new Date(t.due_on) < now).length;
        tasks.forEach((t: any) => {
          if (t.created_at) {
            taskAges.push((now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24));
          }
        });
      }

      return {
        totalWorkspaces: 1,
        totalProjects: projects.length,
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        avgTaskAge: taskAges.length > 0 ? Math.round(taskAges.reduce((a, b) => a + b, 0) / taskAges.length) : 0
      };
    } catch (error: any) {
      throw new Error(`Asana analysis failed: ${error.message}`);
    }
  }
}
