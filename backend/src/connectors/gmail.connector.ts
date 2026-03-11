import { google } from 'googleapis';

export interface GmailMetrics {
  totalEmails: number;
  unreadCount: number;
  avgResponseTime: number; // hours
  emailVolume7d: number;
  threadCount: number;
  communicationScore: number;
}

export class GmailConnector {
  private gmail;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async analyzeMailbox(): Promise<GmailMetrics> {
    try {
      const [inboxRes, unreadRes] = await Promise.all([
        this.gmail.users.messages.list({ userId: 'me', labelIds: ['INBOX'], maxResults: 1 }),
        this.gmail.users.messages.list({ userId: 'me', labelIds: ['UNREAD', 'INBOX'], maxResults: 500 })
      ]);

      // Messages in last 7 days
      const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
      const recentRes = await this.gmail.users.messages.list({
        userId: 'me',
        q: `after:${sevenDaysAgo}`,
        maxResults: 500
      });

      const totalEstimate = parseInt(inboxRes.data.resultSizeEstimate?.toString() || '0');
      const unreadCount = unreadRes.data.messages?.length || 0;
      const recent7d = recentRes.data.messages?.length || 0;

      const commScore = Math.min(100, 100 - Math.min(50, (unreadCount / Math.max(recent7d, 1)) * 100));

      return {
        totalEmails: totalEstimate,
        unreadCount,
        avgResponseTime: 0,
        emailVolume7d: recent7d,
        threadCount: 0,
        communicationScore: Math.round(commScore)
      };
    } catch (error: any) {
      throw new Error(`Gmail analysis failed: ${error.message}`);
    }
  }
}
