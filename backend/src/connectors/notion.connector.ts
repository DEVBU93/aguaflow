import { Client } from '@notionhq/client';

export interface NotionMetrics {
  totalPages: number;
  totalDatabases: number;
  recentUpdates: number;
  teamMembers: number;
  documentationScore: number;
  lastUpdated: string;
}

export class NotionConnector {
  private client: Client;

  constructor(token: string) {
    this.client = new Client({ auth: token });
  }

  async analyzeWorkspace(): Promise<NotionMetrics> {
    try {
      const [pagesRes, dbRes] = await Promise.all([
        this.client.search({ filter: { property: 'object', value: 'page' }, page_size: 100 }),
        this.client.search({ filter: { property: 'object', value: 'database' }, page_size: 100 })
      ]);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const recentPages = pagesRes.results.filter((p: any) =>
        p.last_edited_time && p.last_edited_time > thirtyDaysAgo
      );

      // Documentation score: ratio of recent activity
      const docScore = Math.min(100, (recentPages.length / Math.max(pagesRes.results.length, 1)) * 100 + 
                                     dbRes.results.length * 5);

      const latestPage = pagesRes.results.reduce((latest: any, page: any) => {
        return !latest || (page.last_edited_time > (latest.last_edited_time || '')) ? page : latest;
      }, null);

      return {
        totalPages: pagesRes.results.length,
        totalDatabases: dbRes.results.length,
        recentUpdates: recentPages.length,
        teamMembers: 0, // requires admin token
        documentationScore: Math.round(docScore),
        lastUpdated: (latestPage as any)?.last_edited_time || new Date().toISOString()
      };
    } catch (error: any) {
      throw new Error(`Notion analysis failed: ${error.message}`);
    }
  }
}
