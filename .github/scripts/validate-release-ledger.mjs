import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ledgerUrl = new URL("../../docs/releases/release-ledger.json", import.meta.url);

export const expectedPullRequests = [
  { number: 3, mergeCommit: "89f7b552689705286ccc33b99d5359d557c5495d" },
  { number: 6, mergeCommit: "c226fb3e0e698b2be395f3903681fa82f8cc0cbb" },
  { number: 7, mergeCommit: "0cfe6bff37ff55d5a98a60245913a8826cf0dfff" },
  { number: 14, mergeCommit: "c0dfed9398e4a0c37380081edd70eaa3f4ddb102" },
  { number: 15, mergeCommit: "49e86d9526f01e173ff2956116484cfeb8eb0b31" },
  { number: 16, mergeCommit: "395cf4ada0138294bf177ae49dc97c87fa16d5a0" },
];

export const excludedOpenPullRequests = [1, 4, 11, 12];

export async function loadLedger() {
  return JSON.parse(await readFile(ledgerUrl, "utf8"));
}

export function validateLedger(ledger) {
  const errors = [];
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
  const commitPattern = /^[0-9a-f]{40}$/;

  if (ledger.schemaVersion !== "1.0") errors.push("schemaVersion must be 1.0");
  if (!datePattern.test(ledger.updatedAt ?? "")) errors.push("updatedAt must be YYYY-MM-DD");
  if (ledger.repository?.owner !== "frankxai" || ledger.repository?.name !== "realityarchitect") {
    errors.push("repository must be frankxai/realityarchitect");
  }
  if (ledger.repository?.visibility !== "public") errors.push("repository visibility must remain public");
  if (ledger.repository?.role !== "open-method-public-site") {
    errors.push("repository role must remain open-method-public-site");
  }
  if (ledger.repository?.publicDomain !== "www.realityarchitect.ai") {
    errors.push("publicDomain must be www.realityarchitect.ai");
  }
  if (ledger.repository?.privateVaultRepository !== "realityarchitect-vault") {
    errors.push("private Vault boundary must remain realityarchitect-vault");
  }
  if (ledger.releasePolicy?.githubReleaseMode !== "draft-only") {
    errors.push("GitHub releases must remain draft-only");
  }
  if (ledger.releasePolicy?.cadence !== "meaningful-change-only") {
    errors.push("release cadence must remain meaningful-change-only");
  }
  if (ledger.releasePolicy?.portfolioDiscovery !== "central-only") {
    errors.push("portfolio discovery must remain central-only");
  }
  if (ledger.releasePolicy?.assessmentData !== "local-only-not-transmitted-or-persisted") {
    errors.push("assessment data boundary must remain local-only");
  }
  if (ledger.releasePolicy?.commercialClaims !== "evidence-required") {
    errors.push("commercial claims must remain evidence-required");
  }
  if (ledger.releasePolicy?.productionPromotion !== "human-gated") {
    errors.push("production promotion must remain human-gated");
  }
  if (!Array.isArray(ledger.audit?.excludedOpenPullRequests)) {
    errors.push("audit.excludedOpenPullRequests must be an array");
  } else {
    const actual = [...ledger.audit.excludedOpenPullRequests].sort((a, b) => a - b);
    if (JSON.stringify(actual) !== JSON.stringify(excludedOpenPullRequests)) {
      errors.push("audit must exclude the exact four open draft pull requests observed on 2026-08-10");
    }
  }
  if (!Array.isArray(ledger.releases) || ledger.releases.length !== 1) {
    errors.push("ledger must contain exactly one initial release candidate");
    return errors;
  }

  const release = ledger.releases[0];
  if (!semverPattern.test(release.version ?? "")) errors.push("release.version must be semantic");
  if (release.version !== "0.1.0") errors.push("initial release candidate must be 0.1.0");
  if (!new Set(["draft-candidate", "ready", "released"]).has(release.status)) errors.push("release.status is invalid");
  if (release.status === "released") errors.push("0.1.0 cannot be marked released before a reviewed GitHub release exists");
  if (!datePattern.test(release.mergedThrough ?? "")) errors.push("release.mergedThrough is invalid");
  if (!datePattern.test(release.recordedAt ?? "")) errors.push("release.recordedAt is invalid");
  if (typeof release.title !== "string" || release.title.length < 12) errors.push("release.title is too short");
  if (typeof release.summary !== "string" || release.summary.length < 60) errors.push("release.summary is too short");
  if (!Array.isArray(release.highlights) || release.highlights.length < 4) errors.push("release needs at least four highlights");
  if (!Array.isArray(release.limitations) || release.limitations.length < 3) errors.push("release needs at least three limitations");

  const range = release.sourceCommitRange;
  if (!range || !commitPattern.test(range.rootInclusive ?? "") || !commitPattern.test(range.headInclusive ?? "")) {
    errors.push("release must define full-SHA root and head commits");
  }
  if (range?.commitCount !== 18) errors.push("0.1.0 source history must contain exactly 18 commits");

  if (!Array.isArray(release.sourcePullRequests)) errors.push("release.sourcePullRequests must be an array");
  else {
    const key = (receipt) => `${receipt.number}:${receipt.mergeCommit}`;
    const actualKeys = release.sourcePullRequests.map(key);
    if (new Set(actualKeys).size !== actualKeys.length) errors.push("pull-request receipts must be unique");
    const expectedKeys = expectedPullRequests.map(key).sort();
    if (JSON.stringify([...new Set(actualKeys)].sort()) !== JSON.stringify(expectedKeys)) {
      errors.push(`expected exact PR coverage of ${expectedPullRequests.length}; received ${new Set(actualKeys).size}`);
    }
  }

  return errors;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function isAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function validateRepositoryRange(ledger) {
  const errors = [];
  const release = ledger.releases?.[0];
  if (!release?.sourceCommitRange) return ["0.1.0 source range is missing"];
  const { rootInclusive, headInclusive, commitCount } = release.sourceCommitRange;

  try {
    git(["cat-file", "-e", `${rootInclusive}^{commit}`]);
    git(["cat-file", "-e", `${headInclusive}^{commit}`]);
  } catch {
    return ["0.1.0 source range commits are not present in repository history"];
  }
  const roots = git(["rev-list", "--max-parents=0", headInclusive]).split(/\s+/).sort();
  if (roots.length !== 1 || roots[0] !== rootInclusive) errors.push("0.1.0 root must be the sole root commit reachable from its head");
  const actualCount = Number(git(["rev-list", "--count", headInclusive]));
  if (actualCount !== commitCount) errors.push(`0.1.0 commit count is ${actualCount}, expected ${commitCount}`);

  for (const receipt of release.sourcePullRequests) {
    if (!isAncestor(rootInclusive, receipt.mergeCommit) || !isAncestor(receipt.mergeCommit, headInclusive)) {
      errors.push(`PR #${receipt.number} merge commit is outside the 0.1.0 source range`);
    }
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ledger = await loadLedger();
  const errors = [...validateLedger(ledger), ...validateRepositoryRange(ledger)];
  if (errors.length) {
    console.error(`Release ledger validation failed:\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  const release = ledger.releases[0];
  console.log(
    `Release ledger valid: ${release.sourceCommitRange.commitCount} commits and ${release.sourcePullRequests.length} merged PR receipts in the 0.1.0 candidate.`,
  );
}
