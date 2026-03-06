(function () {
    'use strict';

    var root = document.documentElement;
    var debugBadge;

    function getViewportInfo() {
        var width = window.innerWidth || root.clientWidth || 0;
        var height = window.innerHeight || root.clientHeight || 1;
        var aspectRatio = width / Math.max(height, 1);
        var shortScreenSide = Math.min(window.screen.width || width, window.screen.height || height);
        var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        var mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile|Windows Phone|Opera Mini|IEMobile/i.test(navigator.userAgent || '');
        var mobile = (
            (width <= 900 && aspectRatio <= 1.95) ||
            shortScreenSide <= 820 ||
            (coarsePointer && width <= 1100 && aspectRatio <= 2.1) ||
            mobileUserAgent
        );

        return {
            width: width,
            height: height,
            aspectRatio: aspectRatio,
            shortScreenSide: shortScreenSide,
            coarsePointer: coarsePointer,
            mobileUserAgent: mobileUserAgent,
            mobile: mobile
        };
    }

    function shouldShowDebugBadge() {
        var host = window.location.hostname;
        var isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
        var isFileMode = window.location.protocol === 'file:';
        var debugOverride = /(?:\?|&)mobileDebug=1(?:&|$)/.test(window.location.search || '');

        return isLocalHost || isFileMode || debugOverride;
    }

    function ensureDebugBadge() {
        if (!shouldShowDebugBadge()) {
            return;
        }
        if (debugBadge) {
            return;
        }

        debugBadge = document.createElement('div');
        debugBadge.className = 'mobile-debug-badge';
        document.body.appendChild(debugBadge);
    }

    function updateDebugBadge(info) {
        ensureDebugBadge();
        if (!debugBadge) {
            return;
        }

        var mobileText = info.mobile ? 'MOBILE' : 'DESKTOP';
        var roundedAspect = info.aspectRatio.toFixed(2);
        var pointerText = info.coarsePointer ? 'coarse' : 'fine';

        debugBadge.textContent =
            mobileText + ' | ' +
            info.width + 'x' + info.height +
            ' | ar ' + roundedAspect +
            ' | short ' + info.shortScreenSide +
            ' | ' + pointerText;
    }

    function applyMobileClass(info) {
        root.classList.toggle('is-mobile-browser', info.mobile);
    }

    function syncIndexLayout() {
        var header = document.querySelector('.header');
        var tabs = document.querySelector('.tabs');
        if (!header || !tabs) {
            return;
        }

        tabs.style.top = header.offsetHeight + 'px';
        var offset = header.offsetHeight + tabs.offsetHeight;
        var frameElements = document.querySelectorAll('.content-frame');
        for (var i = 0; i < frameElements.length; i++) {
            frameElements[i].style.top = offset + 'px';
            frameElements[i].style.height = 'calc(100vh - ' + offset + 'px)';
        }
    }

    function initIndexMobileDropdown() {
        var wrappers = document.querySelectorAll('.tab-wrapper');
        if (!wrappers.length) {
            return;
        }

        function closeDropdowns() {
            for (var i = 0; i < wrappers.length; i++) {
                wrappers[i].classList.remove('mobile-open');
            }
        }

        for (var i = 0; i < wrappers.length; i++) {
            (function (wrapper) {
                var tab = wrapper.querySelector('.tab');
                var dropdown = wrapper.querySelector('.dropdown');
                if (!tab || !dropdown) {
                    return;
                }

                tab.addEventListener('click', function (event) {
                    if (!root.classList.contains('is-mobile-browser')) {
                        return;
                    }

                    var alreadyOpen = wrapper.classList.contains('mobile-open');
                    closeDropdowns();

                    if (!alreadyOpen) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        wrapper.classList.add('mobile-open');
                    }
                }, true);
            })(wrappers[i]);
        }

        document.addEventListener('click', function (event) {
            if (!root.classList.contains('is-mobile-browser')) {
                return;
            }
            if (!event.target.closest('.tab-wrapper')) {
                closeDropdowns();
            }
        });

        window.addEventListener('resize', function () {
            if (!root.classList.contains('is-mobile-browser')) {
                closeDropdowns();
            }
        });
    }

    function updateLayout() {
        var info = getViewportInfo();
        applyMobileClass(info);
        syncIndexLayout();
        updateDebugBadge(info);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initIndexMobileDropdown();
        updateLayout();
    });

    window.addEventListener('resize', updateLayout, { passive: true });
    window.addEventListener('orientationchange', updateLayout, { passive: true });
})();
