import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { register } from 'node:module';

// Resolve @reality-architect/reality-md to packages/reality-md before loading the cli source.
register('../scripts/resolve-workspace.mjs', import.meta.url);
const { validateReality, assessClaimConfidence, diffusion } = await import('../src/index.mjs');

const fixturePath = fileURLToPath(new URL('../../reality-md/fixtures/valid.reality.md', import.meta.url));
const validContent = readFileSync(fixturePath, 'utf8');

describe('@reality-architect/cli', () => {
  it('validates a reality markdown sample', () => {
    const result = validateReality(validContent);
    assert.equal(result.version, '0.1');
    assert.ok(result.level >= 2);
    assert.ok(result.conforms);
    assert.equal(result.errors.length, 0);
  });

  // @reality-architect/diffusion has no source in this repository; the cli loads it only when it is installed.
  // Without it, assessClaimConfidence returns its documented neutral fallback — assert that contract here.
  it('returns the neutral, unflagged fallback when diffusion is not installed', { skip: diffusion ? 'diffusion is installed' : false }, () => {
    const assessment = assessClaimConfidence('This system has 100% guaranteed zero bugs forever without any testing');
    assert.equal(assessment.score, 0.5);
    assert.equal(assessment.isFlagged, false);
    assert.deepEqual(assessment.certaintyViolations, []);
  });

  it('assesses claim confidence and flags certainty violations', { skip: diffusion ? false : '@reality-architect/diffusion is not installed (no source in this repo)' }, () => {
    const claim = 'This system has 100% guaranteed zero bugs forever without any testing';
    const assessment = assessClaimConfidence(claim);
    assert.ok(typeof assessment.score === 'number');
    assert.equal(assessment.isFlagged, true);
    assert.ok(assessment.certaintyViolations.length > 0);
    assert.ok(assessment.cappedConfidence <= 0.4);
  });
});
