import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

test('initializes before the host reveals the loading iframe, where RAF may be suspended', () => {
  let animationRequests = 0;
  const context = vm.createContext({WMSX: {}, wmsx: {Util: {warning() {}, performanceNow: () => 0}},
    window: {requestAnimationFrame() {}}, requestAnimationFrame() {animationRequests++;}});
  for (const file of ['src/main/WMSX.js', 'retrom/config.js', 'src/main/room/clock/Clock.js']) {
    vm.runInContext(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), context);
  }
  context.wmsx.Util = {warning() {}, performanceNow: () => 0};
  let ready = false;
  new context.wmsx.Clock(() => {}).detectHostNativeFPSAndCallback(() => {ready = true;});
  assert.equal(ready, true);
  assert.equal(animationRequests, 0);
});
