import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const context = vm.createContext({wmsx: {}});
vm.runInContext(readFileSync(new URL('../retrom/layout.js', import.meta.url), 'utf8'), context);
test('the physical MSX display remains centered and bounded in landscape and portrait', () => {
  for (const [width, height] of [[1280, 900], [900, 1280], [1920, 1080]]) {
    const r = context.wmsx.RetromLayout.fit(width, height);
    assert.ok(r.width <= width && r.height <= height);
    assert.equal(r.width / r.height, 4 / 3);
    assert.equal(r.left * 2 + r.width, width);
    assert.equal(r.top * 2 + r.height, height);
  }
  assert.equal(context.wmsx.RetromLayout.fit(0, 0), null);
});

test('layout settles when the browser rounds fractional CSS pixel dimensions', () => {
  const properties = new Map();
  let writes = 0, refresh;
  context.document = {createElement: () => ({remove() {}})};
  context.MutationObserver = class {constructor(callback) {refresh = callback;} observe() {} disconnect() {}};
  context.ResizeObserver = class {observe() {} disconnect() {}};
  const canvas = {style: {
    getPropertyValue: (name) => properties.get(name) ?? '',
    getPropertyPriority: (name) => properties.has(name) ? 'important' : '',
    setProperty(name, value) {
      writes++;
      properties.set(name, value.endsWith('px') ? Number(parseFloat(value).toFixed(2)) + 'px' : value);
    }
  }};
  const layout = context.wmsx.RetromLayout.install({clientWidth: 1280, clientHeight: 901, appendChild() {}}, canvas);
  const initialWrites = writes;
  refresh(); refresh();
  assert.equal(writes, initialWrites, 'serialized pixel rounding must not cause a MutationObserver loop');
  layout.dispose();
});
