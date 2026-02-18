// AguaFlow - Conectores Index
// Exporta todos los conectores disponibles

export { GitHubConnector } from './github.connector';
export { NotionConnector } from './notion.connector';
export { LinearConnector } from './linear.connector';
export { SlackConnector } from './slack.connector';
export { JiraConnector } from './jira.connector';
export { GmailConnector } from './gmail.connector';
export { DriveConnector } from './drive.connector';
export { AsanaConnector } from './asana.connector';
export { TrelloConnector } from './trello.connector';
export { FigmaConnector } from './figma.connector';
export { ZapierConnector } from './zapier.connector';

export type ConnectorType =
  | 'github'
  | 'notion'
  | 'linear'
  | 'slack'
  | 'jira'
  | 'gmail'
  | 'drive'
  | 'asana'
  | 'trello'
  | 'figma'
  | 'zapier';

export interface ConnectorConfig {
  type: ConnectorType;
  accessToken: string;
  refreshToken?: string;
  workspaceId?: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
}

export interface ConnectorData {
  connectorType: ConnectorType;
  data: unknown;
  syncedAt: Date;
  status: 'success' | 'error' | 'partial';
  error?: string;
}

// ─── Registry de Conectores ────────────────────────────────────────────────────────────
const CONNECTOR_REGISTRY: Record<ConnectorType, string> = {
  github: 'GitHub - Repos, commits, PRs, issues',
  notion: 'Notion - Docs, databases, pages',
  linear: 'Linear - Issues, sprints, cycles',
  slack: 'Slack - Messages, channels, users',
  jira: 'Jira - Tickets, sprints, velocity',
  gmail: 'Gmail - Threads, labels, emails',
  drive: 'Drive - Files, permissions, activity',
  asana: 'Asana - Tasks, projects, timeline',
  trello: 'Trello - Boards, cards, lists',
  figma: 'Figma - Projects, components, versions',
  zapier: 'Zapier - Workflows, triggers, actions',
};

export const getConnectorInfo = (type: ConnectorType): string => {
  return CONNECTOR_REGISTRY[type] || 'Unknown connector';
};

export const getAllConnectors = (): ConnectorType[] => {
  return Object.keys(CONNECTOR_REGISTRY) as ConnectorType[];
};
