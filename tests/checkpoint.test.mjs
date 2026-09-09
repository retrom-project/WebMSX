import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const context = vm.createContext({wmsx: {}, TextEncoder, TextDecoder, Uint8Array});
vm.runInContext(readFileSync(new URL('../retrom/checkpoint.js', import.meta.url), 'utf8'), context);
const codec = context.wmsx.RetromCheckpoint;
const digest = 'a'.repeat(64);
test('instant snapshot retains machine and writable media across new instances', () => {
  const state = {c: {PC: 1234}, b: {ram: [1,2,3]}, dd: {disk: [4,5]}, ct: {position: 7}};
  const snapshot = codec.encode(digest, state);
  assert.deepEqual(JSON.parse(JSON.stringify(codec.decode(digest, snapshot))), state);
});
test('rejects another game, empty, truncated and oversized checkpoint', () => {
  const snapshot = codec.encode(digest, {c: {PC: 1234}});
  for (const bytes of [new Uint8Array(), snapshot.subarray(0, 20), new Uint8Array(codec.maximumBytes + 1)]) {
    assert.throws(() => codec.decode(digest, bytes), /WEBMSX_CHECKPOINT_INVALID/);
  }
  assert.throws(() => codec.decode('b'.repeat(64), snapshot), /WEBMSX_CHECKPOINT_INVALID/);
  assert.throws(() => codec.encode(digest, {}), /WEBMSX_CHECKPOINT_INVALID/);
});
