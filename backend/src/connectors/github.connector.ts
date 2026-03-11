import { Octokit } from '@octokit/rest';

export interface GitHubMetrics {
  totalRepos: number;
  totalCommits: number;
  openIssues: number;
  closedIssues: number;
  pullRequests: { open: number; closed: number; merged: number };
  contributors: number;
  languages: Record<string, number>;
  avgCommitsPerDay: number;
  lastActivityDate: string;
}

export class GitHubConnector {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async analyzeOrganization(org: string): Promise<GitHubMetrics> {
    try {
      const { data: repos } = await this.octokit.repos.listForOrg({ org, per_page: 100 });
      
      let totalCommits = 0;
      let openIssues = 0;
      let closedIssues = 0;
      let openPRs = 0;
      let mergedPRs = 0;
      let contributors = new Set<string>();
      const languages: Record<string, number> = {};
      let lastActivity = new Date(0);

      for (const repo of repos.slice(0, 10)) {
        // Issues
        const { data: issues } = await this.octokit.issues.listForRepo({
          owner: org, repo: repo.name, state: 'open', per_page: 100
        });
        openIssues += issues.filter(i => !i.pull_request).length;

        // Languages
        const { data: langs } = await this.octokit.repos.listLanguages({ owner: org, repo: repo.name });
        Object.entries(langs).forEach(([lang, bytes]) => {
          languages[lang] = (languages[lang] || 0) + (bytes as number);
        });

        // Contributors
        try {
          const { data: contribs } = await this.octokit.repos.listContributors({ owner: org, repo: repo.name });
          contribs.forEach(c => { if (c.login) contributors.add(c.login); });
          totalCommits += contribs.reduce((sum, c) => sum + (c.contributions || 0), 0);
        } catch { /* private repos */ }

        if (repo.updated_at && new Date(repo.updated_at) > lastActivity) {
          lastActivity = new Date(repo.updated_at);
        }
      }

      const daysSinceCreation = Math.max(1, Math.floor((Date.now() - new Date(repos[0]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));

      return {
        totalRepos: repos.length,
        totalCommits,
        openIssues,
        closedIssues,
        pullRequests: { open: openPRs, closed: 0, merged: mergedPRs },
        contributors: contributors.size,
        languages,
        avgCommitsPerDay: totalCommits / daysSinceCreation,
        lastActivityDate: lastActivity.toISOString()
      };
    } catch (error: any) {
      throw new Error(`GitHub analysis failed: ${error.message}`);
    }
  }

  async analyzeUser(username: string): Promise<GitHubMetrics> {
    const { data: repos } = await this.octokit.repos.listForUser({ username, per_page: 100 });
    
    let totalCommits = 0;
    const languages: Record<string, number> = {};

    for (const repo of repos.slice(0, 15)) {
      try {
        const { data: contribs } = await this.octokit.repos.listContributors({ owner: username, repo: repo.name });
        const userContrib = contribs.find(c => c.login === username);
        totalCommits += userContrib?.contributions || 0;
      } catch { /* ignore */ }

      const { data: langs } = await this.octokit.repos.listLanguages({ owner: username, repo: repo.name });
      Object.entries(langs).forEach(([lang, bytes]) => {
        languages[lang] = (languages[lang] || 0) + (bytes as number);
      });
    }

    return {
      totalRepos: repos.length,
      totalCommits,
      openIssues: repos.reduce((sum, r) => sum + (r.open_issues_count || 0), 0),
      closedIssues: 0,
      pullRequests: { open: 0, closed: 0, merged: 0 },
      contributors: 1,
      languages,
      avgCommitsPerDay: totalCommits / 365,
      lastActivityDate: repos[0]?.updated_at || new Date().toISOString()
    };
  }
}
