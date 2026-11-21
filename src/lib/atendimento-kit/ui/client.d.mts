import type { HealthFinding, HealthLevel } from "../server/health.mjs";
import type { GapGroup } from "../shared/report.mjs";
import type { BotSettings, DeclaredProfile, Model, PlatformSettings, Problem, Scope } from "../shared/settings.mjs";

export class SupportApiError extends Error {
  code: string;
  problems: Problem[] | null;
}

/** Um canal do atendimento: o número de uma rota, com o que a conferência viu e, no WhatsApp Web, o QR. */
export interface WhatsappChannel {
  inbox_id: number;
  route: "oficial" | "nao_oficial";
  phone: string | null;
  connected: boolean;
  status: string | null;
  qrCode: string | null;
  level: HealthLevel | null;
  findings: HealthFinding[];
}

/**
 * Os campos de cima são do canal ligado por último, como antes; channels traz um item por rota de pé, para a
 * conta com o número oficial e o do WhatsApp Web ao mesmo tempo.
 */
export interface WhatsappStatus {
  connected: boolean;
  route: "oficial" | "nao_oficial" | null;
  status: string | null;
  qrCode: string | null;
  /** O que a conferência do número viu; null antes de conectar. */
  level: HealthLevel | null;
  findings: HealthFinding[];
  channels?: WhatsappChannel[];
}

export interface SettingsResponse {
  model: Model;
  scope: Scope;
  settings: BotSettings | PlatformSettings;
  /** Os grupos que esta pessoa pode editar nesta camada. */
  editable: string[];
  tools: Array<{ name: string; description: string }>;
  /** audio false: o robô não tem quem transcreva, e a tela esconde "Ouvir áudios"; null: não se sabe. */
  media?: { audio: boolean | null };
  /** Os perfis de quem escreve que o sistema declara; o cartão "Perfis" mostra um bloco para cada um. Ausente ou vazio: sem o cartão. */
  profiles?: DeclaredProfile[];
}

export interface Suggestion {
  id: string;
  q: string;
  a: string;
  why: string;
  at: string;
  tenant: string | null;
}

export interface TeamGroup {
  chave: string;
  nome: string;
  /** As chaves (Person.key) de quem está no grupo. */
  membros: string[];
  etiquetas: string[];
  arquivado: boolean;
}

export function supportApi(options?: { base?: string; fetchImpl?: typeof fetch }): {
  enter(): Promise<{ url: string }>;
  settings(escopo?: Scope): Promise<SettingsResponse>;
  /** aviso: salvo, mas a mudança nos grupos fica para a próxima conferência (o WhatsApp não respondeu). */
  saveSettings(settings: BotSettings | PlatformSettings, escopo?: Scope): Promise<{ ok: true; aviso?: string }>;
  whatsappStatus(): Promise<WhatsappStatus>;
  connectOfficial(values: Record<string, string>): Promise<{ metaWebhook: { callbackUrl: string | null; verifyToken: string | null } }>;
  connectUnofficial(): Promise<{ ok: true }>;
  reconnect(): Promise<{ ok: true; status: string }>;
  retireRoute(route: "oficial" | "nao_oficial"): Promise<{ ok: true }>;
  suggestions(escopo?: Scope): Promise<{ suggestions: Suggestion[] }>;
  decideSuggestion(id: string, decisao: "aprovar" | "descartar", values?: { q?: string; a?: string }): Promise<{ ok: true }>;
  teamGroups(): Promise<{ grupos: TeamGroup[]; pessoas: Array<{ chave: string; nome: string }> }>;
  /** fora: quem foi escolhido e não pôde entrar (fora da equipe do painel). */
  saveTeamGroup(grupo: { chave?: string; nome: string; membros: string[]; etiquetas: string[] }): Promise<{ ok: true; chave: string; fora: string[] }>;
  archiveTeamGroup(chave: string): Promise<{ ok: true }>;
  gaps(escopo?: Scope, dias?: number): Promise<{ groups: GapGroup[]; categories: Record<string, string> }>;
};
