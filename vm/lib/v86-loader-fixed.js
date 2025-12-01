// V86 Loader - Enhanced with better error handling and multiple CDN fallbacks
(function() {
    window.V86LoaderStatus = {
        loading: false,
        loaded: false,
        error: null,
        source: null
    };

    // Check if already loaded
    if (typeof V86Starter !== 'undefined') {
        console.log('✓ V86 emulator already loaded');
        window.V86LoaderStatus.loaded = true;
        window.V86LoaderStatus.source = 'pre-existing';
        return;
    }

    window.V86LoaderStatus.loading = true;

    // Display loading status
    function updateStatus(message, isError = false) {
        console.log(message);
        if (document.getElementById('bootLog')) {
            const logEl = document.getElementById('bootLog');
            const className = isError ? 'error' : 'info';
            logEl.innerHTML = `<div class="${className}">${message}</div>` + logEl.innerHTML;
        }
    }

    // Test if V86Starter works
    function testV86() {
        try {
            if (typeof V86Starter === 'function') {
                // Try to create a minimal instance to verify it works
                const test = new V86Starter({
                    memory_size: 32 * 1024 * 1024,
                    screen_container: document.createElement('div'),
                    autostart: false
                });
                if (test && test.destroy) {
                    test.destroy();
                }
                return true;
            }
        } catch(e) {
            console.warn('V86Starter exists but failed test:', e);
        }
        return false;
    }

    // CDN sources to try in order
    const cdnSources = [
        {
            name: 'copy.sh CDN',
            url: 'https://copy.sh/v86/build/libv86.js',
            crossOrigin: 'anonymous'
        },
        {
            name: 'jsDelivr CDN',
            url: 'https://cdn.jsdelivr.net/gh/copy/v86@master/build/libv86.js',
            crossOrigin: 'anonymous'
        },
        {
            name: 'unpkg CDN',
            url: 'https://unpkg.com/v86@latest/build/libv86.js',
            crossOrigin: 'anonymous'
        },
        {
            name: 'GitHub raw',
            url: 'https://raw.githack.com/copy/v86/master/build/libv86.js',
            crossOrigin: 'anonymous'
        }
    ];

    let currentSourceIndex = 0;

    function loadNextSource() {
        if (currentSourceIndex >= cdnSources.length) {
            // All CDNs failed, try local fallback
            loadLocalFallback();
            return;
        }

        const source = cdnSources[currentSourceIndex];
        updateStatus(`Loading v86 from ${source.name}...`);

        const script = document.createElement('script');
        script.src = source.url;

        if (source.crossOrigin) {
            script.crossOrigin = source.crossOrigin;
        }

        script.onload = function() {
            // Verify it actually loaded and works
            if (testV86()) {
                updateStatus(`✓ V86 loaded successfully from ${source.name}`);
                window.V86LoaderStatus.loaded = true;
                window.V86LoaderStatus.source = source.name;
                window.V86LoaderStatus.loading = false;

                // Dispatch event for other scripts
                window.dispatchEvent(new Event('v86-loaded'));
            } else {
                updateStatus(`⚠ ${source.name} loaded but V86Starter not functional`, true);
                currentSourceIndex++;
                script.remove();
                loadNextSource();
            }
        };

        script.onerror = function(e) {
            updateStatus(`✗ ${source.name} failed to load`, true);
            currentSourceIndex++;
            script.remove();
            loadNextSource();
        };

        document.head.appendChild(script);
    }

    function loadLocalFallback() {
        updateStatus('Loading local v86-lite.js fallback...');

        const script = document.createElement('script');
        script.src = 'lib/v86-lite.js';

        script.onload = function() {
            if (typeof V86Lite !== 'undefined') {
                // Set V86Starter to V86Lite
                window.V86Starter = V86Lite;

                if (testV86()) {
                    updateStatus('✓ V86-lite fallback loaded successfully');
                    window.V86LoaderStatus.loaded = true;
                    window.V86LoaderStatus.source = 'local-v86-lite';
                    window.V86LoaderStatus.loading = false;
                    window.dispatchEvent(new Event('v86-loaded'));
                } else {
                    showFatalError();
                }
            } else {
                showFatalError();
            }
        };

        script.onerror = function() {
            showFatalError();
        };

        document.head.appendChild(script);
    }

    function showFatalError() {
        const errorMsg = 'Failed to load VM emulator from all sources. Please check your internet connection and refresh the page.';
        updateStatus(errorMsg, true);
        window.V86LoaderStatus.error = errorMsg;
        window.V86LoaderStatus.loading = false;

        // Show user-friendly error
        if (document.getElementById('bootOverlay')) {
            const overlay = document.getElementById('bootOverlay');
            overlay.innerHTML = `
                <div style="color: #f85149; text-align: center; padding: 20px;">
                    <h2>VM Emulator Loading Error</h2>
                    <p>${errorMsg}</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px;">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }

    // Start loading from first source
    loadNextSource();

    // Also provide a manual retry function
    window.retryV86Load = function() {
        if (!window.V86LoaderStatus.loaded && !window.V86LoaderStatus.loading) {
            currentSourceIndex = 0;
            window.V86LoaderStatus.loading = true;
            window.V86LoaderStatus.error = null;
            loadNextSource();
        }
    };
})();