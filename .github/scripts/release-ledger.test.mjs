import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  excludedOpenPullRequests,
  expectedPullRequests,
  loadLedger,
  validateLedger,
  validateRepositoryRange,
} from "./validate-release-ledger.mjs";

test("canonical ledger satisfies the Reality Architect release contract", async () => {
  const ledger = await loadLedger();
  assert.deepEqual(validateLedger(ledger), []);
  assert.deepEqual(validateRepositoryRange(ledger), []);
});

test("every merged pull-request receipt appears exactly once", async () => {
  const ledger = await loadLedger();
  const actual = ledger.releases[0].sourcePullRequests
    .map(({ number, mergeCommit }) => `${number}:${mergeCommit}`)
    .sort();
  const expected = expectedPullRequests
    .map(({ number, mergeCommit }) => `${number}:${mergeCommit}`)
    .sort();
  assert.deepEqual(actual, expected);
});

test("the dated audit excludes every open draft observed at backfill time", async () => {
  const ledger = await loadLedger();
  assert.deepEqual(ledger.audit.excludedOpenPullRequests, excludedOpenPullRequests);
});

test("public method, privacy, Vault, and production authority stay bounded", async () => {
  const ledger = await loadLedger();
  assert.equal(ledger.repository.role, "open-method-public-site");
  assert.equal(ledger.repository.privateVaultRepository, "realityarchitect-vault");
  assert.equal(ledger.releasePolicy.githubReleaseMode, "draft-only");
  assert.equal(ledger.releasePolicy.cadence, "meaningful-change-only");
  assert.equal(ledger.releasePolicy.assessmentData, "local-only-not-transmitted-or-persisted");
  assert.equal(ledger.releasePolicy.commercialClaims, "evidence-required");
  assert.equal(ledger.releasePolicy.productionPromotion, "human-gated");
});

test("tag workflow cannot publish or release an unreviewed ledger entry", async () => {
  const workflow = await readFile(new URL("../workflows/draft-release.yml", import.meta.url), "utf8");
  assert.match(workflow, /tags:\s*\n\s*- "v\*\.\*\.\*"/);
  assert.match(workflow, /git cat-file -t/);
  assert.match(workflow, /git merge-base --is-ancestor/);
  assert.match(workflow, /release\.status !== "ready"/);
  assert.match(workflow, /"merge-base", "--is-ancestor"/);
  assert.match(workflow, /gh release create/);
  assert.match(workflow, /--draft/);
  assert.doesNotMatch(workflow, /--draft=false|gh release edit|--latest/);
});

test("validator rejects missing, duplicated, or unauthorized history", async () => {
  const canonical = await loadLedger();

  const missing = structuredClone(canonical);
  missing.releases[0].sourcePullRequests = [];
  assert.ok(validateLedger(missing).length > 0);

  const duplicated = structuredClone(canonical);
  duplicated.releases[0].sourcePullRequests.push(structuredClone(expectedPullRequests[0]));
  assert.ok(validateLedger(duplicated).length > 0);

  const wrongCount = structuredClone(canonical);
  wrongCount.releases[0].sourceCommitRange.commitCount = 17;
  assert.ok(validateLedger(wrongCount).length > 0);

  const unauthorized = structuredClone(canonical);
  unauthorized.releasePolicy.assessmentData = "uploaded";
  unauthorized.releasePolicy.productionPromotion = "automatic";
  assert.ok(validateLedger(unauthorized).length > 0);
});
