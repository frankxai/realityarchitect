export interface ValidationResult {
  path: string | null;
  version: string;
  level: number;
  errors: string[];
  warnings: string[];
  entitiesCount: number;
  invariantsCount: number;
  conforms: boolean;
}

export interface ClaimAssessment {
  claim: string;
  score: number;
  band: string;
  bandLabel?: string;
  certaintyViolations: string[];
  isFlagged: boolean;
  cappedConfidence: number;
}

export function validateReality(inputPathOrContent: string): ValidationResult;
export function assessClaimConfidence(claimText: string, evidenceItems?: any[]): ClaimAssessment;
export const diffusion: any;
export const readRealityMd: (content: string) => any;
export const emit: (parsed: any, target: string) => string;
export const emitAll: (parsed: any) => Record<string, string>;
export const nextArtifactBrief: (parsed: any) => any;
export const briefToMarkdown: (brief: any) => string;
