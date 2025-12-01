// V86 Loader - Loads v86 emulator from CDN with fallback to local v86-lite
(function() {
    // First check if V86Starter already exists (from v86-lite.js)
    if (typeof V86Starter !== 'undefined') {
        console.log('V86 emulator already loaded');
        return;
    }

    // Load directly from the official v86 CDN (most reliable)
    var script = document.createElement('script');
    script.src = 'https://copy.sh/v86/build/libv86.js';
    script.crossOrigin = 'anonymous';

    script.onerror = function() {
        console.warn('Primary v86 CDN failed, trying GitHub CDN...');

        // Try GitHub CDN as backup
        var githubFallback = document.createElement('script');
        githubFallback.src = 'https://raw.githack.com/copy/v86/master/build/libv86.js';
        githubFallback.crossOrigin = 'anonymous';

        githubFallback.onerror = function() {
            console.warn('GitHub CDN failed, loading local v86-lite.js fallback...');

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
        githubFallback.onload = function() {
            console.log('V86 loaded from GitHub CDN');
        };
        document.head.appendChild(githubFallback);
    };
    script.onload = function() {
        console.log('V86 emulator loaded from copy.sh CDN');
    };
    document.head.appendChild(script);
})();