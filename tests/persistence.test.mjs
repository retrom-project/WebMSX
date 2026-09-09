import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

test('host-owned state and ROM mapper settings never touch shared browser storage', () => {
  const context = vm.createContext({WMSX: {RETROM_HOST_MODE: true},
    wmsx: {SlotCreator: {setUserROMFormats() {}}}});
  Object.defineProperty(context, 'localStorage', {get() {throw Error('Browser storage unavailable');}});
  for (const file of ['src/main/userprefs/UserROMFormats.js', 'src/main/room/savestate/SaveStateMedia.js']) {
    vm.runInContext(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), context);
  }
  const formats = context.WMSX.userROMFormats;
  formats.init();
  formats.setForROM({info: {h: 'owned'}}, 'Normal', false);
  assert.equal(formats.getForROM({info: {h: 'owned'}}), 'Normal');
  formats.init();
  assert.equal(formats.getForROM({info: {h: 'owned'}}), undefined);
  const saves = new context.wmsx.SaveStateMedia({});
  assert.equal(saves.isSlotUsed(1), false);
  saves.persistState(1, {}, (written) => assert.equal(written, false));
  saves.retrieveState(1, (data) => assert.equal(data, undefined));
});
