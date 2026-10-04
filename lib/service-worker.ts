/**
 * The service worker that lets the installed Studio open without a connection. It caches only the site's own pages
 * and code: what a person writes lives in their browser storage and never passes through here.
 *
 * - Pages: network first, falling back to the last copy (or the Studio) when offline.
 * - Build assets under /_next/static/ and app icons: cache first; their names change with every build.
 * - Anything else, including other origins and every non-GET request, is left to the browser untouched.
 *
 * Each deploy produces a new version, so the browser installs the new worker and old caches are removed.
 * To retire it in an emergency, ship a worker whose activate step calls self.registration.unregister().
 */
export function serviceWorkerSource(version: string): string {
  const safe = version.replace(/[^\w.-]/g, '').slice(0, 40) || 'dev'
  return `'use strict';
const CACHE = 'ra-shell-${safe}';
const SHELL = '/studio';

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.add(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key.indexOf('ra-shell-') === 0 && key !== CACHE; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

function keep(request, response) {
  if (response && response.ok && response.type === 'basic') {
    const copy = response.clone();
    caches.open(CACHE).then(function (cache) { return cache.put(request, copy); });
  }
  return response;
}

self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(function (response) { return keep(request, response); }).catch(function () {
      return caches.match(request).then(function (hit) { return hit || caches.match(SHELL); });
    }));
    return;
  }
  if (url.pathname.indexOf('/_next/static/') === 0 || url.pathname.indexOf('/pwa-icon/') === 0) {
    event.respondWith(caches.match(request).then(function (hit) {
      return hit || fetch(request).then(function (response) { return keep(request, response); });
    }));
  }
});
`
}
