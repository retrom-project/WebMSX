// A fixed MSX display uses a 4:3 physical screen regardless of the VDP pixel mode.
wmsx.RetromLayout = {
    fit: function (width, height) {
        if (!(width > 0 && height > 0)) return null;
        var w = Math.min(width, height * 4 / 3), h = w * 3 / 4;
        return {width: w, height: h, left: (width - w) / 2, top: (height - h) / 2};
    },
    install: function (container, canvas) {
        var style = document.createElement('style');
        style.textContent = '#wmsx-screen-fs,#wmsx-screen-fs-center,#wmsx-screen-canvas-outer{' +
            'position:absolute!important;inset:0!important;width:100%!important;height:100%!important;' +
            'display:block!important;transform:none!important;margin:0!important;padding:0!important}' +
            '#wmsx-bar,#wmsx-screen-scroll-message{display:none!important}';
        container.appendChild(style);
        function refresh() {
            var rect = wmsx.RetromLayout.fit(container.clientWidth, container.clientHeight);
            if (!rect) return;
            var values = {position: 'absolute', margin: '0px', transform: 'none',
                width: rect.width + 'px', height: rect.height + 'px', left: rect.left + 'px', top: rect.top + 'px'};
            for (var name in values) {
                var current = canvas.style.getPropertyValue(name);
                var same = current === values[name] || values[name].endsWith('px') &&
                    current.endsWith('px') && Math.abs(parseFloat(current) - parseFloat(values[name])) < 0.01;
                if (!same || canvas.style.getPropertyPriority(name) !== 'important')
                    canvas.style.setProperty(name, values[name], 'important');
            }
        }
        // Upstream video-mode changes and the host's initial sizing can both change inline styles.
        // Compare before writing so either observer settles without a mutation loop.
        var mutation = new MutationObserver(refresh);
        mutation.observe(canvas, {attributes: true, attributeFilter: ['style']});
        var resize = new ResizeObserver(refresh);
        resize.observe(container);
        refresh();
        return {dispose: function () { mutation.disconnect(); resize.disconnect(); style.remove(); }};
    }
};
