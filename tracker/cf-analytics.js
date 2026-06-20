/**
 * CausalFunnel User Analytics Tracker
 * ------------------------------------
 * Drop this script on any webpage to start tracking:
 *
 *   <script
 *     src="tracker.js"
 *     data-api-url="https://your-backend.onrender.com"
 *   ></script>
 *
 * Tracked events:
 *   - page_view    fired once on script load
 *   - click        fired on every document click (with optional data-track label)
 *   - scroll_depth fired at 25%, 50%, 75%, 100% scroll milestones
 *   - form_submit  fired when any form is submitted
 *
 * Each event payload:
 *   { session_id, event_type, page_url, timestamp, x?, y?, viewport_width, viewport_height, metadata? }
 *
 * session_id is a UUID v4 stored in localStorage under "cf_session_id".
 * A new session is created if none exists (first visit / cleared storage).
 */

(function () {
  "use strict";

  // ── Config ──────────────────────────────────────────────────────────────── //
  var currentScript =
    document.currentScript ||
    document.querySelector('script[data-api-url]');

  var API_URL = (currentScript && currentScript.getAttribute("data-api-url"))
    ? currentScript.getAttribute("data-api-url").replace(/\/$/, "")
    : "http://localhost:5000";

  var ENDPOINT   = API_URL + "/api/events";
  var SESSION_KEY = "cf_session_id";

  // ── Session ID ─────────────────────────────────────────────────────────── //
  function getOrCreateSessionId() {
    var id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      // UUID v4 polyfill — works in all browsers
      id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  var SESSION_ID = getOrCreateSessionId();

  // ── Send event ─────────────────────────────────────────────────────────── //
  function sendEvent(payload) {
    var body = Object.assign(
      {
        session_id:      SESSION_ID,
        page_url:        window.location.href,
        timestamp:       new Date().toISOString(),
        viewport_width:  window.innerWidth,
        viewport_height: window.innerHeight,
      },
      payload
    );

    // Use fetch with keepalive to ensure it fires even when page unloads,
    // and correctly handles CORS preflight for application/json.
    fetch(ENDPOINT, {
      method:    "POST",
      headers:   { "Content-Type": "application/json" },
      body:      JSON.stringify(body),
      keepalive: true,
    }).catch(function (err) {
      console.warn("[CausalFunnel] Failed to send event:", err);
    });
  }

  // ── page_view ──────────────────────────────────────────────────────────── //
  sendEvent({ event_type: "page_view" });

  // ── click (with optional data-track label) ─────────────────────────────── //
  document.addEventListener("click", function (e) {
    // Walk up the DOM to find the closest element with data-track attribute
    var el = e.target;
    var trackLabel = null;
    while (el && el !== document) {
      if (el.getAttribute && el.getAttribute("data-track")) {
        trackLabel = el.getAttribute("data-track");
        break;
      }
      el = el.parentElement;
    }

    var payload = {
      event_type: "click",
      x: e.clientX,
      y: e.clientY,
    };
    if (trackLabel) {
      payload.metadata = { label: trackLabel };
    }
    sendEvent(payload);
  }, { passive: true });

  // ── scroll_depth ───────────────────────────────────────────────────────── //
  var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };

  function onScroll() {
    var scrollTop    = window.scrollY || document.documentElement.scrollTop;
    var docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    var pct = Math.round((scrollTop / docHeight) * 100);

    [25, 50, 75, 100].forEach(function (milestone) {
      if (!scrollMilestones[milestone] && pct >= milestone) {
        scrollMilestones[milestone] = true;
        sendEvent({
          event_type: "scroll_depth",
          metadata:   { depth_percent: milestone },
        });
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  // ── form_submit ─────────────────────────────────────────────────────────── //
  document.addEventListener("submit", function (e) {
    var form = e.target;
    var formId   = form.id   || null;
    var formName = form.name || null;
    var formAction = form.action || null;

    sendEvent({
      event_type: "form_submit",
      metadata: {
        form_id:     formId,
        form_name:   formName,
        form_action: formAction,
      },
    });
  }, { passive: true });

  // ── SPA support: re-fire page_view on history navigation ──────────────── //
  (function patchHistory() {
    var _pushState    = history.pushState;
    var _replaceState = history.replaceState;

    history.pushState = function () {
      _pushState.apply(this, arguments);
      // Reset scroll milestones for the new page
      scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
      sendEvent({ event_type: "page_view" });
    };
    history.replaceState = function () {
      _replaceState.apply(this, arguments);
      scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
      sendEvent({ event_type: "page_view" });
    };

    window.addEventListener("popstate", function () {
      scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
      sendEvent({ event_type: "page_view" });
    });
  })();

  console.log("[CausalFunnel] Tracker initialised. Session:", SESSION_ID);
})();
