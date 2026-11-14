import test from 'node:test';
import assert from 'node:assert/strict';
import { pickCategory } from '../scripts/lib/category.mjs';

test('une zone précise l’emporte sur « international »', () => {
  assert.equal(pickCategory(['international', 'international', 'afrique']), 'afrique');
});
test('sans zone, la rubrique majoritaire est gardée', () => {
  assert.equal(pickCategory(['economie', 'economie', 'tech']), 'economie');
});
test('liste vide : repli', () => {
  assert.equal(pickCategory([], 'international'), 'international');
});
