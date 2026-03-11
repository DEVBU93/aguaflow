import axios from 'axios';

export interface JiraMetrics {
  totalProjects: number;
  totalIssues: number;
  doneIssues: number;
  inProgressIssues: number;
  bugCount: number;
  avgResolutionDays: number;
  sprintVelocity: number;
}

export class JiraConnector {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(host: string, email: string, apiToken: string) {
    this.baseUrl = `https://${host}/rest/api/3`;
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    this.headers = { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' };
  }

  async analyzeWorkspace(): Promise<JiraMetrics> {
    try {
      const projectsRes = await axios.get(`${this.baseUrl}/project`, { headers: this.headers });
      const projects = projectsRes.data;

      const issuesRes = await axios.get(`${this.baseUrl}/search?jql=ORDER BY created DESC&maxResults=200`, {
        headers: this.headers
      });
      const issues = issuesRes.data.issues || [];

      const done = issues.filter((i: any) => i.fields.status.statusCategory.key === 'done');
      const inProgress = issues.filter((i: any) => i.fields.status.statusCategory.key === 'indeterminate');
      const bugs = issues.filter((i: any) => i.fields.issuetype.name === 'Bug');

      const resolutionTimes = done
        .filter((i: any) => i.fields.resolutiondate && i.fields.created)
        .map((i: any) => (new Date(i.fields.resolutiondate).getTime() - new Date(i.fields.created).getTime()) / (1000 * 60 * 60 * 24));

      const avgResolution = resolutionTimes.length > 0
        ? resolutionTimes.reduce((a: number, b: number) => a + b, 0) / resolutionTimes.length
        : 0;

      return {
        totalProjects: projects.length,
        totalIssues: issues.length,
        doneIssues: done.length,
        inProgressIssues: inProgress.length,
        bugCount: bugs.length,
        avgResolutionDays: Math.round(avgResolution * 10) / 10,
        sprintVelocity: done.length / 4 // approx 4 sprints
      };
    } catch (error: any) {
      throw new Error(`Jira analysis failed: ${error.message}`);
    }
  }
}
