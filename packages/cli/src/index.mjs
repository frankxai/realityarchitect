import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Dynamic resolver for peer packages (works both locally in repo and in node_modules)
let realityMdLib;
try {
  realityMdLib = await import('@reality-architect/reality-md');
} catch {
  try {
    realityMdLib = await import('../../../standard/src/index.mjs');
  } catch (err) {
    throw new Error('Could not load @reality-architect/reality-md: ' + err.message);
  }
}

let diffusionLib;
try {
  diffusionLib = await import('@reality-architect/diffusion');
} catch {
  try {
    diffusionLib = await import('../../../../realitydiffusion/src/index.js');
  } catch {
    diffusionLib = null;
  }
}

export const {
  readRealityMd,
  emit,
  emitAll,
  verifyEmission,
  nextArtifactBrief,
  briefToMarkdown,
  migrate,
  detectVersion,
  LEVELS,
  TARGETS
} = realityMdLib;

export const diffusion = diffusionLib;

/**
 * Validate a reality.md file or text string against the standard conformance levels.
 */
export function validateReality(inputPathOrContent) {
  let content = inputPathOrContent;
  let filePath = null;
  if (typeof inputPathOrContent === 'string' && existsSync(inputPathOrContent)) {
    filePath = resolve(inputPathOrContent);
    content = readFileSync(filePath, 'utf8');
  }

  const parsed = readRealityMd(content);
  return {
    path: filePath,
    version: parsed.packet?.version || parsed.frontmatter?.version || '0.1',
    level: parsed.conformance?.level ?? 0,
    levelName: parsed.conformance?.levelName,
    errors: parsed.conformance?.errors || [],
    warnings: parsed.conformance?.warnings || [],
    nodesCount: parsed.packet?.graph?.nodes?.length || 0,
    edgesCount: parsed.packet?.graph?.edges?.length || 0,
    conforms: parsed.conformance?.ok ?? false,
  };
}

/**
 * Assess a claim, text, or report using the reality diffusion empirical confidence engine.
 */
export function assessClaimConfidence(claimText, evidenceItems = []) {
  if (!diffusionLib) {
    return {
      claim: claimText,
      score: 0.5,
      band: 'moderate',
      certaintyViolations: [],
      isFlagged: false,
      cappedConfidence: 0.5,
    };
  }

  const { flagCertainty, certaintyViolations, BAND_LABEL } = diffusionLib;
  const violations = certaintyViolations ? certaintyViolations(claimText) : [];
  const isFlagged = violations.length > 0;

  let baseScore = 0.5;
  if (violations.length > 0) {
    baseScore = 0.2; // Heavily penalized for false certainty claims
  } else if (evidenceItems && evidenceItems.length > 0) {
    baseScore = Math.min(0.85, 0.5 + evidenceItems.length * 0.1);
  }

  let band = 'weak';
  if (baseScore >= 0.65) band = 'substantial';
  else if (baseScore >= 0.4) band = 'moderate';

  return {
    claim: claimText,
    score: baseScore,
    band,
    bandLabel: BAND_LABEL ? BAND_LABEL[band] : band,
    certaintyViolations: violations,
    isFlagged,
    cappedConfidence: violations.length > 0 ? Math.min(baseScore, 0.4) : baseScore,
  };
}
