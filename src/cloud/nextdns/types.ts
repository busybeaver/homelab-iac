export interface Profile {
  name: string;
  security: Security;
  privacy: Privacy;
  parentalControl: ParentalControl;
  denylist: DenylistItem[];
  allowlist: AllowlistItem[];
  settings: Settings;
}

interface IdItem {
  id: string;
}

interface IdSwitchItem extends IdItem {
  active: boolean;
}

export type DenylistItem = IdSwitchItem;
export type AllowlistItem = IdSwitchItem;

export interface ParentalControl {
  services: Service[];
  categories: Category[];
  safeSearch: boolean;
  youtubeRestrictedMode: boolean;
  blockBypass: boolean;
}

export interface Service extends IdSwitchItem {
  // TODO: id: string;
}

export interface Category extends IdSwitchItem {
  // TODO: id: string;
}

export interface Privacy {
  blocklists: Blocklist[];
  natives: NativeBlocklist[];
  disguisedTrackers: boolean;
  allowAffiliate: boolean;
}

export interface Blocklist extends IdItem {
  // TODO: id: string;
}

export interface NativeBlocklist extends IdItem {
  // TODO: id: string;
}

export interface Security {
  threatIntelligenceFeeds: boolean;
  aiThreatDetection: boolean;
  googleSafeBrowsing: boolean;
  cryptojacking: boolean;
  dnsRebinding: boolean;
  idnHomographs: boolean;
  typosquatting: boolean;
  dga: boolean;
  nrd: boolean;
  ddns: boolean;
  parking: boolean;
  csam: boolean;
  tlds: Tld[];
}

export interface Tld {
  id: string;
}

export interface Settings {
  logs: Logs;
  blockPage: BlockPage;
  performance: Performance;
  web3: boolean;
}

export interface BlockPage {
  enabled: boolean;
}

export interface Logs {
  enabled: boolean;
  drop: Drop;
  retention: number;
  location: string;
}

export interface Drop {
  ip: boolean;
  domain: boolean;
}

export interface Performance {
  ecs: boolean;
  cacheBoost: boolean;
  cnameFlattening: boolean;
}
