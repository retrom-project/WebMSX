// Retrom's host-owned lifecycle for the pinned WebMSX engine.
window.__RETROM_WEBMSX_CORE_V1__ = {
    abi: 'webmsx-host-v1',
    create: async function (options) {
        if (!options || options.target.ownerDocument !== document || !options.bytes.length || !WMSX.start)
            throw new Error('WEBMSX_CONFIG_INVALID');
        var restore = options.restore ? wmsx.RetromCheckpoint.decode(options.digest, options.restore) : null;
        var container = document.createElement('div');
        container.id = 'wmsx-screen';
        container.style.cssText = 'width:100%;height:100%;position:relative;overflow:hidden;border:0!important';
        options.target.replaceChildren(container);
        WMSX.screenElement = container;
        WMSX.userPreferences.save = function () {};
        var ready;
        var started = new Promise(function (resolve) { ready = resolve; });
        var originalStart = wmsx.Room;
        // The launcher owns BIOS loading. Observe its normal completion before installing game bytes.
        wmsx.Room = function (screen, power) {
            var room = new originalStart(screen, power);
            var screenStart = room.screen.start;
            room.screen.start = function (action) { screenStart.call(room.screen, action); ready(room); };
            return room;
        };
        var timer;
        var room;
        try {
            WMSX.start(false);
            room = await Promise.race([started, new Promise(function (_, reject) {
                timer = setTimeout(function () { reject(new Error('WEBMSX_START_TIMEOUT')); }, 15000);
            })]);
            room.mainVideoClock.pause();
            room.machine.userPause(true);
            // FileLoader reports malformed media through OSD; convert that boundary into a host error.
            var originalOSD = room.screen.showOSD;
            room.screen.showOSD = function (message, overlap, error) {
                if (error) throw new Error('WEBMSX_MEDIA_INVALID');
                return originalOSD.call(room.screen, message, overlap, error);
            };
            room.fileLoader.loadFromContent('game', options.bytes, wmsx.FileLoader.OPEN_TYPE.AUTO, 0, true);
            room.machine.userPowerOn(true);
            if (restore) room.machine.loadState(restore);
            room.controllersHub.releaseControllers();
            room.machine.userPause(false);
            room.mainVideoClock.go();
        } catch (error) {
            if (WMSX.room) { WMSX.room.mainVideoClock.pause(); WMSX.room.powerOff(); }
            options.target.replaceChildren();
            throw error;
        } finally { clearTimeout(timer); }
        var canvas = document.getElementById('wmsx-screen-canvas');
        canvas.setAttribute('aria-label', 'MSX game');
        var layout = wmsx.RetromLayout.install(container, canvas);
        var stopped = false;
        function active() { if (stopped) throw new Error('WEBMSX_STOPPED'); }
        return {
            canvas: canvas,
            checkpoint: function () {
                active();
                room.controllersHub.releaseControllers();
                return wmsx.RetromCheckpoint.encode(options.digest, room.machine.saveState(true));
            },
            pause: function () { active(); room.controllersHub.releaseControllers(); room.machine.userPause(true); },
            resume: function () { active(); room.machine.userPause(false); },
            stop: function () {
                if (stopped) return;
                stopped = true;
                layout.dispose();
                room.controllersHub.releaseControllers();
                room.mainVideoClock.pause();
                room.powerOff();
                options.target.replaceChildren();
            }
        };
    }
};
