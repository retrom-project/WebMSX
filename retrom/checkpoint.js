// Retrom host checkpoint envelope; upstream machine serialization owns the state.
wmsx.RetromCheckpoint = (function () {
    var maximumBytes = 32 * 1024 * 1024;
    function invalid() { throw new Error('WEBMSX_CHECKPOINT_INVALID'); }
    function validState(state) { return state && typeof state === 'object' && state.c && typeof state.c === 'object'; }
    return {
        maximumBytes: maximumBytes,
        encode: function (digest, state) {
            if (!/^[a-f0-9]{64}$/.test(digest) || !validState(state)) invalid();
            var bytes = new TextEncoder().encode(JSON.stringify({format: 'webmsx-state-v1', digest: digest, state: state}));
            if (bytes.length > maximumBytes) invalid();
            return bytes;
        },
        decode: function (digest, bytes) {
            if (!bytes || bytes.length < 1 || bytes.length > maximumBytes) invalid();
            var value;
            try { value = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes)); }
            catch (_) { invalid(); }
            if (!value || value.format !== 'webmsx-state-v1' || value.digest !== digest || !validState(value.state)) invalid();
            return value.state;
        }
    };
})();
