import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { validateReality, assessClaimConfidence } from '../src/index.mjs';

const fixturePath = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../standard/fixtures/valid.reality.md');
const validContent = readFileSync(fixturePath, 'utf8');

describe('@reality-architect/cli', () => {
  it('validates a reality markdown sample', () => {
    const result = validateReality(validContent);
    assert.equal(result.version, '0.1');
    assert.ok(result.level >= 2);
    assert.ok(result.conforms);
    assert.equal(result.errors.length, 0);
  });

  it('assesses claim confidence and flags certainty violations', () => {
    const claim = 'This system has 100% guaranteed zero bugs forever without any testing';
    const assessment = assessClaimConfidence(claim);
    assert.ok(typeof assessment.score === 'number');
    assert.equal(assessment.isFlagged, true);
    assert.ok(assessment.certaintyViolations.length > 0);
    assert.ok(assessment.cappedConfidence <= 0.4);
  });
});
