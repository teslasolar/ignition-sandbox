// V86 Loader - Loads v86 emulator from CDN with fallback to local v86-lite
(function() {
    // Pin to stable v86 version for consistency
    const V86_VERSION = '0.1.0';

    // First check if V86Starter already exists (from v86-lite.js)
    if (typeof V86Starter !== 'undefined') {
        console.log('V86 emulator already loaded');
        return;
    }

    // Try primary CDN (pinned version)
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/v86@' + V86_VERSION + '/build/libv86.js';
    script.onerror = function() {
        console.warn('Primary v86 CDN failed, trying fallback CDN...');

        // Try secondary CDN
        var cdnFallback = document.createElement('script');
        cdnFallback.src = 'https://cdn.jsdelivr.net/npm/v86@' + V86_VERSION + '/build/libv86.js';
        cdnFallback.onerror = function() {
            console.warn('CDN sources failed, loading local v86-lite.js fallback...');

            // Load local v86-lite.js as final fallback
            var localFallback = document.createElement('script');
            localFallback.src = 'lib/v86-lite.js';
            localFallback.onload = function() {
                console.log('V86-lite fallback loaded successfully');
                // v86-lite.js sets window.V86Starter = V86Lite
            };
            localFallback.onerror = function() {
                console.error('Failed to load v86-lite.js fallback');
                // Show clear error to user
                if (document.getElementById('bootLog')) {
                    document.getElementById('bootLog').innerHTML =
                        '<div class="error">Failed to load VM emulator. Please refresh the page.</div>';
                }
            };
            document.head.appendChild(localFallback);
        };
        cdnFallback.onload = function() {
            console.log('V86 loaded from backup CDN');
        };
        document.head.appendChild(cdnFallback);
    };
    script.onload = function() {
        console.log('V86 emulator loaded from unpkg CDN');
    };
    document.head.appendChild(script);
})();