/* BOG UI — small behaviors the CSS can't do on its own.
   <script src="PATH/TO/bog-ui/bog-ui.js" defer></script> */
(function () {
  // Text Input: state detection relies on :placeholder-shown, so every input needs a placeholder.
  function ensurePlaceholders(root) {
    root.querySelectorAll(".bog-field__input:not([placeholder])").forEach(function (input) {
      input.setAttribute("placeholder", " ");
    });
  }
  ensurePlaceholders(document);
  document.addEventListener("focusin", function (e) {
    if (e.target.matches && e.target.matches(".bog-field__input")) ensurePlaceholders(e.target.parentNode);
  });

  // Text Input: keep focus in the input when the clear button is pressed
  document.addEventListener("mousedown", function (e) {
    if (e.target.closest(".bog-field__clear")) e.preventDefault();
  });

  // Text Input: clear the value
  document.addEventListener("click", function (e) {
    var clear = e.target.closest(".bog-field__clear");
    if (!clear) return;
    e.preventDefault();
    var input = clear.closest(".bog-field").querySelector(".bog-field__input");
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  });

  // Account Picker: currency chips are single-select within their group
  document.addEventListener("click", function (e) {
    var chip = e.target.closest(".bog-currency-chip");
    if (!chip || chip.disabled) return;
    var group = chip.closest(".bog-picker__chips");
    if (group) group.querySelectorAll(".bog-currency-chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    chip.setAttribute("aria-pressed", "true");
  });

  // Account Picker: pickers inside a .bog-picker-group are single-select.
  // Pickers with a .bog-picker__expand (currency chips) expand on tap and become selected;
  // tapping an expanded one collapses it. Opening one collapses the others in the group.
  function selectPicker(box) {
    var picker = box.closest(".bog-picker");
    if (picker.matches('[data-state="skeleton"]')) return;
    var group = picker.closest(".bog-picker-group");
    var expandable = !!picker.querySelector(".bog-picker__expand");
    var willExpand = expandable && !picker.hasAttribute("data-expanded");
    if (group) {
      group.querySelectorAll(".bog-picker").forEach(function (p) {
        if (p === picker) return;
        p.removeAttribute("data-selected");
        setExpanded(p, false);
      });
    }
    if (group || expandable) picker.setAttribute("data-selected", "");
    if (expandable) setExpanded(picker, willExpand);
  }
  function setExpanded(picker, on) {
    if (!picker.querySelector(".bog-picker__expand")) return;
    picker.toggleAttribute("data-expanded", on);
    var box = picker.querySelector(".bog-picker__box");
    if (box) box.setAttribute("aria-expanded", on ? "true" : "false");
  }
  document.querySelectorAll(".bog-picker").forEach(function (p) {
    if (p.querySelector(".bog-picker__expand")) setExpanded(p, p.hasAttribute("data-expanded"));
  });
  document.addEventListener("click", function (e) {
    var box = e.target.closest(".bog-picker__box");
    if (box && !e.target.closest(".bog-currency-chip")) selectPicker(box);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches(".bog-picker__box")) {
      e.preventDefault();
      selectPicker(e.target);
    }
  });
})();

/* ---- Bottom Sheet + Select ------------------------------------------------ */
(function () {
  var openStack = [];

  function resolve(sheet) { return typeof sheet === "string" ? document.getElementById(sheet) : sheet; }

  // Every sheet gets an X (close) button on the right of its header by default.
  // Skipped when the header already has a [data-sheet-close] button, or with data-close="false".
  function ensureClose(sheet) {
    if (!sheet || sheet.getAttribute("data-close") === "false") return;
    var nav = sheet.querySelector(".bog-sheet__nav");
    if (!nav || nav.querySelector("[data-sheet-close]")) return;
    nav.insertAdjacentHTML("beforeend",
      '<button type="button" class="bog-icon-btn bog-sheet__close" data-type="neutral" aria-label="Close" data-sheet-close>' +
      '<span class="bog-icon" data-icon="close"></span></button>');
  }
  document.querySelectorAll(".bog-sheet").forEach(ensureClose);

  // Open motion — Chat Motion Guidelines › Action Sheet (2:4924): the panel rises from below the screen
  // (788px, or its own height if taller) to 20px past its spot in 300ms, then settles back in 250ms.
  // Closing keeps the slide-down transition in bottom-sheet.css.
  function enter(sheet) {
    var panel = sheet.querySelector(".bog-sheet__panel");
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!panel || !panel.animate || still) return;
    sheet.setAttribute("data-entering", "");   // the CSS slide-up transition is off meanwhile
    var a = panel.animate([
      { translate: "0 max(100%, 788px)", easing: "cubic-bezier(0.33, 0, 0.25, 1)" },
      { translate: "0 -20px", offset: 300 / 550, easing: "cubic-bezier(0.17, 0, 0.25, 1)" },
      { translate: "0 0" }
    ], { duration: 550 });
    sheet._enter = a;
    function end() {
      if (sheet._enter !== a) return;
      sheet._enter = null;
      sheet.removeAttribute("data-entering");
    }
    a.finished.then(end, end);
  }

  function openSheet(sheet, opener) {
    sheet = resolve(sheet);
    if (!sheet || sheet.hasAttribute("data-open")) return;
    stopLeaving(sheet);   // reopened while closing
    ensureClose(sheet);
    sheet._opener = opener || document.activeElement;
    sheet.hidden = false;
    sheet.getBoundingClientRect(); // start the slide-up from the closed position
    sheet.setAttribute("data-open", "");
    enter(sheet);
    openStack.push(sheet);
    document.documentElement.classList.add("bog-sheet-locked"); // freeze the page behind the sheet
    var panel = sheet.querySelector(".bog-sheet__panel");
    if (panel) {
      if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");
      var target = panel.querySelector('[aria-selected="true"]') || panel;
      setTimeout(function () {
        // Don't take focus from a text field: on phones that would close the keyboard
        var a = document.activeElement;
        if (a && a.matches && a.matches("input:not([type=checkbox]):not([type=radio]), textarea, [contenteditable]")) return;
        target.focus({ preventScroll: true });
      }, 50);
    }
  }

  // Close motion (pairs with the open motion above): the sheet drops its own height + 24px in 250ms,
  // accelerating — cubic-bezier(0.75, 0, 0.67, 1), the open curve mirrored — while the overlay fades out
  // in 200ms (linear). After a drag it continues from where the finger let go, over the remaining
  // distance (never under 150ms). Returns false when it can't animate (reduced motion, old browsers).
  function leave(sheet, panel, from, overlay) {
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!panel || !panel.animate || still) return false;
    sheet.setAttribute("data-leaving", "");   // CSS transitions off; the panel stays where it is meanwhile
    var dist = panel.getBoundingClientRect().height + 24;
    var ms = Math.max(150, 250 * Math.max(0, dist - from) / dist);
    var list = [
      panel.animate({ translate: ["0 " + from + "px", "0 " + dist + "px"] },
        { duration: ms, easing: "cubic-bezier(0.75, 0, 0.67, 1)", fill: "forwards" }),
      sheet.animate({ opacity: [overlay, 0] },
        { duration: ms * 0.8, easing: "linear", fill: "forwards", pseudoElement: "::before" })
    ];
    sheet._leave = list;
    Promise.all(list.map(function (x) { return x.finished; })).then(function () {
      if (sheet._leave !== list) return;
      sheet._leave = null;
      sheet.hidden = true;
      sheet.removeAttribute("data-leaving");
      list.forEach(function (x) { x.cancel(); });
    }, function () {});
    return true;
  }
  function stopLeaving(sheet) {
    if (!sheet._leave) return;
    var list = sheet._leave;
    sheet._leave = null;
    list.forEach(function (x) { x.cancel(); });
    sheet.removeAttribute("data-leaving");
  }

  function closeSheet(sheet) {
    sheet = resolve(sheet) || openStack[openStack.length - 1];
    if (!sheet || !sheet.hasAttribute("data-open")) return;
    var panel = sheet.querySelector(".bog-sheet__panel");
    // Where the sheet is right now: dragged down, or still rising from the open motion
    var from = parseFloat(sheet.style.getPropertyValue("--drag")) || 0;
    if (sheet._enter && panel) {
      from = parseFloat((getComputedStyle(panel).translate || "").split(" ")[1]) || 0;
      sheet._enter.cancel(); sheet._enter = null; sheet.removeAttribute("data-entering");
    }
    var overlay = parseFloat(getComputedStyle(sheet, "::before").opacity) || 0;
    sheet.removeAttribute("data-open");
    sheet.style.removeProperty("--drag");
    openStack = openStack.filter(function (s) { return s !== sheet; });
    if (!openStack.length) document.documentElement.classList.remove("bog-sheet-locked");
    if (!leave(sheet, panel, from, overlay)) {
      var done = function () { if (!sheet.hasAttribute("data-open")) sheet.hidden = true; };
      if (panel && getComputedStyle(panel).transitionDuration !== "0s") panel.addEventListener("transitionend", done, { once: true });
      else done();
      setTimeout(done, 400); // fallback
    }
    if (sheet._select) sheet._select.removeAttribute("data-open");
    if (sheet._opener && sheet._opener.focus) sheet._opener.focus({ preventScroll: true });
    sheet.dispatchEvent(new CustomEvent("sheetclose", { bubbles: true }));
  }

  // Open / close triggers
  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-sheet-open]");
    if (opener) { e.preventDefault(); openSheet(opener.getAttribute("data-sheet-open"), opener); return; }
    var closer = e.target.closest("[data-sheet-close]");
    if (closer) { closeSheet(closer.closest(".bog-sheet")); return; }
    // tap on the overlay (the sheet root itself, outside the panel)
    if (e.target.classList && e.target.classList.contains("bog-sheet") && e.target.getAttribute("data-overlay") !== "false") closeSheet(e.target);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && openStack.length) closeSheet();
  });

  // Drag the handle/header down to dismiss
  document.addEventListener("pointerdown", function (e) {
    var nav = e.target.closest(".bog-sheet__nav");
    if (!nav || e.target.closest("button, a, input")) return;
    var sheet = nav.closest(".bog-sheet");
    var panel = sheet.querySelector(".bog-sheet__panel");
    var startY = e.clientY, startT = Date.now(), dy = 0;
    sheet.setAttribute("data-dragging", "");
    nav.setPointerCapture(e.pointerId);
    function move(ev) { dy = Math.max(0, ev.clientY - startY); sheet.style.setProperty("--drag", dy + "px"); }
    function up() {
      nav.removeEventListener("pointermove", move);
      nav.removeEventListener("pointerup", up);
      nav.removeEventListener("pointercancel", up);
      sheet.removeAttribute("data-dragging");
      var fast = dy / Math.max(1, Date.now() - startT) > 0.5;
      if (dy > panel.offsetHeight * 0.25 || (fast && dy > 30)) closeSheet(sheet);
      else sheet.style.removeProperty("--drag");
    }
    nav.addEventListener("pointermove", move);
    nav.addEventListener("pointerup", up);
    nav.addEventListener("pointercancel", up);
  });

  // ---- Select ---------------------------------------------------------------
  var autoId = 0;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // Build a bottom sheet from a hidden native <select> when no data-sheet is given
  function sheetFor(select) {
    var id = select.getAttribute("data-sheet");
    if (id) return document.getElementById(id);
    var native = select.querySelector(".bog-select__native");
    if (!native) return null;
    id = "bog-select-sheet-" + (++autoId);
    var labelEl = select.querySelector(".bog-select__label");
    var title = select.getAttribute("data-sheet-title") || (labelEl ? labelEl.textContent : "");
    var html = '<div class="bog-sheet" id="' + id + '" hidden><div class="bog-sheet__panel" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<header class="bog-sheet__nav"><div class="bog-sheet__heading"><h2 class="bog-sheet__title">' + esc(title) + '</h2></div></header>' +
      '<div class="bog-sheet__content" data-type="list"><div class="bog-list" role="listbox">';
    Array.prototype.forEach.call(native.options, function (o) {
      if (o.value === "" && !o.textContent.trim()) return;
      html += '<button type="button" class="bog-list-item" role="option" data-value="' + esc(o.value) + '"' + (o.disabled ? " disabled" : "") + '>' +
        '<span class="bog-list-item__content"><span class="bog-list-item__label">' + esc(o.textContent) + '</span></span></button>';
    });
    html += "</div></div></div></div>";
    var host = select.closest(".bog-sheet-host") || document.body;
    host.insertAdjacentHTML("beforeend", html);
    select.setAttribute("data-sheet", id);
    return document.getElementById(id);
  }

  function syncSelected(select, sheet) {
    var v = select.getAttribute("data-value");
    sheet.querySelectorAll(".bog-list-item[data-value]").forEach(function (it) {
      it.setAttribute("aria-selected", it.getAttribute("data-value") === v ? "true" : "false");
    });
    sheet.querySelectorAll(".bog-picker[data-value]").forEach(function (p) {
      p.toggleAttribute("data-selected", p.getAttribute("data-value") === v);
    });
  }

  function setValue(select, value, label) {
    select.setAttribute("data-value", value);
    var out = select.querySelector(".bog-select__value");
    if (out) out.textContent = label;
    var native = select.querySelector(".bog-select__native");
    if (native) native.value = value;
    select.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value: value, label: label } }));
  }

  // Initial value from the native select's selected option
  document.querySelectorAll(".bog-select").forEach(function (select) {
    var native = select.querySelector(".bog-select__native");
    if (!select.hasAttribute("data-value") && native && native.selectedIndex >= 0 && native.options[native.selectedIndex].hasAttribute("selected")) {
      var o = native.options[native.selectedIndex];
      select.setAttribute("data-value", o.value);
      var out = select.querySelector(".bog-select__value");
      if (out && !out.textContent) out.textContent = o.textContent;
    }
  });

  document.addEventListener("click", function (e) {
    // Tap the Select → open its bottom sheet
    var box = e.target.closest(".bog-select__box");
    if (box) {
      var select = box.closest(".bog-select");
      if (box.disabled || box.getAttribute("aria-readonly") === "true" || select.matches('[data-state="skeleton"]')) return;
      var sheet = sheetFor(select);
      if (!sheet) return;
      sheet._select = select;
      syncSelected(select, sheet);
      select.setAttribute("data-open", "");
      openSheet(sheet, box);
      return;
    }
    // Tap an option in a sheet opened by a Select → set the value and close
    var item = e.target.closest(".bog-list-item[data-value], .bog-picker[data-value]");
    if (item && !item.disabled && !e.target.closest(".bog-currency-chip")) {
      var sh = item.closest(".bog-sheet");
      if (!sh || !sh._select) return;
      var labelEl = item.querySelector(".bog-list-item__label, .bog-picker__title");
      setValue(sh._select, item.getAttribute("data-value"), item.getAttribute("data-label") || (labelEl ? labelEl.textContent : item.textContent.trim()));
      var media = item.getAttribute("data-media"), mImg = media && sh._select.querySelector(".bog-select__box > :not(.bog-select__text) img");
      if (mImg) mImg.src = media;
      syncSelected(sh._select, sh);
      setTimeout(function () { closeSheet(sh); }, 120);
    }
  });

  window.BOG = window.BOG || {};
  window.BOG.openSheet = openSheet;
  window.BOG.closeSheet = closeSheet;

  // Keyboard: on phones the on-screen keyboard shrinks the visual viewport but not
  // fixed elements. Expose its height so open sheets can sit above it.
  if (window.visualViewport) {
    var vv = window.visualViewport;
    // While the keyboard is open iOS scrolls the page up to make room, which drags fixed
    // screens and sheets (and their top bars) up too. --bog-vv-top / --bog-vv-height pin
    // them to the visible area instead; outside keyboard time they're removed (= full screen).
    var root = document.documentElement.style;
    var syncKeyboard = function () {
      var kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      var open = kb > 80;
      root.setProperty("--bog-keyboard", (open ? kb : 0) + "px");
      if (open) {
        root.setProperty("--bog-vv-top", Math.round(vv.offsetTop) + "px");
        root.setProperty("--bog-vv-height", Math.round(vv.height) + "px");
      } else {
        root.removeProperty("--bog-vv-top");
        root.removeProperty("--bog-vv-height");
      }
      document.documentElement.toggleAttribute("data-bog-keyboard", open);
    };
    // Keep the focused field in view inside its own scroll area once the keyboard is up
    document.addEventListener("focusin", function (e) {
      var el = e.target;
      if (!el.matches || !el.matches("input, textarea, [contenteditable]") || el.getAttribute("aria-hidden") === "true") return;
      if (el.closest(".bog-sheet")) return;   // sheets already sit above the keyboard; scrolling there only makes content jump
      setTimeout(function () {                 // once, after the keyboard animation has settled
        if (document.activeElement === el && document.documentElement.hasAttribute("data-bog-keyboard")) el.scrollIntoView({ block: "center" });
      }, 500);
    });
    vv.addEventListener("resize", syncKeyboard);
    vv.addEventListener("scroll", syncKeyboard);
  }
})();

/* ---- Action Item: remove button ------------------------------------------
   Inside a selection strip (.bog-selection) removing plays the strip motion below;
   elsewhere the item fades out. */
(function () {
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".bog-action-item__remove");
    if (!btn) return;
    var item = btn.closest(".bog-action-item");
    var ev = new CustomEvent("actionitemremove", { bubbles: true, cancelable: true });
    if (!item.dispatchEvent(ev)) return; // call e.preventDefault() in a listener to keep the item
    if (item.closest(".bog-selection") && window.BOG && BOG.selectionRemove) { BOG.selectionRemove(item); return; }
    item.setAttribute("data-removing", "");
    setTimeout(function () { item.remove(); }, 180);
  });
})();

/* ---- Selection strip: chosen recipients as removable Action Items --------
   Figma "Avatars" (Component Motion Guidelines 812:443).
     BOG.selectionAdd(strip, item)   adds an Action Item (element or HTML) at the end
     BOG.selectionRemove(item)       removes one
   First item: the strip opens and pushes the content below down, 7px past and back;
   the avatar pops in to 102% and settles. Next items: the avatar pops in and the
   row slides along to show it. Removing: the avatar shrinks away and the ones after
   it close the gap; removing the last one closes the strip.
   --bog-selection-slow on the strip (or a parent) stretches every duration (docs). */
(function () {
  var E = function (a, b, c, d) { return "cubic-bezier(" + [a, b, c, d].join(", ") + ")"; };
  var reduce = function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var slowOf = function (el) { return parseFloat(getComputedStyle(el).getPropertyValue("--bog-selection-slow")) || 1; };
  var circleOf = function (item) { return item.querySelector(".bog-action-item__circle") || item; };

  function popIn(item, first, k) {
    var c = circleOf(item);
    // One track: 0 until 17 ms → 102% (first: at 150 ms, next: at 153 ms) → 100% 100 ms later
    var peak = first ? 150 : 153, end = peak + 100;
    c.animate([
      { scale: 0, offset: 0 },
      { scale: 0, offset: 17 / end, easing: first ? E(0.48, 0, 0.35, 0.82) : E(0.48, 0, 0.35, 0.72) },
      { scale: 1.02, offset: peak / end, easing: first ? E(0.23, -3.32, 0.55, 1) : E(0.23, -4.15, 0.55, 1) },
      { scale: 1, offset: 1 }
    ], { duration: end * k });
    // The label and remove button come with the avatar
    item.querySelectorAll(".bog-action-item__label, .bog-action-item__amount, .bog-action-item__remove").forEach(function (el) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 * k, delay: 17 * k, easing: E(0.33, 0, 0.67, 1), fill: "backwards" });
    });
  }

  function add(strip, item) {
    if (typeof item === "string") { var t = document.createElement("div"); t.innerHTML = item.trim(); item = t.firstElementChild; }
    var first = !strip.querySelector(".bog-action-item:not([data-leaving])");
    var k = slowOf(strip);
    strip.hidden = false;
    strip.appendChild(item);
    if (reduce()) { strip.scrollLeft = strip.scrollWidth; return item; }
    if (first) {
      // The strip opens: the content below moves down by its height + 7, then settles 7 back
      (strip._bogAnims || []).forEach(function (a) { a.cancel(); });
      // (padding animates too, so the strip really starts at 0)
      var h = strip.offsetHeight, cs = getComputedStyle(strip), pt = cs.paddingTop, pb = cs.paddingBottom;
      strip._bogAnims = [strip.animate([
        { height: "0px", paddingTop: "0px", paddingBottom: "0px", easing: E(0.33, 0, 0.08, 1) },
        { height: (h + 7) + "px", paddingTop: pt, paddingBottom: pb, offset: 133 / 233, easing: E(0.17, 0, 0, 1) },
        { height: h + "px", paddingTop: pt, paddingBottom: pb }
      ], { duration: 233 * k })];
    } else {
      // The row slides left to bring the new item into view
      var before = strip.scrollLeft;
      strip.scrollLeft = strip.scrollWidth;
      var d = strip.scrollLeft - before;
      if (d > 0) [].forEach.call(strip.children, function (el) {
        el.animate([{ translate: d + "px 0" }, { translate: "0 0" }], { duration: 200 * k, easing: E(0.33, 0, 0.25, 1) });
      });
    }
    popIn(item, first, k);
    return item;
  }

  function remove(item) {
    var strip = item.closest(".bog-selection");
    if (!strip || item.hasAttribute("data-leaving")) return;
    var k = slowOf(strip);
    var others = [].filter.call(strip.querySelectorAll(".bog-action-item"), function (el) { return el !== item && !el.hasAttribute("data-leaving"); });
    item.setAttribute("data-leaving", "");
    if (reduce()) { item.remove(); if (!others.length) strip.hidden = true; return; }

    // Shrink it away: 100% → 0 in 150 ms
    circleOf(item).animate([{ scale: 1 }, { scale: 0 }], { duration: 150 * k, easing: E(0.33, 0, 0.15, 1), fill: "forwards" });
    var fade = item.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 * k, easing: E(0.33, 0, 0.15, 1), fill: "forwards" });

    if (!others.length) {
      // Last one: the strip closes and the content below moves up by its height (200 ms after 15 ms)
      (strip._bogAnims || []).forEach(function (a) { a.cancel(); });
      var h = strip.offsetHeight, cs2 = getComputedStyle(strip);
      var close = strip.animate([{ height: h + "px", paddingTop: cs2.paddingTop, paddingBottom: cs2.paddingBottom }, { height: "0px", paddingTop: "0px", paddingBottom: "0px" }], { duration: 200 * k, delay: 15 * k, easing: E(0.33, 0, 0.01, 1), fill: "forwards" });
      strip._bogAnims = [close];
      close.finished.then(function () {
        item.remove();
        if (!strip.querySelector(".bog-action-item:not([data-leaving])")) strip.hidden = true;
        close.cancel();
      }, function () {});
      return;
    }
    // Take it out of the row where it stands; the others close the gap: 200 ms after 17 ms.
    // Any avatar that moves animates — in a scrolled row the browser may shift the earlier ones.
    var from = others.map(function (el) { return el.getBoundingClientRect().left; });
    var sr = strip.getBoundingClientRect(), ir = item.getBoundingClientRect();
    item.style.position = "absolute";
    item.style.left = (ir.left - sr.left + strip.scrollLeft) + "px";
    item.style.top = (ir.top - sr.top) + "px";
    others.forEach(function (el, i) {
      var dx = from[i] - el.getBoundingClientRect().left;
      if (dx) el.animate([{ translate: dx + "px 0" }, { translate: "0 0" }], { duration: 200 * k, delay: 17 * k, easing: E(0.33, 0, 0.07, 1), fill: "backwards" });
    });
    fade.finished.then(function () { item.remove(); }, function () {});
  }

  window.BOG = window.BOG || {};
  BOG.selectionAdd = add;
  BOG.selectionRemove = remove;
  document.querySelectorAll(".bog-selection").forEach(function (s) { if (!s.querySelector(".bog-action-item")) s.hidden = true; });
})();

/* ---- Checkbox: data-indeterminate attribute → indeterminate property;
   motion in and out of Indeterminate (BOG UI proposal — Radio Button speeds).
   Off ↔ On is plain CSS (checkbox.css). The dash grows out from its centre with the same
   overshoot as the check (333 ms); between dash and check the old mark shrinks away (150 ms)
   and the new one grows in. The check's path draws start → corner → end in 250 ms. Changing .indeterminate in code fires no event: call BOG.checkboxSync(). */
(function () {
  var SEL = ".bog-checkbox__input";
  document.querySelectorAll(SEL + "[data-indeterminate]").forEach(function (i) {
    i.indeterminate = true;
    i.removeAttribute("data-indeterminate");   // the property drives it from now on
  });

  var last = new WeakMap();
  function stateOf(i) { return i.indeterminate ? "ind" : i.checked ? "on" : "off"; }
  function snapshot() { document.querySelectorAll(SEL).forEach(function (i) { last.set(i, stateOf(i)); }); }

  var E = function (x1, y1, x2, y2) { return "cubic-bezier(" + [x1, y1, x2, y2].join(", ") + ")"; };
  var OUT = E(0.33, 0, 0.67, 1), POP = E(0.33, 0, 0, 1.7), PATH = E(0.33, 0, 0.13, 1);
  // Icons sit next to bog-ui.js (the page may live anywhere)
  var BASE = (document.currentScript && document.currentScript.src) || location.href;
  var icon = function (n) { return 'url("' + new URL("icons/" + n, BASE).href + '")'; };
  var SHAPE = {
    check: { top: "8.8px", height: "7px", url: icon("checkbox-check.svg") },
    dash:  { top: "11.3px", height: "1.43px", url: icon("checkbox-dash.svg") }
  };
  function shape(name, extra) {
    var s = SHAPE[name], f = { top: s.top, height: s.height, maskImage: s.url, webkitMaskImage: s.url };
    for (var k in extra) f[k] = extra[k];
    return f;
  }

  // Path draw for the check: a clip band that follows the tick's centre line — short leg
  // (start → corner) first, then the long leg (corner → end). Points in the 10×7 mark box.
  function poly(pts) { return "polygon(" + pts.map(function (p) { return p[0] + "px " + p[1] + "px"; }).join(", ") + ")"; }
  var LEG1 = 0.396;   // short leg / whole path length
  var DRAW = [
    { offset: 0,    clipPath: poly([[1.02, 1.28], [1.02, 1.28], [1.02, 1.28], [-0.82, 3.12], [-0.82, 3.12], [-0.82, 3.12]]) },
    { offset: LEG1, clipPath: poly([[1.02, 1.28], [3.96, 4.2], [4.88, 5.12], [3.04, 6.96], [3.04, 6.96], [-0.82, 3.12]]) },
    { offset: LEG1, clipPath: poly([[1.02, 1.28], [3.96, 4.2], [3.96, 4.2], [4.88, 6.96], [3.96, 7.88], [-0.82, 3.12]]) },
    { offset: 1,    clipPath: poly([[1.02, 1.28], [3.96, 4.2], [8.93, -0.77], [10.77, 1.07], [3.96, 7.88], [-0.82, 3.12]]) }
  ];

  function play(i, from, to) {
    var css = from === "on" && to === "off" || from === "off" && to === "on";   // scale runs in CSS
    (i._bogCheckboxAnims || []).forEach(function (a) { a.cancel(); });
    i._bogCheckboxAnims = null;
    i.removeAttribute("data-motion");
    if (to === "off" && from === "on") return;
    if (!i.animate || i.disabled) return;
    if (i.closest('[data-state="readonly"], [data-state="skeleton"]')) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!css) i.setAttribute("data-motion", "");   // the mark's CSS transitions off while this runs
    var k = parseFloat(getComputedStyle(i).getPropertyValue("--bog-checkbox-slow")) || 1;
    var P = "::before", anims = [], start = 0;
    // 1. The old mark (check or dash) shrinks away: 150 ms
    if (from !== "off") {
      var old = from === "ind" ? "dash" : "check";
      anims.push(i.animate([shape(old, { scale: old === "dash" ? "1 1" : "1" }), shape(old, { scale: old === "dash" ? "0 1" : "0" })],
        { duration: 150 * k, easing: OUT, pseudoElement: P }));
      start = 150;
    }
    // 2. The new mark grows in from `start`, 333 ms with overshoot (radio Select)
    if (to === "ind") {         // dash grows from its centre
      anims.push(i.animate([{ scale: "0 1" }, { scale: "1 1" }],
        { duration: 333 * k, delay: start * k, easing: POP, pseudoElement: P }));
    } else if (to === "on") {   // check grows from its centre (CSS from Off) while its path draws, 250 ms
      if (!css) anims.push(i.animate([{ scale: "0" }, { scale: "1" }], { duration: 333 * k, delay: start * k, easing: POP, pseudoElement: P }));
      anims.push(i.animate(DRAW, { duration: 250 * k, delay: start * k, easing: PATH, pseudoElement: P }));
    }
    i._bogCheckboxAnims = anims;
    Promise.all(anims.map(function (a) { return a.finished; })).then(function () {
      if (i._bogCheckboxAnims === anims) { i.removeAttribute("data-motion"); i._bogCheckboxAnims = null; }
    }, function () {});
  }

  // After any change (a tap, or a handler that sets other checkboxes), animate every checkbox
  // whose state moved in or out of Indeterminate. Listeners on the checkboxes run first.
  function sync(tapped) {
    document.querySelectorAll(SEL).forEach(function (i) {
      var was = last.get(i), now = stateOf(i);
      // Added after load: a tap flipped it from the other state
      if (!was && i === tapped) was = now === "on" ? "off" : "on";
      if (was && was !== now) play(i, was, now);
      last.set(i, now);
    });
  }
  document.addEventListener("change", function (e) { if (e.target.matches && e.target.matches(SEL)) sync(e.target); });
  window.BOG = window.BOG || {};
  BOG.checkboxSync = function () { sync(); };
  snapshot();
  window.addEventListener("load", snapshot);
})();

/* ---- Radio Button: unselect ------------------------------------------------
   Native radios can't be cleared. Here tapping (or Space on) the selected option clears it
   and fires "change"; the dot plays the Deselect motion in radio.css. Turn it off where an
   answer is required with data-deselectable="false" on the group, row or input. */
(function () {
  var SEL = ".bog-radio__input";
  function inputOf(t) {
    if (!t.closest) return null;
    if (t.matches(SEL)) return t;
    var row = t.closest(".bog-radio");
    return row ? row.querySelector(SEL) : null;
  }
  function on(i) {
    return i && !i.closest('[data-deselectable="false"]') && !i.disabled &&
      !i.closest('[data-state="readonly"], [data-state="skeleton"]');
  }
  var was = null;   // the input under the pointer / key, if it was already selected
  function mark(e) { var i = inputOf(e.target); was = on(i) && i.checked ? i : null; }
  document.addEventListener("pointerdown", mark, true);
  document.addEventListener("keydown", function (e) { if (e.key === " ") mark(e); }, true);
  document.addEventListener("click", function (e) {
    var i = inputOf(e.target);
    if (!i || i !== was || e.target.closest("a")) return;
    was = null;
    // The browser re-selects it during this click; clear it right after
    setTimeout(function () {
      if (!i.checked) return;
      i.checked = false;
      i.dispatchEvent(new Event("input", { bubbles: true }));
      i.dispatchEvent(new Event("change", { bubbles: true }));
    }, 0);
  });
})();

/* ---- Toggle Switch: data-indeterminate → indeterminate property; read-only can't change;
   motion to and from Indeterminate (Figma "Toggle (Off to Intermediate)" / "(Intermediate to On)").
   Off ↔ On is plain CSS (toggle.css). In and out of Indeterminate the circle squashes into the
   16×2 bar while it slides 11px, overshoots ~1px and settles — two steps, so it runs here. */
(function () {
  var SEL = ".bog-toggle__input";
  document.querySelectorAll(SEL + "[data-indeterminate]").forEach(function (i) {
    i.indeterminate = true;
    i.removeAttribute("data-indeterminate");   // the property drives it from now on
  });

  // A tap on a read-only switch (or anywhere on its row) is ignored
  document.addEventListener("click", function (e) {
    var row = e.target.closest && e.target.closest(".bog-toggle, " + SEL);
    if (!row) return;
    var input = row.matches(SEL) ? row : row.querySelector(SEL);
    if (input && input.closest('[data-state="readonly"], ' + SEL + '[data-state="readonly"]')) e.preventDefault();
  });

  var last = new WeakMap();
  function stateOf(i) { return i.indeterminate ? "ind" : i.checked ? "on" : "off"; }
  function snapshot() { document.querySelectorAll(SEL).forEach(function (i) { last.set(i, stateOf(i)); }); }

  // Circle centre X in the 44×24 track: off 12, indeterminate bar 22, on 32
  var E = function (x1, y1, x2, y2) { return "cubic-bezier(" + [x1, y1, x2, y2].join(", ") + ")"; };
  var MOVES = {
    // Off → Indeterminate: bg 0–100, size 0–200, X 33–233 (+11) then 233–383 (−1)
    "off>ind": { total: 383, x: [[0, 12], [33, 12, E(0.33, 0, 0.13, 1)], [233, 23, E(0.33, 0, 0, 1)], [383, 22]],
                 size: [200, [20, 20], [16, 2], E(0.33, 0, 0.05, 1)], bg: [100, E(0.33, 0, 0.67, 1)] },
    // Indeterminate → On: X 0–200 (+11) then 200–300 (−1), size 0–150, bg stays
    "ind>on":  { total: 300, x: [[0, 22, E(0.33, 0, 0.22, 1)], [200, 33, E(0.33, 0, 0.16, 1)], [300, 32]],
                 size: [150, [16, 2], [20, 20], E(0.17, 0, 0.67, 1)] },
    // Not in the guide — the same moves mirrored
    "ind>off": { total: 300, x: [[0, 22, E(0.33, 0, 0.22, 1)], [200, 11, E(0.33, 0, 0.16, 1)], [300, 12]],
                 size: [150, [16, 2], [20, 20], E(0.17, 0, 0.67, 1)], bg: [100, E(0.33, 0, 0.67, 1)] },
    "on>ind":  { total: 383, x: [[0, 32], [33, 32, E(0.33, 0, 0.13, 1)], [233, 21, E(0.33, 0, 0, 1)], [383, 22]],
                 size: [200, [20, 20], [16, 2], E(0.33, 0, 0.05, 1)] }
  };

  function play(i, from, to) {
    var m = MOVES[from + ">" + to];
    if (!m || !i.animate) return;
    if (i.closest('[data-state="readonly"], [data-state="skeleton"], ' + SEL + '[data-state]')) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    (i._bogToggleAnims || []).forEach(function (a) { a.cancel(); });
    i.setAttribute("data-motion", "");   // CSS transitions off while this runs
    var cs = getComputedStyle(i);
    var k = parseFloat(cs.getPropertyValue("--bog-toggle-slow")) || 1;
    var T = m.total * k, P = "::before";
    var anims = [
      // Centre the circle on (x, 12) for the whole move; x and size animate separately
      i.animate([{ top: "12px", translate: "-50% -50%" }, { top: "12px", translate: "-50% -50%" }], { duration: T, pseudoElement: P }),
      i.animate(m.x.map(function (s) {
        var f = { left: s[1] + "px", offset: s[0] / m.total };
        if (s[2]) f.easing = s[2];
        return f;
      }), { duration: T, pseudoElement: P }),
      i.animate([{ width: m.size[1][0] + "px", height: m.size[1][1] + "px" }, { width: m.size[2][0] + "px", height: m.size[2][1] + "px" }],
        { duration: m.size[0] * k, easing: m.size[3], pseudoElement: P })
    ];
    if (m.bg) {
      var off = cs.getPropertyValue("--_track").trim(), on = cs.getPropertyValue("--_on").trim();
      anims.push(i.animate([{ backgroundColor: to === "off" ? on : off }, { backgroundColor: to === "off" ? off : on }],
        { duration: m.bg[0] * k, easing: m.bg[1] }));
    }
    i._bogToggleAnims = anims;
    Promise.all(anims.map(function (a) { return a.finished; })).then(function () {
      if (i._bogToggleAnims === anims) { i.removeAttribute("data-motion"); i._bogToggleAnims = null; }
    }, function () {});
  }

  // After any change (a tap, or a handler that sets other switches), animate every switch
  // whose state moved in or out of Indeterminate. Listeners on the switches run first.
  function sync() {
    document.querySelectorAll(SEL).forEach(function (i) {
      var was = last.get(i), now = stateOf(i);
      if (was && was !== now) play(i, was, now);
      last.set(i, now);
    });
  }
  document.addEventListener("change", function (e) { if (e.target.matches && e.target.matches(SEL)) sync(); });
  // Changing .indeterminate in code fires no event: call BOG.toggleSync() afterwards
  window.BOG = window.BOG || {};
  BOG.toggleSync = sync;
  snapshot();
  window.addEventListener("load", snapshot);
})();

/* ---- Result Page: load-in motion (Figma "Result Pages" 417:443) -----------
   BOG.resultIn(page, { slow })  plays the recipe for the page's .bog-result:
     success      "Default - Result Page": the icon appears in the middle of the screen,
                  then rises to its spot (1167–2000 ms); the text blocks fade in and
                  rise 20/30 px from 1400 ms, 66.7 ms apart.
     pending      "Pending": icon scales in (0–500 ms), title / description from 100 / 200 ms.
     warning, info  no guide of their own — they use Pending.
     negative     "Error": Pending + the icon shakes on X (+10, −20, +15, −5 px).
     custom       "Result - Card": the card visual drops in with a 3D flip, text from 500 ms.
   Any number of blocks works: each next block starts one step later.
   <section class="bog-result-page" data-animate> plays it on load. */
(function () {
  var E = function (a, b, c, d) { return "cubic-bezier(" + [a, b, c, d].join(", ") + ")"; };
  var RECIPES = {
    success:  { start: 1400, step: 66.7, dur: 500, fade: 500, ease: E(0.45, 0, 0.10, 1), rise: [20, 20, 30] },
    pending:  { start: 100,  step: 100,  dur: 500, fade: 500, ease: E(0.29, 0, 0.01, 1), rise: [20, 20, 20] },
    custom:   { start: 500,  step: 67,   dur: 500, fade: 333, ease: E(0.29, 0, 0.01, 1), rise: [20, 20, 30] }
  };
  function blocks(r) {
    var out = [];
    [".bog-result__title", ".bog-result__desc", ".bog-result__amount-title", ".bog-result__amount .bog-amount",
     ".bog-result__support", ".bog-result__action", ".bog-result__extra"].forEach(function (s) {
      r.querySelectorAll(s).forEach(function (el) { out.push(el); });
    });
    return out;
  }
  function resultIn(page, opts) {
    var r = page && (page.matches(".bog-result") ? page : page.querySelector(".bog-result"));
    if (!r || !r.animate) return [];
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return [];
    var k = (opts && opts.slow) || 1;
    (r._bogResultAnims || []).forEach(function (a) { a.cancel(); });
    var status = r.getAttribute("data-status") || "success";
    var rec = RECIPES[status] || RECIPES.pending;
    var anims = [], T = function (ms) { return ms * k; };
    var play = function (el, frames, o) { o.duration = T(o.duration); o.delay = T(o.delay || 0); o.fill = o.fill || "backwards"; anims.push(el.animate(frames, o)); };

    // Text blocks: fade in and rise, one step apart
    blocks(r).forEach(function (el, i) {
      var y = rec.rise[Math.min(i, rec.rise.length - 1)], d = rec.start + i * rec.step;
      play(el, [{ translate: "0 " + y + "px" }, { translate: "0 0" }], { duration: rec.dur, delay: d, easing: rec.ease });
      play(el, [{ opacity: 0 }, { opacity: 1 }], { duration: rec.fade, delay: d, easing: rec.ease });
    });

    var icon = r.querySelector(".bog-result__icon");
    var visual = r.querySelector(".bog-result__visual > *");
    if (status === "custom" && visual) {
      // Card: drops 85 px into place, flips up from −72° (X) and −90° (Z), scale 68% → 111% → 100%
      r.querySelector(".bog-result__visual").style.perspective = "800px";
      play(visual, [{ translate: "0 -85.28px" }, { translate: "0 0" }], { duration: 1000, easing: E(0.33, 0, 0.14, 1) });
      play(visual, [{ transform: "rotateX(-72deg)" }, { transform: "rotateX(0deg)" }], { duration: 1000, easing: E(0.33, 0, 0.27, 1) });
      anims.push(visual.animate([{ transform: "rotateZ(-90deg)" }, { transform: "rotateZ(0deg)" }], { duration: T(750), easing: E(0.33, 0, 0.21, 1), composite: "add", fill: "backwards" }));
      play(visual, [{ scale: 0.677, easing: E(0.33, 0, 0.21, 1) }, { scale: 1.108, offset: 0.5, easing: E(0.17, 0, 0.21, 1) }, { scale: 1 }], { duration: 1000 });
    } else if (icon) {
      // Icon (stands in for the Lottie): scales in, 500 ms
      play(icon, [{ scale: 0 }, { scale: 1 }], { duration: 500, easing: E(0.29, 0, 0.01, 1) });
      if (status === "success") {
        // …in the middle of the screen, then rises to its spot (Lottie Position 1167–2000 ms)
        var pr = page.getBoundingClientRect(), ir = icon.getBoundingClientRect();
        var dy = (pr.top + pr.height / 2) - (ir.top + ir.height / 2);
        play(icon, [{ translate: "0 " + dy + "px", offset: 0 }, { translate: "0 " + dy + "px", offset: 1167 / 2000, easing: E(0.33, 0, 0, 1) }, { translate: "0 0" }], { duration: 2000 });
      }
      if (status === "negative") {
        // Error shake: +10, −20, +15, −5 px from 250 ms (100 ms each)
        var S = E(0.33, 0, 0, 1);
        play(icon, [
          { translate: "0 0", offset: 0, easing: S }, { translate: "10px 0", offset: 100 / 402, easing: S },
          { translate: "-10px 0", offset: 200 / 402 }, { translate: "-10px 0", offset: 202 / 402, easing: S },
          { translate: "5px 0", offset: 302 / 402, easing: E(0.17, 0, 0.83, 1) }, { translate: "0 0", offset: 1 }
        ], { duration: 402, delay: 250, fill: "none" });
      }
    }
    r._bogResultAnims = anims;
    return anims;
  }
  window.BOG = window.BOG || {};
  BOG.resultIn = resultIn;
  document.querySelectorAll(".bog-result-page[data-animate]").forEach(function (p) { resultIn(p); });
})();

/* ---- Chips: toggle aria-pressed on filter / icon chips -------------------- */
(function () {
  document.addEventListener("click", function (e) {
    var chip = e.target.closest(".bog-chip[aria-pressed]");
    if (!chip || chip.disabled || chip.closest(".bog-picker__chips")) return;
    chip.setAttribute("aria-pressed", chip.getAttribute("aria-pressed") === "true" ? "false" : "true");
  });
})();

/* ---- Feedback: close button + BOG.toast() --------------------------------- */
(function () {
  function dismiss(el) {
    if (el.parentElement && el.parentElement.classList.contains("bog-toast-region")) {
      if (el.hasAttribute("data-leaving")) return;
      el.setAttribute("data-leaving", "");           // toast: slides back out (see feedback.css), removed when it's done
      var out = el.getAnimations ? el.getAnimations()[0] : null;
      if (out) out.finished.then(function () { el.remove(); }, function () {}); else setTimeout(function () { el.remove(); }, 250);
      return;
    }
    el.setAttribute("data-removing", "");
    setTimeout(function () { el.remove(); }, 180);
  }
  document.addEventListener("click", function (e) {
    var close = e.target.closest(".bog-feedback__close");
    if (close) dismiss(close.closest(".bog-feedback"));
  });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  // BOG.toast({ status, title, text, actions: [{label, type}], timeout (default 3000 ms), position: "top"|"bottom", host })
  function toast(o) {
    o = o || {};
    var host = o.host || document.querySelector(".bog-sheet-host") || document.body;
    var pos = o.position || "top";
    var region = host.querySelector(':scope > .bog-toast-region[data-position="' + pos + '"]');
    if (!region) {
      region = document.createElement("div");
      region.className = "bog-toast-region";
      region.setAttribute("data-position", pos);
      host.appendChild(region);
    }
    var el = document.createElement("div");
    el.className = "bog-feedback";
    el.setAttribute("role", "status");
    el.setAttribute("data-status", o.status || "neutral");
    if (o.appearance) el.setAttribute("data-appearance", o.appearance);
    el.innerHTML = (o.status === "neutral" || !o.status ? '<span class="bog-icon"></span>' : "") +
      '<div class="bog-feedback__text">' + (o.title ? '<p class="bog-feedback__title">' + esc(o.title) + "</p>" : "") +
      '<p class="bog-feedback__desc">' + esc(o.text || "") + "</p></div>" +
      '<button type="button" class="bog-feedback__close" aria-label="Close"></button>' +
      (o.actions && o.actions.length ? '<div class="bog-feedback__actions">' + o.actions.map(function (a) {
        return '<button type="button" class="bog-btn" data-size="small" data-type="' + (a.type || "primary") + '">' + esc(a.label) + "</button>";
      }).join("") + "</div>" : "");
    region.appendChild(el);
    // visible ~3 s after it has settled (the enter animation is 500ms)
    if (o.timeout !== 0) {
      var wait = function () { setTimeout(function () { if (el.isConnected) dismiss(el); }, o.timeout || 3000); };
      var enter = el.getAnimations ? el.getAnimations()[0] : null;
      if (enter) enter.finished.then(wait, function () {}); else setTimeout(wait, 500);
    }
    return el;
  }
  window.BOG = window.BOG || {};
  window.BOG.toast = toast;
})();

/* ---- Currency Input: pick a currency from its bottom sheet ---------------- */
(function () {
  document.addEventListener("click", function (e) {
    var item = e.target.closest(".bog-list-item[data-currency]");
    if (!item) return;
    var sheet = item.closest(".bog-sheet");
    var btn = sheet && sheet._opener && sheet._opener.closest && sheet._opener.closest(".bog-currency-input__currency");
    if (!btn) return;
    var code = item.getAttribute("data-currency");
    var flag = item.getAttribute("data-flag");
    var img = btn.querySelector("img");
    if (img && flag) img.src = flag;
    Array.prototype.forEach.call(btn.childNodes, function (n) { if (n.nodeType === 3 && n.textContent.trim()) n.textContent = code; });
    var field = btn.closest(".bog-currency-input");
    var sym = field && field.querySelector(".bog-currency-input__symbol");
    if (sym && item.hasAttribute("data-symbol")) sym.textContent = item.getAttribute("data-symbol");
    sheet.querySelectorAll(".bog-list-item[data-currency]").forEach(function (i) { i.setAttribute("aria-selected", i === item ? "true" : "false"); });
    if (field) field.dispatchEvent(new CustomEvent("currencychange", { bubbles: true, detail: { currency: code } }));
    setTimeout(function () { if (window.BOG && BOG.closeSheet) BOG.closeSheet(sheet); }, 120);
  });
})();

/* ---- Currency Input: size the amount to its text where field-sizing isn't supported */
(function () {
  if (window.CSS && CSS.supports && CSS.supports("field-sizing", "content")) return;
  var canvas = document.createElement("canvas").getContext("2d");
  function fit(input) {
    var cs = getComputedStyle(input);
    canvas.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    input.style.width = Math.ceil(canvas.measureText(input.value || input.placeholder || "").width + 2) + "px";
  }
  function all() { document.querySelectorAll(".bog-currency-input__value > .bog-field__input").forEach(fit); }
  document.addEventListener("input", function (e) { if (e.target.matches && e.target.matches(".bog-currency-input__value > .bog-field__input")) fit(e.target); });
  document.addEventListener("focusin", function (e) { if (e.target.matches && e.target.matches(".bog-currency-input__value > .bog-field__input")) fit(e.target); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(all); else all();
})();

/* ---- Number Input: − / + stepper -------------------------------------- */
(function () {
  function sync(field) {
    var input = field.querySelector(".bog-field__input");
    if (!input) return;
    var v = parseFloat(input.value), min = parseFloat(input.dataset.min), max = parseFloat(input.dataset.max);
    var down = field.querySelector('[data-step="down"]'), up = field.querySelector('[data-step="up"]');
    var off = input.disabled;
    if (down) down.disabled = off || (!isNaN(min) && !isNaN(v) && v <= min);
    if (up) up.disabled = off || (!isNaN(max) && !isNaN(v) && v >= max);
  }
  // Value roll (Component Motion Guidelines › Numeric Stepper, see number-input.css).
  // dir 1 (+) moves the digits down, -1 (−) moves them up.
  var EASE = "cubic-bezier(0.33, 0, 0.25, 1)", SHIFT = 3.75, MOVE = 167, FADE = 83, DELAY = 33;
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function roll(field, input, from, to, dir) {
    // A tap during a roll replaces it. Show the input text again first, so the new layer
    // copies its real color instead of the transparent one used while rolling.
    var prev = field.querySelector(".bog-number-input__roll");
    if (prev) prev.remove();
    field.removeAttribute("data-rolling");
    if ((reduce && reduce.matches) || !input.animate) return;
    var cs = getComputedStyle(input), layer = document.createElement("span");
    layer.className = "bog-number-input__roll";
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = "top:" + input.offsetTop + "px;left:" + input.offsetLeft + "px;width:" + input.offsetWidth +
      "px;height:" + cs.lineHeight + ";font:" + cs.font + ";letter-spacing:" + cs.letterSpacing + ";color:" + cs.color + ";text-align:" + cs.textAlign;
    // Only digits that differ at the same position roll (12 → 13 rolls just the "3").
    // Each layer holds the whole number with the other digits hidden, so everything stays aligned.
    function piece(text, other, same) {
      var s = document.createElement("span");
      for (var i = 0; i < text.length; i++) {
        var c = document.createElement("span");
        c.textContent = text[i];
        if ((text[i] === other[i]) !== same) c.style.visibility = "hidden";
        s.appendChild(c);
      }
      layer.appendChild(s);
      return s;
    }
    function move(a, b) { return { transform: ["translateY(" + a + "px)", "translateY(" + b + "px)"] }; }
    piece(to, from, true);
    var out = piece(from, to, false), inn = piece(to, from, false), d = dir * SHIFT;
    input.parentNode.appendChild(layer);
    field.setAttribute("data-rolling", "");
    out.animate(move(0, d), { duration: MOVE, easing: EASE, fill: "forwards" });
    out.animate({ opacity: [1, 0] }, { duration: FADE, easing: EASE, fill: "forwards" });
    inn.animate({ opacity: [0, 1] }, { duration: FADE, delay: DELAY, easing: EASE, fill: "backwards" });
    inn.animate(move(-d, 0), { duration: MOVE, delay: DELAY, easing: EASE, fill: "backwards" }).onfinish = function () {
      if (!layer.isConnected) return;
      layer.remove();
      field.removeAttribute("data-rolling");
    };
  }
  // Button press (Numeric Stepper "made with Scale", 362:9475): 100% → 90% in 167ms, then back to 100%
  // in 167ms with a slight overshoot.
  var PRESS = "cubic-bezier(0.33, 0, 0.25, 1)", RELEASE = "cubic-bezier(0.44, 0, 0.30, 2.08)";
  function bump(btn) {
    if ((reduce && reduce.matches) || !btn.animate) return;
    btn.animate([
      { transform: "scale(1)", easing: PRESS },
      { transform: "scale(0.9)", easing: RELEASE },
      { transform: "scale(1)" }
    ], { duration: 2 * MOVE });
  }
  document.addEventListener("mousedown", function (e) { if (e.target.closest(".bog-number-input [data-step]")) e.preventDefault(); });
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".bog-number-input [data-step]");
    if (!btn) return;
    e.preventDefault();
    var field = btn.closest(".bog-number-input"), input = field.querySelector(".bog-field__input");
    bump(btn);
    var step = parseFloat(input.dataset.step) || 1, min = parseFloat(input.dataset.min), max = parseFloat(input.dataset.max);
    var v = (parseFloat(input.value) || 0) + (btn.dataset.step === "up" ? step : -step);
    if (!isNaN(min)) v = Math.max(min, v);
    if (!isNaN(max)) v = Math.min(max, v);
    var from = input.value, to = String(Math.round(v * 1e6) / 1e6);
    input.value = to;
    if (from !== "" && from !== to) roll(field, input, from, to, btn.dataset.step === "up" ? 1 : -1);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  document.addEventListener("input", function (e) { var f = e.target.closest && e.target.closest(".bog-number-input"); if (f) sync(f); });
  function all() { document.querySelectorAll(".bog-number-input").forEach(sync); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", all); else all();
})();

/* ---- Password Input: show / hide + live requirements ------------------- */
(function () {
  document.addEventListener("mousedown", function (e) { if (e.target.closest(".bog-password-input__toggle")) e.preventDefault(); });
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".bog-password-input__toggle");
    if (!btn) return;
    e.preventDefault();
    var input = btn.closest(".bog-password-input").querySelector(".bog-field__input");
    var show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.setAttribute("aria-pressed", show ? "true" : "false");
    btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
  function check(input, final) {
    if (!input.id) return;
    document.querySelectorAll('.bog-password-rules[data-for="' + input.id + '"] [data-pattern]').forEach(function (item) {
      var ok = new RegExp(item.getAttribute("data-pattern")).test(input.value);
      if (ok) item.setAttribute("data-status", "positive");
      else if (final && input.value) item.setAttribute("data-status", "negative");
      else item.removeAttribute("data-status");
    });
  }
  document.addEventListener("input", function (e) { if (e.target.matches && e.target.matches(".bog-field__input")) check(e.target, false); });
  document.addEventListener("focusout", function (e) { if (e.target.matches && e.target.matches(".bog-field__input")) check(e.target, true); });
})();

/* ---- Phone Input: country picker sheet --------------------------------
   Tapping .bog-phone-input__country opens a built-in Bottom Sheet of countries (flag, name, code).
   Give the button data-sheet-open="your-sheet-id" to use your own sheet instead
   (rows: .bog-list-item with data-dial and data-flag). Change the list with BOG.countries. */
(function () {
  var script = document.currentScript;
  var base = script && script.src ? script.src.replace(/[^\/]*$/, "") : "bog-ui/";
  window.BOG = window.BOG || {};
  // [ISO code (flag file in assets/flags/), name, dial code, number format (X = digit)]
  BOG.countries = BOG.countries || [
    ["ge", "Georgia", "+995", "XXX XX XX XX"],
    ["am", "Armenia", "+374", "XX XXX XXX"],
    ["az", "Azerbaijan", "+994", "XX XXX XX XX"],
    ["fr", "France", "+33", "X XX XX XX XX"],
    ["de", "Germany", "+49", "XXX XXXXXXXX"],
    ["gr", "Greece", "+30", "XXX XXX XXXX"],
    ["il", "Israel", "+972", "XX XXX XXXX"],
    ["it", "Italy", "+39", "XXX XXX XXXX"],
    ["ru", "Russia", "+7", "XXX XXX XX XX"],
    ["tj", "Tajikistan", "+992", "XX XXX XXXX"],
    ["tr", "Turkey", "+90", "XXX XXX XX XX"],
    ["ua", "Ukraine", "+380", "XX XXX XX XX"],
    ["ae", "United Arab Emirates", "+971", "XX XXX XXXX"],
    ["gb", "United Kingdom", "+44", "XXXX XXXXXX"],
    ["us", "United States", "+1", "(XXX) XXX-XXXX"],
    ["uz", "Uzbekistan", "+998", "XX XXX XX XX"]
  ];
  function flagSrc(iso) { return base + "assets/flags/" + iso + ".svg"; }

  function builtInSheet() {
    var sheet = document.getElementById("bog-country-sheet");
    if (sheet) return sheet;
    sheet = document.createElement("div");
    sheet.className = "bog-sheet";
    sheet.id = "bog-country-sheet";
    sheet.hidden = true;
    sheet.innerHTML = '<div class="bog-sheet__panel" role="dialog" aria-modal="true" aria-label="Country code">' +
      '<header class="bog-sheet__nav"><div class="bog-sheet__heading"><h2 class="bog-sheet__title">Country code</h2></div></header>' +
      '<div class="bog-sheet__content" data-type="list"><div class="bog-list" role="listbox">' +
      BOG.countries.map(function (c) {
        return '<button type="button" class="bog-list-item" role="option" data-dial="' + c[2] + '" data-flag="' + flagSrc(c[0]) + '" aria-selected="false">' +
          '<span class="bog-flag" data-size="32"><img src="' + flagSrc(c[0]) + '" alt=""></span>' +
          '<span class="bog-list-item__content"><span class="bog-list-item__label">' + c[1] + '</span></span>' +
          '<span class="bog-list-item__end"><span class="bog-list-item__value">' + c[2] + '</span></span></button>';
      }).join("") + "</div></div></div>";
    return sheet;
  }

  // Open the built-in sheet (capture phase, so it runs before the generic sheet handlers)
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".bog-phone-input__country");
    if (!btn || btn.hasAttribute("data-sheet-open")) return;
    e.preventDefault();
    var sheet = builtInSheet();
    var host = btn.closest(".bog-sheet-host") || document.body;
    if (sheet.parentNode !== host) host.appendChild(sheet);
    var code = btn.querySelector(".bog-phone-input__code");
    var current = code ? code.textContent.trim() : "";
    var img = btn.querySelector(".bog-flag img");
    var currentFlag = img ? img.getAttribute("src").split("/").pop() : "";
    sheet.querySelectorAll(".bog-list-item[data-dial]").forEach(function (i) {
      var same = i.getAttribute("data-dial") === current && (!currentFlag || i.getAttribute("data-flag").split("/").pop() === currentFlag);
      i.setAttribute("aria-selected", same ? "true" : "false");
    });
    if (BOG.openSheet) BOG.openSheet(sheet, btn);
  });

  // ---- Number formatting by country ----
  // International: the format comes from the selected country. National: data-format on .bog-phone-input
  // (default Georgia). The placeholder shows the format; digits beyond it are dropped.
  var DEFAULT_FORMAT = "XXX XX XX XX";
  function countryOf(field) {
    var btn = field.querySelector(".bog-phone-input__country");
    if (!btn) return null;
    var img = btn.querySelector(".bog-flag img");
    var iso = img ? (img.getAttribute("src") || "").split("/").pop().replace(/\.svg.*$/, "") : "";
    var code = btn.querySelector(".bog-phone-input__code");
    var dial = code ? code.textContent.trim() : "";
    return BOG.countries.filter(function (c) { return c[0] === iso; })[0] ||
           BOG.countries.filter(function (c) { return c[2] === dial; })[0] || null;
  }
  function formatOf(field) {
    var c = countryOf(field);
    return (c && c[3]) || field.getAttribute("data-format") || DEFAULT_FORMAT;
  }
  function applyFormat(digits, format) {
    var out = "", d = 0;
    for (var i = 0; i < format.length && d < digits.length; i++) {
      if (format[i] === "X") out += digits[d++];
      else out += format[i];
    }
    return out;
  }
  function formatField(field, keepCaret) {
    var input = field.querySelector(".bog-field__input");
    if (!input) return;
    var format = formatOf(field);
    var max = (format.match(/X/g) || []).length;
    if (input.placeholder !== format) input.placeholder = format;
    var caret = keepCaret && input === document.activeElement ? input.selectionStart : null;
    var digitsBefore = caret == null ? 0 : input.value.slice(0, caret).replace(/\D/g, "").length;
    var digits = input.value.replace(/\D/g, "").slice(0, max);
    var next = applyFormat(digits, format);
    if (next === input.value) return;
    input.value = next;
    if (caret != null) {
      var pos = 0, seen = 0;
      while (pos < next.length && seen < digitsBefore) { if (/\d/.test(next[pos])) seen++; pos++; }
      input.setSelectionRange(pos, pos);
    }
  }
  BOG.formatPhone = formatField;
  document.addEventListener("input", function (e) {
    var field = e.target.closest && e.target.closest(".bog-phone-input");
    if (field && e.target.matches(".bog-field__input")) formatField(field, true);
  });
  document.addEventListener("countrychange", function (e) {
    if (e.target.matches && e.target.matches(".bog-phone-input")) formatField(e.target, false);
  });
  // Number side: digits-only keyboard on phones (iOS/Android number pad), whatever the markup says
  function numericKeyboard(field) {
    var input = field.querySelector(".bog-field__input");
    if (!input) return;
    if (input.getAttribute("inputmode") !== "numeric") input.setAttribute("inputmode", "numeric");
    if (!input.hasAttribute("autocomplete")) input.setAttribute("autocomplete", "tel-national");
  }
  // Country side: never focuses the number input; closes the keyboard if it's open, then the sheet opens
  function countryPress(e) {
    var btn = e.target.closest && e.target.closest(".bog-phone-input__country");
    if (!btn) return;
    e.preventDefault();                       // keep the tap from focusing the input (no keyboard)
    var input = btn.closest(".bog-phone-input").querySelector(".bog-field__input");
    if (input && document.activeElement === input) input.blur();
  }
  // The field is a <label> and its first control is the country button, so the browser would
  // forward every tap on the number side to the button (opening the sheet). Send it to the input.
  document.addEventListener("click", function (e) {
    var box = e.target.closest && e.target.closest(".bog-phone-input .bog-field__box");
    if (!box || e.target.closest(".bog-phone-input__country, .bog-field__clear, .bog-field__input")) return;
    var input = box.querySelector(".bog-field__input");
    if (!input || input.disabled) return;
    e.preventDefault();                       // no label activation of the country button
    input.focus();                            // inside the tap, so phones open the (numeric) keyboard
  }, true);
  document.addEventListener("pointerdown", countryPress, true);
  document.addEventListener("mousedown", countryPress, true);
  document.addEventListener("focusin", function (e) {
    var field = e.target.closest && e.target.closest(".bog-phone-input");
    if (field) numericKeyboard(field);
  });
  function formatAll() { document.querySelectorAll(".bog-phone-input").forEach(function (f) { numericKeyboard(f); formatField(f, false); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", formatAll); else formatAll();

  // Picking a row sets the flag + code on the button that opened the sheet
  document.addEventListener("click", function (e) {
    var item = e.target.closest(".bog-list-item[data-dial]");
    if (!item) return;
    var sheet = item.closest(".bog-sheet");
    var btn = sheet && sheet._opener && sheet._opener.closest && sheet._opener.closest(".bog-phone-input__country");
    if (!btn) return;
    var img = btn.querySelector(".bog-flag img"), flag = item.getAttribute("data-flag");
    if (img && flag) img.src = flag;
    var code = btn.querySelector(".bog-phone-input__code");
    if (code) code.textContent = item.getAttribute("data-dial");
    sheet.querySelectorAll(".bog-list-item[data-dial]").forEach(function (i) { i.setAttribute("aria-selected", i === item ? "true" : "false"); });
    var field = btn.closest(".bog-phone-input");
    var label = item.querySelector(".bog-list-item__label");
    if (field) field.dispatchEvent(new CustomEvent("countrychange", { bubbles: true, detail: { dial: item.getAttribute("data-dial"), country: label ? label.textContent : "" } }));
    setTimeout(function () { if (BOG.closeSheet) BOG.closeSheet(sheet); }, 120);
  });
})();

/* ---- Modal Dialog ------------------------------------------------------ */
(function () {
  function resolve(m) { return typeof m === "string" ? document.getElementById(m) : m; }
  // Modals opened by openModal, newest last. Escape closes the newest; static mockups that are
  // only marked data-open in the HTML aren't in here, so it leaves them alone.
  var stack = [];
  function openModal(modal, opener) {
    modal = resolve(modal);
    if (!modal || modal.hasAttribute("data-open")) return;
    modal._opener = opener || document.activeElement;
    modal._closing = null;
    if (modal.hidden) { modal.hidden = false; modal.getBoundingClientRect(); }
    // Reopened while closing: swap the state in one go so it animates back from where it is
    modal.removeAttribute("data-closing");
    modal.setAttribute("data-open", "");
    stack.push(modal);
    var dialog = modal.querySelector(".bog-modal__dialog");
    if (dialog) { if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex", "-1"); setTimeout(function () { dialog.focus({ preventScroll: true }); }, 50); }
  }
  function closeModal(modal) {
    modal = resolve(modal) || document.querySelector(".bog-modal[data-open]");
    if (!modal || !modal.hasAttribute("data-open")) return;
    // Close motion (modal.css) runs while data-closing is set; hide once the overlay and dialog
    // transitions are done (none under reduced motion, so it hides right away).
    modal.removeAttribute("data-open");
    modal.setAttribute("data-closing", "");
    stack = stack.filter(function (m) { return m !== modal; });
    var token = modal._closing = {}, dialog = modal.querySelector(".bog-modal__dialog");
    var anims = modal.getAnimations ? modal.getAnimations().concat(dialog ? dialog.getAnimations() : []) : [];
    Promise.all(anims.map(function (a) { return a.finished.catch(function () {}); })).then(function () {
      if (modal._closing !== token || modal.hasAttribute("data-open")) return;
      modal.hidden = true;
      modal.removeAttribute("data-closing");
    });
    if (modal._opener && modal._opener.focus) modal._opener.focus({ preventScroll: true });
    modal.dispatchEvent(new CustomEvent("modalclose", { bubbles: true }));
  }
  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-modal-open]");
    if (opener) { e.preventDefault(); openModal(opener.getAttribute("data-modal-open"), opener); return; }
    var closer = e.target.closest("[data-modal-close]");
    if (closer && closer.closest(".bog-modal")) { closeModal(closer.closest(".bog-modal")); return; }
    if (e.target.classList && e.target.classList.contains("bog-modal") && e.target.getAttribute("data-dismiss") !== "false") closeModal(e.target);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (stack.length) closeModal(stack[stack.length - 1]);
  });
  window.BOG = window.BOG || {};
  window.BOG.openModal = openModal;
  window.BOG.closeModal = closeModal;
})();

/* ---- Code Input + Keypad ---------------------------------------------------
   .bog-code shows a code in cells; with a .bog-code__input it follows the phone
   keyboard (and SMS autofill), with a .bog-keypad[data-for] it follows the keypad.
   Fires "codechange" and "codecomplete" (detail.value) on the .bog-code. */
(function () {
  function cells(el) { return el.querySelectorAll(".bog-code__cell"); }
  function render(el, value) {
    var c = cells(el), masked = el.hasAttribute("data-mask");
    c.forEach(function (cell, i) {
      var d = value.charAt(i);
      cell.textContent = d && !masked ? d : "";
      cell.toggleAttribute("data-filled", !!d);
      cell.toggleAttribute("data-active", i === Math.min(value.length, c.length - 1) && value.length < c.length);
    });
  }
  function setCode(el, value) {
    if (typeof el === "string") el = document.getElementById(el);
    if (!el) return;
    var max = cells(el).length;
    value = String(value || "").replace(/\D/g, "").slice(0, max);
    var prev = el._code || "";
    el._code = value;
    var input = el.querySelector(".bog-code__input");
    if (input && input.value !== value) input.value = value;
    if (value.length > prev.length) el.removeAttribute("data-validation");
    render(el, value);
    if (value !== prev) {
      el.dispatchEvent(new CustomEvent("codechange", { bubbles: true, detail: { value: value } }));
      if (value.length === max) el.dispatchEvent(new CustomEvent("codecomplete", { bubbles: true, detail: { value: value } }));
    }
  }
  document.querySelectorAll(".bog-code").forEach(function (el) { el._code = ""; render(el, ""); });
  document.addEventListener("input", function (e) {
    if (e.target.matches(".bog-code__input")) setCode(e.target.closest(".bog-code"), e.target.value);
  });

  function press(pad, key) {
    var el = document.getElementById(pad.getAttribute("data-for"));
    if (!el || el.getAttribute("data-state") === "loading") return;
    var v = el._code || "";
    setCode(el, key === "back" ? v.slice(0, -1) : v + key);
  }
  document.addEventListener("click", function (e) {
    var key = e.target.closest(".bog-keypad__key[data-key]");
    if (key) press(key.closest(".bog-keypad"), key.getAttribute("data-key"));
  });
  // Desktop: number keys and Backspace type into the visible keypad
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.matches("input, textarea")) return;
    var key = /^[0-9]$/.test(e.key) ? e.key : e.key === "Backspace" ? "back" : null;
    if (!key) return;
    var pad = Array.prototype.find.call(document.querySelectorAll(".bog-keypad"), function (p) { return p.offsetParent !== null && !p.closest("[inert]"); });
    if (pad) { e.preventDefault(); press(pad, key); }
  });

  window.BOG = window.BOG || {};
  window.BOG.setCode = setCode;
})();

/* ---- OTP Verification -----------------------------------------------------
   .bog-otp[data-timer="35"] counts down in .bog-otp__time, then switches to
   data-state="resend". Resend fires "otpresend" and restarts the timer.
   Typing all digits fires "otpcomplete" (detail.value). */
(function () {
  function fmt(s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }

  function setOtpState(el, state) {
    if (typeof el === "string") el = document.getElementById(el);
    if (!el) return;
    if (!state || state === "default") el.removeAttribute("data-state"); else el.setAttribute("data-state", state);
    var off = state === "loading";
    el.querySelectorAll(".bog-field__input, .bog-radio__input, .bog-otp__resend").forEach(function (c) { c.disabled = off; });
  }

  function startTimer(el) {
    var total = parseInt(el.getAttribute("data-timer"), 10);
    if (!total) return;
    clearInterval(el._otpTimer);
    var left = total, time = el.querySelector(".bog-otp__time"), timer = el.querySelector(".bog-otp__timer");
    if (timer) timer.hidden = false;
    if (time) time.textContent = fmt(left);
    el._otpTimer = setInterval(function () {
      left -= 1;
      if (time) time.textContent = fmt(Math.max(left, 0));
      if (left <= 0) {
        clearInterval(el._otpTimer);
        if (timer) timer.hidden = true;
        if (!el.getAttribute("data-state")) setOtpState(el, "resend");
      }
    }, 1000);
  }

  function init() {
    document.querySelectorAll(".bog-otp").forEach(function (el) {
      if (el._otpReady) return;
      el._otpReady = true;
      setOtpState(el, el.getAttribute("data-state"));
      startTimer(el);
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".bog-otp__resend");
    if (!btn) return;
    var el = btn.closest(".bog-otp");
    var input = el.querySelector(".bog-field__input");
    if (input) { input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true })); }
    setOtpState(el, "default");
    startTimer(el);
    el.dispatchEvent(new CustomEvent("otpresend", { bubbles: true }));
  });

  document.addEventListener("input", function (e) {
    var input = e.target.closest(".bog-otp .bog-field__input");
    if (!input) return;
    var max = parseInt(input.getAttribute("maxlength"), 10) || 4;
    var v = input.value.replace(/\D/g, "").slice(0, max);
    if (v !== input.value) input.value = v;
    if (v.length === max) input.closest(".bog-otp").dispatchEvent(new CustomEvent("otpcomplete", { bubbles: true, detail: { value: v } }));
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  window.BOG = window.BOG || {};
  window.BOG.setOtpState = setOtpState;
  window.BOG.initOtp = init;
  window.BOG.startOtpTimer = function (el) { if (typeof el === "string") el = document.getElementById(el); if (el) startTimer(el); };
})();

/* ---- Menu (pill trigger + iOS pull-down) -----------------------------------
   Tap the trigger to open; picking a row moves the checkmark, updates the trigger
   text and fires "menuchange" (detail.value, detail.label) on the .bog-menu. */
(function () {
  function close(menu) {
    if (!menu || !menu.hasAttribute("data-open")) return;
    menu.removeAttribute("data-open");
    var t = menu.querySelector(".bog-menu__trigger"); if (t) t.setAttribute("aria-expanded", "false");
  }
  function closeAll(except) { document.querySelectorAll(".bog-menu[data-open]").forEach(function (m) { if (m !== except) close(m); }); }
  function select(menu, value) {
    var item = menu.querySelector('.bog-menu__item[data-value="' + value + '"]');
    if (!item) return;
    menu.querySelectorAll(".bog-menu__item").forEach(function (i) { i.setAttribute("aria-checked", i === item ? "true" : "false"); });
    var v = menu.querySelector(".bog-menu__value"); if (v) v.textContent = item.getAttribute("data-label") || item.textContent.trim();
  }
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".bog-menu__trigger");
    var item = e.target.closest(".bog-menu__item");
    if (trigger) {
      var menu = trigger.closest(".bog-menu"), open = !menu.hasAttribute("data-open");
      closeAll(menu);
      menu.toggleAttribute("data-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      return;
    }
    if (item) {
      var m = item.closest(".bog-menu"), value = item.getAttribute("data-value"), was = item.getAttribute("aria-checked") === "true";
      select(m, value);
      setTimeout(function () { close(m); }, 80);
      if (!was) m.dispatchEvent(new CustomEvent("menuchange", { bubbles: true, detail: { value: value, label: item.getAttribute("data-label") || item.textContent.trim() } }));
      return;
    }
    if (!e.target.closest(".bog-menu__panel")) closeAll();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });

  window.BOG = window.BOG || {};
  window.BOG.selectMenu = function (menu, value) { if (typeof menu === "string") menu = document.getElementById(menu); if (menu) select(menu, value); };
  window.BOG.closeMenu = closeAll;
})();

/* ---- PIN code Input + Keyboard Numeric ------------------------------------
   .bog-numpad[data-for] types into a .bog-pin (dots) or a .bog-code (cells).
   .bog-pin fires "pinchange" / "pincomplete" (detail.value); the biometric pad
   fires "numpadbiometric" on the .bog-numpad. */
(function () {
  function dots(el) { return el.querySelectorAll(".bog-pin__dot"); }
  function setPin(el, value) {
    if (typeof el === "string") el = document.getElementById(el);
    if (!el) return;
    var d = dots(el), max = d.length;
    value = String(value || "").replace(/\D/g, "").slice(0, max);
    var prev = el._pin || "";
    el._pin = value;
    if (value.length > prev.length) el.removeAttribute("data-validation");
    d.forEach(function (dot, i) { dot.toggleAttribute("data-filled", i < value.length); });
    if (value !== prev) {
      el.dispatchEvent(new CustomEvent("pinchange", { bubbles: true, detail: { value: value } }));
      if (value.length === max) el.dispatchEvent(new CustomEvent("pincomplete", { bubbles: true, detail: { value: value } }));
    }
  }
  function press(pad, key) {
    if (key === "biometric") { pad.dispatchEvent(new CustomEvent("numpadbiometric", { bubbles: true })); return; }
    var el = document.getElementById(pad.getAttribute("data-for"));
    if (!el || el.getAttribute("data-state") === "loading") return;
    var isPin = el.classList.contains("bog-pin"), isCode = el.classList.contains("bog-code");
    if (!isPin && !isCode) {
      var input = el.matches("input, textarea") ? el : el.querySelector("input, textarea");
      if (!input || input.disabled || input.readOnly) return;
      var val = input.value;
      if (key === "back") val = val.slice(0, -1);
      else if (key === "dot") { if (val.indexOf(".") === -1) val = (val || "0") + "."; }
      else val += key;
      if (input.maxLength > 0) val = val.slice(0, input.maxLength);
      input.value = val;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    if (key === "dot") return;
    var v = (isPin ? el._pin : el._code) || "";
    var next = key === "back" ? v.slice(0, -1) : v + key;
    if (isPin) setPin(el, next); else if (window.BOG && BOG.setCode) BOG.setCode(el, next);
  }
  document.addEventListener("click", function (e) {
    var key = e.target.closest(".bog-numpad__key[data-key]");
    if (key) press(key.closest(".bog-numpad"), key.getAttribute("data-key"));
  });
  // Desktop: number keys and Backspace type into the visible numpad
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.matches("input, textarea")) return;
    var key = /^[0-9]$/.test(e.key) ? e.key : e.key === "Backspace" ? "back" : (e.key === "." || e.key === ",") ? "dot" : null;
    if (!key) return;
    var pad = Array.prototype.find.call(document.querySelectorAll(".bog-numpad"), function (p) { return p.offsetParent !== null && !p.closest("[inert]"); });
    if (pad && key === "dot" && !pad.querySelector('[data-key="dot"]')) return;
    if (pad) { e.preventDefault(); press(pad, key); }
  });
  document.querySelectorAll(".bog-pin").forEach(function (el) { el._pin = ""; });

  window.BOG = window.BOG || {};
  window.BOG.setPin = setPin;
})();

/* ==merged:tooltip== */
/* ---- Tooltip -----------------------------------------------------------------
   Tap any [data-tooltip="id"] (or [data-tooltip-text="…"]) trigger, incl. .bog-field__info,
   to open the tooltip next to it. It is moved into the trigger's .bog-sheet-host (or <body>),
   flips top/bottom (or left/right for -center alignments) and shifts sideways to stay inside
   the frame/viewport; the arrow keeps pointing at the trigger. One open at a time; tap outside,
   Escape or the same trigger closes. Fires "tooltipopen" / "tooltipclose" (detail.trigger). */
(function () {
  var MARGIN = 12, GAP = 10, INSET = 16, ARROW = 8;
  var current = null, currentTrigger = null;

  function hostOf(el) { return el.closest(".bog-sheet-host") || document.body; }
  function bounds(host) {
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var b = { left: 0, top: 0, right: vw, bottom: vh };
    if (host !== document.body) {
      // inside a phone frame: stay within the frame's own edges (it may be partly scrolled out of view)
      var r = host.getBoundingClientRect();
      b = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    }
    return { left: b.left + MARGIN, top: b.top + MARGIN, right: b.right - MARGIN, bottom: b.bottom - MARGIN };
  }
  function tooltipFor(trigger) {
    var id = trigger.getAttribute("data-tooltip");
    var tip = id && document.getElementById(id);
    if (tip) return tip;
    var text = trigger.getAttribute("data-tooltip-text");
    if (text == null) return null;
    tip = trigger._bogTooltip;
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "bog-tooltip";
      tip.setAttribute("role", "tooltip");
      tip.id = "bog-tooltip-" + Math.random().toString(36).slice(2, 8);
      trigger._bogTooltip = tip;
    }
    tip.textContent = text;
    tip.setAttribute("data-position", trigger.getAttribute("data-tooltip-position") || "bottom");
    tip.setAttribute("data-alignment", trigger.getAttribute("data-tooltip-alignment") || "center");
    tip.removeAttribute("data-pref-position");
    return tip;
  }

  function place(tip, trigger) {
    var host = hostOf(trigger);
    if (tip.parentNode !== host) host.appendChild(tip);
    // remember the designer's preferred placement; flipping starts from it every time
    if (!tip.hasAttribute("data-pref-position")) {
      tip.setAttribute("data-pref-position", tip.getAttribute("data-position") || "bottom");
      tip.setAttribute("data-pref-alignment", tip.getAttribute("data-alignment") || "center");
    }
    var pos = tip.getAttribute("data-pref-position"), align = tip.getAttribute("data-pref-alignment");
    var b = bounds(host), t = trigger.getBoundingClientRect();
    tip.style.translate = "none";
    tip.style.maxWidth = "min(var(--_max-width), " + Math.max(80, b.right - b.left) + "px)";
    tip.style.left = "0px"; tip.style.top = "0px";
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var cx = t.left + t.width / 2, cy = t.top + t.height / 2, x, y;
    var side = align === "left-center" || align === "right-center";

    if (side) {
      var roomL = t.left - GAP - b.left, roomR = b.right - (t.right + GAP);
      if (align === "left-center" && w > roomL && roomR > roomL) align = "right-center";
      else if (align === "right-center" && w > roomR && roomL > roomR) align = "left-center";
      var room = align === "left-center" ? roomL : roomR;
      if (w > room) { side = false; align = "center"; pos = "bottom"; }   // no room on either side
      else {
        x = align === "left-center" ? t.left - GAP - w : t.right + GAP;
        y = Math.min(Math.max(cy - h / 2, b.top), b.bottom - h);
        tip.style.setProperty("--_arrow-y", Math.min(Math.max(cy - y - 3, 8), h - 14) + "px");
        tip.style.removeProperty("--_arrow-x");
      }
    }
    if (!side) {
      var below = b.bottom - (t.bottom + GAP), above = t.top - GAP - b.top;
      if (pos !== "top" && h > below && above > below) pos = "top";
      else if (pos === "top" && h > above && below > above) pos = "bottom";
      y = pos === "top" ? t.top - GAP - h : t.bottom + GAP;
      var arrowAt = INSET + ARROW / 2;
      var xs = { left: cx - arrowAt, center: cx - w / 2, right: cx - w + arrowAt };
      var fits = function (a) { return xs[a] >= b.left && xs[a] + w <= b.right; };
      if (!fits(align)) align = ["center", "left", "right"].filter(fits)[0] || align;
      x = Math.min(Math.max(xs[align], b.left), b.right - w);
      tip.style.setProperty("--_arrow-x", Math.min(Math.max(cx - x - ARROW / 2, 8), w - ARROW - 8) + "px");
      tip.style.removeProperty("--_arrow-y");
    }
    tip.setAttribute("data-position", pos);
    tip.setAttribute("data-alignment", align);

    // viewport → host coordinates
    var ox, oy;
    if (host === document.body && getComputedStyle(host).position === "static" && getComputedStyle(host).transform === "none") {
      ox = -window.scrollX; oy = -window.scrollY;
    } else {
      var hr = host.getBoundingClientRect();
      ox = hr.left + host.clientLeft - host.scrollLeft; oy = hr.top + host.clientTop - host.scrollTop;
    }
    tip.style.left = Math.round(x - ox) + "px";
    tip.style.top = Math.round(y - oy) + "px";
  }

  function open(tip, trigger) {
    if (typeof tip === "string") tip = document.getElementById(tip);
    if (!tip || !trigger) return;
    if (current && current !== tip) close();
    var reopen = current === tip;
    if (reopen && currentTrigger && currentTrigger !== trigger) currentTrigger.setAttribute("aria-expanded", "false");
    if (!reopen) tip.removeAttribute("data-open");
    place(tip, trigger);
    void tip.offsetWidth;   // start the fade/scale from the closed state
    tip.setAttribute("data-open", "");
    current = tip; currentTrigger = trigger;
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-describedby", tip.id);
    if (!reopen) tip.dispatchEvent(new CustomEvent("tooltipopen", { bubbles: true, detail: { trigger: trigger } }));
  }
  function close() {
    if (!current) return;
    var tip = current, trigger = currentTrigger;
    current = currentTrigger = null;
    tip.removeAttribute("data-open");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    tip.dispatchEvent(new CustomEvent("tooltipclose", { bubbles: true, detail: { trigger: trigger } }));
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-tooltip], [data-tooltip-text]");
    if (trigger && !trigger.disabled) {
      e.preventDefault();   // e.g. .bog-field__info inside a <label>: don't focus the input
      var tip = tooltipFor(trigger);
      if (!tip) return;
      if (current === tip && currentTrigger === trigger) close(); else open(tip, trigger);
      return;
    }
    if (current && !e.target.closest(".bog-tooltip")) close();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  function reposition() { if (current && currentTrigger) { if (!currentTrigger.isConnected) close(); else place(current, currentTrigger); } }
  window.addEventListener("resize", reposition);
  document.addEventListener("scroll", reposition, true);

  window.BOG = window.BOG || {};
  window.BOG.openTooltip = open;      // BOG.openTooltip("tip-id" | el, triggerEl)
  window.BOG.closeTooltip = close;
})();

/* ==merged:search-input== */
/* ---- Search Input: Cancel empties the field and leaves search ---------- */
(function () {
  // keep focus in the input until the click lands (otherwise Cancel hides on blur first)
  document.addEventListener("mousedown", function (e) { if (e.target.closest && e.target.closest(".bog-search__cancel")) e.preventDefault(); });
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".bog-search__cancel");
    if (!btn) return;
    e.preventDefault();
    var field = btn.closest(".bog-search"), input = field.querySelector(".bog-field__input");
    if (input.value) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    input.blur();
    field.dispatchEvent(new CustomEvent("searchcancel", { bubbles: true }));
  });
  // Escape = Cancel
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !e.target.matches || !e.target.matches(".bog-search .bog-field__input")) return;
    var btn = e.target.closest(".bog-search").querySelector(".bog-search__cancel");
    if (btn) btn.click(); else e.target.blur();
  });
})();

/* ==merged:segmented-control== */
/* ---- Segmented Control: sliding thumb + segmentchange event ------------ */
(function () {
  function place(el, instant) {
    var thumb = el.querySelector(":scope > .bog-segmented__thumb");
    if (!thumb) {
      thumb = document.createElement("span");
      thumb.className = "bog-segmented__thumb";
      thumb.setAttribute("aria-hidden", "true");
      el.insertBefore(thumb, el.firstChild);
    }
    var input = el.querySelector(".bog-segmented__item > input:checked");
    if (instant) el.setAttribute("data-thumb", "instant");
    if (input) {
      var item = input.parentNode;
      thumb.style.width = item.offsetWidth + "px";
      thumb.style.transform = "translateX(" + item.offsetLeft + "px)";
    }
    if (instant) { void thumb.offsetWidth; el.setAttribute("data-thumb", ""); }
    else if (!el.hasAttribute("data-thumb")) el.setAttribute("data-thumb", "");
  }
  var ro = window.ResizeObserver ? new ResizeObserver(function (entries) {
    entries.forEach(function (en) { place(en.target, true); });
  }) : null;
  function init(root) {
    (root || document).querySelectorAll(".bog-segmented").forEach(function (el) {
      if (el._bogSeg) { place(el, true); return; }
      el._bogSeg = true;
      place(el, true);
      if (ro) ro.observe(el);
    });
  }
  document.addEventListener("change", function (e) {
    var input = e.target;
    if (!input.matches || !input.matches(".bog-segmented__item > input")) return;
    var el = input.closest(".bog-segmented");
    if (!el._bogSeg) init(el.parentNode);
    place(el, false);
    var inputs = Array.prototype.slice.call(el.querySelectorAll(".bog-segmented__item > input"));
    el.dispatchEvent(new CustomEvent("segmentchange", { bubbles: true, detail: { value: input.value, index: inputs.indexOf(input) } }));
  });
  // Markup added later (e.g. innerHTML): BOG.segmented() re-scans; it also runs on first interaction.
  document.addEventListener("pointerdown", function (e) {
    var el = e.target.closest && e.target.closest(".bog-segmented");
    if (el && !el._bogSeg) init(el.parentNode);
  });
  window.BOG = window.BOG || {};
  window.BOG.segmented = init;
  function start() { init(document); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { init(document); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* ==merged:navigation-bar== */
/* ---- Navigation Bar: background + divider appear on scroll ----------------
   .bog-nav-bar[data-scroll-effect] gets data-scrolled while the content under it is scrolled down.
   The scroll container is the bar's nearest scrollable ancestor (or the page). */
(function () {
  function scroller(el) {
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const o = getComputedStyle(p).overflowY;
      if (o === "auto" || o === "scroll") return p;
    }
    return null; // the page itself
  }
  function update() {
    document.querySelectorAll(".bog-nav-bar[data-scroll-effect]").forEach(function (bar) {
      const s = scroller(bar);
      const top = s ? s.scrollTop : window.scrollY;
      bar.toggleAttribute("data-scrolled", top > 0);
    });
  }
  let queued = false;
  document.addEventListener("scroll", function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; update(); });
  }, { capture: true, passive: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", update);
  else update();
  window.BOG = window.BOG || {};
  window.BOG.updateNavBars = update;
})();

/* ==merged:tabs== */
/* ---- Tabs --------------------------------------------------------------------
   .bog-tabs[role=tablist] > .bog-tab[role=tab]. Click / ← → Home End select a tab;
   a sliding .bog-tabs__indicator follows the selected tab; panels named in
   aria-controls are shown / hidden; "tabchange" fires on the .bog-tabs
   (detail.index, detail.tab, detail.value). BOG.selectTab(tabsOrId, index). */
(function () {
  function tabsOf(list) { return Array.prototype.filter.call(list.children, function (t) { return t.classList.contains("bog-tab") && t.getAttribute("data-state") !== "skeleton"; }); }
  function place(list) {
    var ind = list.querySelector(":scope > .bog-tabs__indicator");
    var sel = list.querySelector(':scope > .bog-tab[aria-selected="true"]');
    if (!ind) return;
    if (!sel || !sel.offsetWidth) { ind.style.setProperty("--_w", "0px"); return; }
    ind.style.setProperty("--_x", sel.offsetLeft + "px");
    ind.style.setProperty("--_w", sel.offsetWidth + "px");
  }
  function sync(list) {
    tabsOf(list).forEach(function (t) {
      var on = t.getAttribute("aria-selected") === "true";
      t.tabIndex = on ? 0 : -1;
      var id = t.getAttribute("aria-controls"), panel = id && document.getElementById(id);
      if (panel) panel.hidden = !on;
    });
    place(list);
  }
  function setup(list) {
    if (list.hasAttribute("data-ready")) { sync(list); return; }
    var ind = document.createElement("span");
    ind.className = "bog-tabs__indicator";
    ind.setAttribute("aria-hidden", "true");
    list.appendChild(ind);
    if (!list.getAttribute("role")) list.setAttribute("role", "tablist");
    list.setAttribute("data-ready", "");
    sync(list);
    requestAnimationFrame(function () { list.setAttribute("data-ready", "animate"); });
    if (window.ResizeObserver) new ResizeObserver(function () { place(list); }).observe(list);
  }
  function select(list, tab, focus) {
    if (!tab || tab.disabled || tab.getAttribute("aria-selected") === "true") { if (focus && tab) tab.focus(); return; }
    var tabs = tabsOf(list);
    tabs.forEach(function (t) { t.setAttribute("aria-selected", t === tab ? "true" : "false"); });
    sync(list);
    if (focus) tab.focus();
    if (list.getAttribute("data-type") === "wrapped" && tab.scrollIntoView) tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    list.dispatchEvent(new CustomEvent("tabchange", { bubbles: true, detail: { index: tabs.indexOf(tab), tab: tab, value: tab.getAttribute("data-value") || tab.id || tab.textContent.trim() } }));
  }
  function init() { document.querySelectorAll(".bog-tabs").forEach(setup); }

  document.addEventListener("click", function (e) {
    var tab = e.target.closest(".bog-tab");
    var list = tab && tab.closest(".bog-tabs");
    if (list) select(list, tab, false);
  });
  document.addEventListener("keydown", function (e) {
    var tab = e.target.closest && e.target.closest(".bog-tab");
    var list = tab && tab.closest(".bog-tabs");
    if (!list) return;
    var tabs = tabsOf(list).filter(function (t) { return !t.disabled; }), i = tabs.indexOf(tab), next = null;
    if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
    else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === "Home") next = tabs[0];
    else if (e.key === "End") next = tabs[tabs.length - 1];
    if (!next) return;
    e.preventDefault();
    select(list, next, true);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { document.querySelectorAll(".bog-tabs[data-ready]").forEach(place); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  window.BOG = window.BOG || {};
  window.BOG.initTabs = init;
  window.BOG.selectTab = function (list, index) {
    if (typeof list === "string") list = document.getElementById(list);
    if (!list) return;
    setup(list);
    select(list, tabsOf(list)[index], false);
  };
})();

/* ==merged:tab-bar== */
/* ---- Tab Bar (bottom app navigation) ------------------------------------------
   Tapping a .bog-tab-bar__item moves aria-current="page" (the selection pill slides)
   and fires "tabbarchange" on the .bog-tab-bar (detail.index, detail.item,
   detail.value); preventDefault() keeps the current tab. Items that are links with
   a real href still navigate. BOG.selectTabBar(barOrId, index). */
(function () {
  function itemsOf(bar) { return Array.prototype.slice.call(bar.querySelectorAll(".bog-tab-bar__item")); }
  function place(bar) {
    var pill = bar.querySelector(".bog-tab-bar__selection");
    var cur = bar.querySelector('.bog-tab-bar__item[aria-current="page"]');
    if (!pill) return;
    if (!cur || !cur.offsetWidth) { pill.style.setProperty("--_w", "0px"); return; }
    var inset = parseFloat(getComputedStyle(cur).getPropertyValue("--_pill-inset")) || 2; /* Selection is 2px wider each side */
    pill.style.setProperty("--_x", (cur.offsetLeft - inset) + "px");
    pill.style.setProperty("--_w", (cur.offsetWidth + inset * 2) + "px");
  }
  function setup(bar) {
    if (bar.hasAttribute("data-ready")) { place(bar); return; }
    var row = bar.querySelector(".bog-tab-bar__items");
    if (row && bar.getAttribute("data-type") !== "toolbar") {
      var pill = document.createElement("span");
      pill.className = "bog-tab-bar__selection";
      pill.setAttribute("aria-hidden", "true");
      row.insertBefore(pill, row.firstChild);
      if (window.ResizeObserver) new ResizeObserver(function () { place(bar); }).observe(row);
    }
    bar.setAttribute("data-ready", "");
    place(bar);
    requestAnimationFrame(function () { bar.setAttribute("data-ready", "animate"); });
  }
  function select(bar, item) {
    if (!item || item.getAttribute("aria-current") === "page") return true;
    var items = itemsOf(bar);
    var ev = new CustomEvent("tabbarchange", { bubbles: true, cancelable: true, detail: { index: items.indexOf(item), item: item, value: item.getAttribute("data-value") || item.getAttribute("aria-label") || item.textContent.trim() } });
    if (!bar.dispatchEvent(ev)) return false;
    items.forEach(function (i) { if (i === item) i.setAttribute("aria-current", "page"); else i.removeAttribute("aria-current"); });
    place(bar);
    return true;
  }
  function init() { document.querySelectorAll(".bog-tab-bar").forEach(setup); }

  document.addEventListener("click", function (e) {
    var item = e.target.closest(".bog-tab-bar__item");
    var bar = item && item.closest(".bog-tab-bar");
    if (!bar) return;
    var href = item.getAttribute("href");
    if (!href || href === "#") e.preventDefault();
    if (!select(bar, item)) e.preventDefault();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { document.querySelectorAll(".bog-tab-bar[data-ready]").forEach(place); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  window.BOG = window.BOG || {};
  window.BOG.initTabBar = init;
  window.BOG.selectTabBar = function (bar, index) {
    if (typeof bar === "string") bar = document.getElementById(bar);
    if (!bar) return;
    setup(bar);
    select(bar, itemsOf(bar)[index]);
  };
})();

/* ---- Input motion: Default ⇄ Active, Error ------------------------------
   Figma: Component Motion Guidelines › Input Active (2274:961), Input Error (2274:2662),
   Message → Error (3090:12182). Runs on every .bog-field (Text, Number, Currency, Password, Phone)
   and the Currency Small Input (border fade on focus + error motion; it has no floating label).
   Active → Default plays the Default → Active motion backwards. Off under prefers-reduced-motion. */
(function () {
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function still() { return (reduce && reduce.matches) || !document.documentElement.animate; }

  // Easings [x1, y1, x2, y2] from the guides
  var E = {
    ringA: [0.33, 0, 0.16, 1], label: [0.33, 0, 0.67, 1],
    phScale: [0.33, 0, 0.26, 1], phSettle: [0.17, 0, 0.83, 1], ph: [0.33, 0, 0.17, 1],
    errW: [0.33, 0, 0.67, 1], shake: [0.33, 0, 0.27, 1], errMsg: [0.33, 0, 0.21, 1],
    msgOut: [0.33, 0, 0, 1], msgInY: [0.33, 0, 0.07, 1], msgInA: [0.33, 0, 0.67, 1]
  };
  var FOCUS_MS = 250, DELAY = 17;   // Default → Active is 250ms; placeholder and caret start 17ms in
  // Fields that get this motion: Text Input–based fields, and the Currency Small Input (no floating label,
  // so only its border and error motion apply)
  var FIELD = ".bog-field, .bog-currency-small", INPUT = ".bog-field__input, .bog-currency-small__input";
  var BOX = ".bog-field__box, .bog-currency-small__box", MSG = ":scope > :is(.bog-field__message, .bog-currency-small__message)";

  function css(e) { return e === "linear" ? "linear" : "cubic-bezier(" + e.join(", ") + ")"; }
  function rev(e) { return e === "linear" ? e : [1 - e[2], 1 - e[3], 1 - e[0], 1 - e[1]]; }
  function bez(e) {
    if (e === "linear") return function (t) { return t; };
    function f(a, b, u) { var v = 1 - u; return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u; }
    return function (t) {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      var lo = 0, hi = 1, u = t;
      for (var i = 0; i < 30; i++) {
        var x = f(e[0], e[2], u);
        if (Math.abs(x - t) < 1e-5) break;
        if (x < t) lo = u; else hi = u;
        u = (lo + hi) / 2;
      }
      return f(e[1], e[3], u);
    };
  }
  // Value of segments [from, to, ms, easing] at t ms
  function valueAt(segs, t) {
    for (var i = 0; i < segs.length; i++) {
      var g = segs[i];
      if (t <= g[2]) return g[0] + (g[1] - g[0]) * bez(g[3])(Math.max(0, t) / g[2]);
      t -= g[2];
    }
    return segs[segs.length - 1][1];
  }
  // Animate one CSS property through segments. o.reverse plays it backwards inside o.total ms;
  // o.fmt turns a number into the CSS value.
  function track(el, prop, segs, delay, o) {
    var len = segs.reduce(function (s, g) { return s + g[2]; }, 0);
    if (o.reverse) {
      delay = o.total - delay - len;
      segs = segs.slice().reverse().map(function (g) { return [g[1], g[0], g[2], rev(g[3])]; });
    }
    var frames = [], at = 0, fmt = (o.fmt && o.fmt[prop]) || String;
    segs.forEach(function (g) {
      var k = { offset: at / len, easing: css(g[3]) };
      k[prop] = fmt(g[0]);
      frames.push(k);
      at += g[2];
    });
    var end = { offset: 1 };
    end[prop] = fmt(segs[segs.length - 1][1]);
    frames.push(end);
    // Helper layers (copies, drawn caret) can finish before the whole motion does and are removed
    // only then: they hold their last frame so they don't pop back in meanwhile.
    var helper = el.classList.contains("bog-field__ghost") || el.classList.contains("bog-field__caret");
    return el.animate(frames, { duration: len, delay: delay, fill: helper ? "both" : "backwards" });
  }

  // Colors as [r, g, b, a]
  var ctx = document.createElement("canvas").getContext("2d");
  function color(s) {
    ctx.fillStyle = "#000";
    ctx.fillStyle = String(s).trim() || "transparent";
    var v = ctx.fillStyle;
    if (v[0] === "#") return [parseInt(v.substr(1, 2), 16), parseInt(v.substr(3, 2), 16), parseInt(v.substr(5, 2), 16), 1];
    var m = v.match(/[\d.]+/g);
    return [+m[0], +m[1], +m[2], m[3] == null ? 1 : +m[3]];
  }
  function mix(a, b, k) {
    var from = a[3] ? a : [b[0], b[1], b[2], 0], to = b[3] ? b : [a[0], a[1], a[2], 0];
    return from.map(function (v, i) { return v + (to[i] - v) * k; });
  }
  function rgba(c) { return "rgba(" + Math.round(c[0]) + ", " + Math.round(c[1]) + ", " + Math.round(c[2]) + ", " + c[3].toFixed(3) + ")"; }
  // Border (inset box-shadow) sampled at 60fps, so width, color and opacity keep their own curves
  function ring(box, ms, at) {
    var frames = [];
    for (var t = 0; ; t = Math.min(ms, t + 1000 / 60)) {
      var r = at(t);
      frames.push({ offset: t / ms, boxShadow: "inset 0 0 0 " + r[0].toFixed(3) + "px " + rgba(r[1]) });
      if (t >= ms) break;
    }
    return box.animate(frames, { duration: ms });
  }
  function ringOf(field) {
    var s = getComputedStyle(field);
    return { w: parseFloat(s.getPropertyValue("--_border-w")) || 0, c: color(s.getPropertyValue("--_border")) };
  }

  // Put a helper layer exactly over rect (viewport coords), inside host
  function place(el, host, rect) {
    el.style.left = "0px";
    el.style.top = "0px";
    host.appendChild(el);
    var r = el.getBoundingClientRect();
    el.style.left = (rect.left - r.left) + "px";
    el.style.top = (rect.top - r.top) + "px";
    return el;
  }
  function rel(r, to) { return { left: r.left - to.left, top: r.top - to.top, width: r.width, height: r.height }; }
  function abs(r, to) { return { left: r.left + to.left, top: r.top + to.top, width: r.width, height: r.height }; }
  // The element in .bog-field__text that holds the input (the input, or e.g. the currency value row)
  function rowOf(input) {
    var n = input;
    while (n.parentElement && !n.parentElement.classList.contains("bog-field__text")) n = n.parentElement;
    return n.parentElement ? n : input;
  }
  function done(anims, then) {
    Promise.all(anims.map(function (a) { return a.finished.catch(function () {}); })).then(then);
  }
  function stop(field) {
    (field._motion || []).forEach(function (a) { a.cancel(); });
    (field._motionEls || []).forEach(function (el) { el.remove(); });
    field._motion = field._motionEls = null;
    var input = field.querySelector(INPUT);
    if (input) input.style.caretColor = "";
    field.removeAttribute("data-moving");
  }

  // ---- Default ⇄ Active -----------------------------------------------------
  function toggle(field, on) {
    stop(field);
    var input = field.querySelector(INPUT), box = field.querySelector(BOX);
    if (still() || !input || !box || input.disabled || field.hasAttribute("data-state")) return;
    var label = field.querySelector(".bog-field__label"), row = rowOf(input);
    var o = { reverse: !on, total: FOCUS_MS }, anims = [], els = [];
    var bx = box.getBoundingClientRect(), s = getComputedStyle(field);
    field.setAttribute("data-moving", "");   // label font-size jumps; the motion scales it instead

    // Input container: the 1.6px border only fades in (250ms); its width doesn't animate.
    // Only from a plain, borderless rest.
    if (!field.hasAttribute("data-validation") && !input.readOnly) {
      var c = color(s.getPropertyValue("--_focus").trim() || s.getPropertyValue("--border-selected-neutral-strong")), w = parseFloat(s.getPropertyValue("--border-width-trick")) || 1.6;
      anims.push(ring(box, FOCUS_MS, function (t) {
        if (!on) t = FOCUS_MS - t;
        return [w, [c[0], c[1], c[2], c[3] * valueAt([[0, 1, 250, E.ringA]], t)]];
      }));
    }

    // Label, placeholder and caret move only when the field is empty (otherwise the label stays up)
    if (input.value === "" && label) {
      if (on) {
        var ir = input.getBoundingClientRect(), right = /right|end/.test(getComputedStyle(input).textAlign);
        field._geo = {
          dy: row.offsetHeight / 2,
          row: rel(row.getBoundingClientRect(), bx),
          caret: rel({ left: right ? ir.right - 2 : ir.left, top: ir.top, width: 2, height: ir.height }, bx),
          font: getComputedStyle(input).font,
          ph: getComputedStyle(input, "::placeholder").color,
          caretColor: getComputedStyle(input).caretColor
        };
      }
      var g = field._geo || { dy: 10 };
      var R = (parseFloat(s.getPropertyValue("--body-large-size")) || 16) / (parseFloat(s.getPropertyValue("--label-xsmall-size")) || 11);

      // Label: big → small with a 95% undershoot; rises by half the value row
      if (label) {
        var lo = { reverse: !on, total: FOCUS_MS, fmt: {
          scale: function (v) { return String(on ? v : v / R); },
          translate: function (v) { return "0 " + (on ? v : v - g.dy) + "px"; } } };
        anims.push(track(label, "scale", [[R, 0.95, 100, E.label], [0.95, 1, 100, E.label]], 0, lo));
        anims.push(track(label, "translate", [[g.dy, -0.34, 100, E.label], [-0.34, 0, 100, E.label]], 0, lo));
      }

      // Placeholder: 80% → 105% → 100%, rises 10px, fades in. On blur the row is already collapsed,
      // so a copy of the placeholder plays it backwards.
      var ph = on ? row : null;
      if (!on && g.row && input.placeholder.trim()) {
        ph = document.createElement("span");
        ph.className = "bog-field__ghost";
        ph.textContent = input.placeholder;
        ph.style.cssText += ";font:" + g.font + ";color:" + g.ph + ";height:" + g.row.height + "px;line-height:" + g.row.height + "px";
        els.push(place(ph, box, abs(g.row, bx)));
      }
      if (ph) {
        var po = { reverse: !on, total: FOCUS_MS, fmt: { translate: function (v) { return "0 " + v + "px"; } } };
        anims.push(track(ph, "scale", [[0.8, 1.05, 100, E.phScale], [1.05, 1, 100, E.phSettle]], DELAY, po));
        anims.push(track(ph, "translate", [[10, -1, 100, E.ph], [-1, 0, 100, E.ph]], DELAY, po));
        anims.push(track(ph, "opacity", [[0, 1, 150, E.ph]], DELAY, po));
      }

      // Caret: only fades in, with the placeholder (no scale or movement). A drawn caret; the real one
      // is hidden meanwhile.
      if (g.caret) {
        var caret = document.createElement("span");
        caret.className = "bog-field__caret";
        caret.style.cssText += ";width:" + g.caret.width + "px;height:" + g.caret.height + "px;background:" + g.caretColor;
        els.push(place(caret, box, abs(g.caret, bx)));
        if (on) input.style.caretColor = "transparent";
        anims.push(track(caret, "opacity", [[0, 1, 150, E.ph]], DELAY, o));
      }
    }

    field._motion = anims;
    field._motionEls = els;
    done(anims, function () { if (field._motion === anims) stop(field); });
  }
  function fieldOf(el) { return el && el.closest ? el.closest(FIELD) : null; }
  document.addEventListener("focusin", function (e) {
    var f = fieldOf(e.target);
    if (f && !f.classList.contains("bog-field__ghost") && fieldOf(e.relatedTarget) !== f) toggle(f, true);
  });
  document.addEventListener("focusout", function (e) {
    var f = fieldOf(e.target);
    if (f && !f.classList.contains("bog-field__ghost") && fieldOf(e.relatedTarget) !== f) toggle(f, false);
  });

  // ---- Error -----------------------------------------------------------------
  var observer;
  function snap(field) {
    var m = field.querySelector(MSG);
    return { v: field.getAttribute("data-validation"), msg: m ? m.outerHTML : null };
  }
  // Border before the change: briefly put the old validation back and read it
  function ringBefore(field, v) {
    var now = field.getAttribute("data-validation");
    if (v == null) field.removeAttribute("data-validation"); else field.setAttribute("data-validation", v);
    var r = ringOf(field);
    field.setAttribute("data-validation", now);
    observer.takeRecords();
    return r;
  }
  function errorIn(field, before) {
    var box = field.querySelector(BOX);
    if (still() || !box || field.hasAttribute("data-state")) return;
    (field._errMotion || []).forEach(function (a) { a.cancel(); });
    (field._errEls || []).forEach(function (el) { el.remove(); });
    var start = ringBefore(field, before.v), end = ringOf(field), anims = [], els = [];

    // Container: color → error (100ms, linear), border → 3px → resting width, shake 3.33px right, left, back
    anims.push(ring(box, 450, function (t) {
      return [valueAt([[start.w, 3, 100, E.errW], [3, end.w, 250, E.errW]], t), mix(start.c, end.c, Math.min(1, t / 100))];
    }));
    anims.push(track(box, "translate", [[0, 3.33, 150, E.shake], [3.33, -3.33, 150, E.shake], [-3.33, 0, 150, E.shake]], 0,
      { fmt: { translate: function (v) { return v + "px 0"; } } }));

    var msg = field.querySelector(MSG);
    var y = { fmt: { translate: function (v) { return "0 " + v + "px"; } } };
    if (msg && before.msg) {
      // Helper text → error text: the old message drops away, the new one drops in 50ms later
      var wrap = document.createElement("div");
      wrap.innerHTML = before.msg;
      var old = wrap.firstElementChild, mr = msg.getBoundingClientRect();
      var ghost = document.createElement("div");
      ghost.className = (field.classList.contains("bog-currency-small") ? "bog-currency-small" : "bog-field") + " bog-field__ghost";
      if (before.v) ghost.setAttribute("data-validation", before.v);
      if (field.hasAttribute("data-appearance")) ghost.setAttribute("data-appearance", field.getAttribute("data-appearance"));
      ghost.style.width = mr.width + "px";
      ghost.style.whiteSpace = "normal";
      ghost.appendChild(old);
      els.push(place(ghost, field, mr));
      anims.push(track(ghost, "translate", [[0, 8.62, 167, E.msgOut]], 0, y));
      anims.push(track(ghost, "opacity", [[1, 0, 83, E.msgOut]], 0, {}));
      anims.push(track(msg, "translate", [[-4.58, 0, 167, E.msgInY]], 50, y));
      anims.push(track(msg, "opacity", [[0, 1, 83, E.msgInA]], 50, {}));
    } else if (msg) {
      // No message before: the error message drops in past its spot and settles back
      anims.push(track(msg, "translate", [[-3.17, 3.33, 150, E.errMsg], [3.33, 0, 150, E.errMsg]], DELAY, y));
      anims.push(track(msg, "opacity", [[0, 1, 150, E.errMsg]], DELAY, {}));
    }
    observer.takeRecords();
    field._errMotion = anims;
    field._errEls = els;
    done(anims, function () {
      if (field._errMotion !== anims) return;
      els.forEach(function (el) { el.remove(); });
      field._errMotion = field._errEls = null;
    });
  }

  function init() {
    document.querySelectorAll(FIELD).forEach(function (f) { f._bogState = snap(f); });
    observer = new MutationObserver(function (records) {
      var touched = [];
      records.forEach(function (r) {
        var t = r.target.nodeType === 1 ? r.target : r.target.parentNode;
        if (!t || !t.closest || t.closest(".bog-field__ghost")) return;
        r.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1 || n.classList.contains("bog-field__ghost")) return;
          var list = n.matches(FIELD) ? [n] : [];
          n.querySelectorAll(FIELD).forEach(function (f) { list.push(f); });
          list.forEach(function (f) { if (!f._bogState) f._bogState = snap(f); });
        });
        var f = t.closest(FIELD);
        if (f && touched.indexOf(f) < 0) touched.push(f);
      });
      touched.forEach(function (f) {
        var before = f._bogState, now = snap(f);
        if (!before) { f._bogState = now; return; }
        if (now.v === "error" && before.v !== "error") errorIn(f, before);
        f._bogState = now;
      });
    });
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["data-validation"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  // Shared with the other component motions below
  window.BOG = window.BOG || {};
  window.BOG.motion = { still: still, track: track, valueAt: valueAt, css: css, color: color, rgba: rgba, done: done };
})();

/* ---- Account Picker motion ----------------------------------------------
   Figma: Component Motion Guidelines › Account Picker page — chips on (919:13920) / off (919:15157),
   Select (951:18757), Minimize (961:19904), page load (1241:4887), Error (1424:4099).
   Off under prefers-reduced-motion. BOG.pickerPageIn(page) plays the page load. */
(function () {
  var M = window.BOG.motion;
  var E = {
    chipW: [0.33, 0, 0.16, 1], chipSettle: [0.17, 0, 0.16, 1], checkX: [0.33, 0, 0.1, 1], checkDraw: [0.33, 0, 0.07, 1],
    chipOff: [0.17, 0, 0.67, 1], chipOffSettle: [0.33, 0, 0.67, 1],
    open: [0.33, 0, 0.28, 1], borderIn: [0.33, 0, 0.67, 1],
    closeChips: [0.72, 0, 0.67, 1], closeFade: [0.91, 0, 0.67, 1], closeSettle: [1, 0, 0.67, 1],
    page: [0.33, 0, 0.12, 1], shake: [0.33, 0, 0.25, 1]
  };
  function px(v) { return v + "px"; }
  function y(v) { return "0 " + v + "px"; }
  function x(v) { return v + "px 0"; }
  function run(el, list) {
    (el._pickerMotion || []).forEach(function (a) { a.cancel(); });
    el._pickerMotion = list;
    return list;
  }
  // Border (inset box-shadow) with its color at a given alpha
  function border(shadow, alpha) {
    var m = /^(rgba?\([^)]*\))\s+(.*)$/.exec(shadow || "");
    if (!m) return null;
    var c = M.color(m[1]);
    return M.rgba([c[0], c[1], c[2], c[3] * alpha]) + " " + m[2];
  }

  // State is read in the capture phase (before the library's own click / key handlers change it)
  // and animated from a window listener, which runs after them.
  var pending = [];
  function after() { var jobs = pending; pending = []; jobs.forEach(function (j) { j(); }); }
  window.addEventListener("click", after);
  window.addEventListener("keydown", after);

  // ---- Currency chips: on / off ------------------------------------------------
  function chipOn(chip, w0, w1) {
    var bg = getComputedStyle(chip).backgroundColor;
    chip.setAttribute("data-moving", "");
    var list = run(chip, [
      // Shape grows past its new width by 3px, then settles; color white → selected (linear)
      M.track(chip, "width", [[w0, w1 + 3, 200, E.chipW], [w1 + 3, w1, 50, E.chipSettle]], 0, { fmt: { width: px } }),
      chip.animate({ backgroundColor: ["#ffffff", bg] }, { duration: 100, easing: "linear" }),
      // Check draws in from the left while sliding 3.33px right
      chip.animate({ translate: ["-3.33px 0", "0 0"] }, { duration: 100, delay: 67, easing: M.css(E.checkX), fill: "backwards", pseudoElement: "::before" }),
      chip.animate({ clipPath: ["inset(0 100% 0 0)", "inset(0 0 0 0)"] }, { duration: 100, delay: 67, easing: M.css(E.checkDraw), fill: "backwards", pseudoElement: "::before" })
    ]);
    M.done(list, function () { if (chip._pickerMotion === list) chip.removeAttribute("data-moving"); });
  }
  function chipOff(chip, w0, w1) {
    var bg = getComputedStyle(chip).backgroundColor;
    chip.setAttribute("data-moving", "");
    chip.setAttribute("data-unchecking", "");   // keeps the check while it un-draws
    var list = run(chip, [
      chip.animate({ translate: ["0 0", "-3.33px 0"] }, { duration: 100, easing: M.css(E.chipOff), fill: "forwards", pseudoElement: "::before" }),
      chip.animate({ clipPath: ["inset(0 0 0 0)", "inset(0 100% 0 0)"] }, { duration: 100, easing: M.css(E.chipOff), fill: "forwards", pseudoElement: "::before" }),
      // 17ms later: shape shrinks 2px past its new width, then settles; color back to white
      M.track(chip, "width", [[w0, w1 - 2, 100, E.chipOff], [w1 - 2, w1, 50, E.chipOffSettle]], 17, { fmt: { width: px } }),
      chip.animate({ backgroundColor: ["#ffe0d0", bg] }, { duration: 100, delay: 17, easing: "linear", fill: "backwards" })
    ]);
    M.done(list, function () {
      if (chip._pickerMotion !== list) return;
      chip.removeAttribute("data-moving");
      chip.removeAttribute("data-unchecking");
    });
  }
  // Read widths before the chip handler changes aria-pressed (capture phase), animate after it
  document.addEventListener("click", function (e) {
    var chip = e.target.closest && e.target.closest(".bog-currency-chip");
    if (!chip || chip.disabled || M.still()) return;
    var group = chip.closest(".bog-picker__chips");
    var chips = group ? [].slice.call(group.querySelectorAll(".bog-currency-chip")) : [chip];
    var before = chips.map(function (c) {
      return { chip: c, on: c.getAttribute("aria-pressed") === "true", w: c.getBoundingClientRect().width };
    });
    pending.push(function () {
      before.forEach(function (b) {
        var c = b.chip, on = c.getAttribute("aria-pressed") === "true";
        if (on === b.on) return;
        (c._pickerMotion || []).forEach(function (a) { a.cancel(); });
        c.removeAttribute("data-unchecking");
        var w1 = c.getBoundingClientRect().width;
        if (on) chipOn(c, b.w, w1); else chipOff(c, b.w, w1);
      });
    });
  }, true);

  // ---- Picker: Select (expand) / Minimize ----------------------------------------
  function snapshot(picker) {
    var box = picker.querySelector(".bog-picker__box");
    return {
      picker: picker, box: box,
      selected: picker.hasAttribute("data-selected"),
      expanded: picker.hasAttribute("data-expanded"),
      h: box.getBoundingClientRect().height,
      shadow: getComputedStyle(box).boxShadow
    };
  }
  function animatePicker(b) {
    var p = b.picker, box = b.box, chips = p.querySelector(".bog-picker__expand > .bog-picker__chips");
    var selected = p.hasAttribute("data-selected"), expanded = p.hasAttribute("data-expanded");
    if (selected === b.selected && expanded === b.expanded) return;
    (p._pickerMotion || []).forEach(function (a) { a.cancel(); });
    p.removeAttribute("data-collapsing");
    p.setAttribute("data-moving", "");
    var list = [];

    if (expanded && !b.expanded) {
      // Select: the card grows 11px past its open height and settles; chips drop in 10px, rise 3px, fade in
      var h1 = box.getBoundingClientRect().height;
      list.push(M.track(box, "height", [[b.h, h1 + 11, 200, E.open], [h1 + 11, h1, 150, E.open]], 0, { fmt: { height: px } }));
      if (chips) {
        list.push(M.track(chips, "translate", [[-6.66, 3.34, 200, E.open], [3.34, 0, 150, E.open]], 50, { fmt: { translate: y } }));
        list.push(M.track(chips, "opacity", [[0, 1, 150, E.open]], 100, {}));
      }
    } else if (!expanded && b.expanded) {
      // Minimize: chips rise 6px and fade; 20ms later the card shrinks 3px past its closed height and settles
      var h0 = box.getBoundingClientRect().height;   // closed layout (data-collapsing not set yet)
      p.setAttribute("data-collapsing", "");          // keep the chips laid out while they animate out
      list.push(M.track(box, "height", [[b.h, h0 - 3, 150, E.closeChips], [h0 - 3, h0, 80, E.closeSettle]], 20, { fmt: { height: px } }));
      if (chips) {
        list.push(chips.animate({ translate: ["0 0", "0 -6px"] }, { duration: 150, easing: M.css(E.closeChips), fill: "forwards" }));
        list.push(chips.animate({ opacity: [1, 0] }, { duration: 100, easing: M.css(E.closeFade), fill: "forwards" }));
      }
    }

    // Border: fades in on select (200ms), out on deselect (80ms, 20ms in)
    var now = getComputedStyle(box).boxShadow;
    if (selected && !b.selected && border(now, 1)) {
      list.push(box.animate({ boxShadow: [border(now, 0), now] }, { duration: 200, easing: M.css(E.borderIn) }));
    } else if (!selected && b.selected && border(b.shadow, 1)) {
      list.push(box.animate({ boxShadow: [b.shadow, border(b.shadow, 0)] }, { duration: 80, delay: 20, easing: M.css(E.closeSettle), fill: "backwards" }));
    }

    run(p, list);
    M.done(list, function () {
      if (p._pickerMotion !== list) return;
      // Collapse the layout while transitions are still off, so the CSS transition doesn't replay it
      p.removeAttribute("data-collapsing");
      if (chips) getComputedStyle(chips).visibility;
      p.removeAttribute("data-moving");
    });
  }
  function beforePick(e) {
    var box = e.target.closest && e.target.closest(".bog-picker__box");
    if (!box || e.target.closest(".bog-currency-chip") || M.still()) return;
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    var picker = box.closest(".bog-picker"), group = picker.closest(".bog-picker-group");
    var all = group ? [].slice.call(group.querySelectorAll(".bog-picker")) : [picker];
    var before = all.map(snapshot);
    pending.push(function () { before.forEach(animatePicker); });
  }
  document.addEventListener("click", beforePick, true);
  document.addEventListener("keydown", beforePick, true);

  // ---- Error: the picker list shakes (+10, −5, +5, 0px over 550ms) ----------------
  function shake(picker) {
    if (M.still()) return;
    var target = picker.closest(".bog-picker-group") || picker;
    var list = run(target, [M.track(target, "translate",
      [[0, 10, 200, E.shake], [10, -5, 150, E.shake], [-5, 5, 100, E.shake], [5, 0, 100, E.shake]], 0, { fmt: { translate: x } })]);
    return list;
  }
  new MutationObserver(function (records) {
    var shaken = [];
    records.forEach(function (r) {
      var p = r.target;
      if (!p.classList || !p.classList.contains("bog-picker")) return;
      if (p.getAttribute("data-validation") !== "error" || r.oldValue === "error") return;
      var t = p.closest(".bog-picker-group") || p;
      if (shaken.indexOf(t) < 0) { shaken.push(t); shake(p); }
    });
  }).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["data-validation"], attributeOldValue: true });

  // ---- Page load: page slides in from the right, then the title and the cards rise in ----
  // page: the screen content under the navigation bar. Title: [data-picker-title] (or the first heading).
  window.BOG.pickerPageIn = function (page) {
    if (!page || M.still()) return [];
    var title = page.querySelector("[data-picker-title]") || page.querySelector("h1, h2, h3");
    var o = { fmt: { translate: y } }, list = [];
    list.push(M.track(page, "translate", [[190, 0, 400, E.page]], 0, { fmt: { translate: x } }));
    list.push(M.track(page, "opacity", [[0, 1, 400, E.page]], 0, {}));
    if (title) {
      list.push(M.track(title, "translate", [[39.65, 0, 400, E.page]], 100, o));
      list.push(M.track(title, "opacity", [[0, 1, 400, E.page]], 100, {}));
    }
    page.querySelectorAll(".bog-picker").forEach(function (card, i) {
      var d = 130 + 70 * i;   // 130, 200, 270ms…
      list.push(M.track(card, "translate", [[30, 0, 500, E.page]], d, o));
      list.push(M.track(card, "opacity", [[0, 1, 500, E.page]], d, {}));
    });
    return list;
  };
})();

/* ---- Hero Area motion ---------------------------------------------------
   Figma: Component Motion Guidelines › Hero Area (83:449) — Load and Slider. See hero.css.
   BOG.heroIn(hero) plays the load; BOG.heroSlide(slider, index) slides to another hero.
   Off under prefers-reduced-motion. */
(function () {
  var M = window.BOG.motion;
  var LOAD = [0.29, 0, 0.01, 1], SLIDE = [0.36, 0, 0.02, 1];
  var STEP = 1000 / 15;   // 66.7ms between slots: slot n starts (n − 1) × 66.7ms after the first
  function y(v) { return "0 " + v + "px"; }
  function x(v) { return v + "px 0"; }

  // Slots top to bottom: media, label, title, description, badges, then feedback / actions / anything else
  function slots(hero) {
    var out = [];
    [].forEach.call(hero.children, function (c) {
      if (c.hasAttribute("data-hero-static")) return;
      if (!c.classList.contains("bog-hero__content")) { out.push(c); return; }
      [].forEach.call(c.children, function (k) {
        if (k.classList.contains("bog-hero__text")) [].push.apply(out, k.children); else out.push(k);
      });
    });
    return out.filter(function (el) { return !el.hasAttribute("data-hero-static"); });
  }

  // Load: background fades in (600ms, linear); each slot rises 20px (500ms) and fades in (333ms)
  window.BOG.heroIn = function (hero) {
    if (!hero || M.still()) return [];
    var list = [];
    if (hero.hasAttribute("data-gradient")) {
      list.push(hero.animate({ opacity: [0, 1] }, { duration: 600, easing: "linear", fill: "backwards", pseudoElement: "::before" }));
    }
    slots(hero).forEach(function (el, i) {
      list.push(M.track(el, "translate", [[20, 0, 500, LOAD]], i * STEP, { fmt: { translate: y } }));
      list.push(M.track(el, "opacity", [[0, 1, 333, LOAD]], i * STEP, {}));
    });
    return list;
  };

  // Slide: heroes travel 760px (2 × screen + 10) in 750ms; the backgrounds stay put and cross-fade —
  // the old one fades out (150ms), then the new one fades in (250ms)
  window.BOG.heroSlide = function (slider, index) {
    var heroes = [].slice.call(slider.querySelectorAll(":scope > .bog-hero"));
    // During a slide both heroes are active; the slider remembers which one it is heading to
    var at = slider._heroIndex;
    if (!heroes[at] || !heroes[at].hasAttribute("data-active")) at = Math.max(0, heroes.findIndex(function (h) { return h.hasAttribute("data-active"); }));
    var from = heroes[at], to = heroes[index];
    if (!to || to === from) return [];
    slider._heroIndex = index;
    // A slide still running jumps to its end first
    (slider._heroMotion || []).forEach(function (a) { if (a.playState !== "idle" && a.playState !== "finished") a.finish(); });
    heroes.forEach(function (h) { h.toggleAttribute("data-active", h === from || h === to); });
    var done = function () { if (from !== to) from.removeAttribute("data-active"); };
    if (M.still()) { done(); return []; }
    var dir = heroes.indexOf(to) > heroes.indexOf(from) ? 1 : -1;
    var d = (2 * slider.getBoundingClientRect().width + 10) * dir;
    var bg = function (el, frames, opts) {
      return el.hasAttribute("data-gradient") ? [el.animate(frames, Object.assign({ pseudoElement: "::before" }, opts))] : [];
    };
    var list = [
      M.track(from, "translate", [[0, -d, 750, SLIDE]], 0, { fmt: { translate: x } }),
      M.track(to, "translate", [[d, 0, 750, SLIDE]], 0, { fmt: { translate: x } })
    ].concat(
      // backgrounds counter-move so they stay in place while the content slides
      bg(from, { opacity: [1, 0] }, { duration: 150, easing: "linear", fill: "forwards" }),
      bg(from, { translate: ["0px 0", d + "px 0"] }, { duration: 750, easing: M.css(SLIDE), fill: "forwards" }),
      bg(to, { opacity: [0, 1] }, { duration: 250, delay: 150, easing: "linear", fill: "backwards" }),
      bg(to, { translate: [-d + "px 0", "0px 0"] }, { duration: 750, easing: M.css(SLIDE) })
    );
    slider._heroMotion = list;
    M.done(list, function () {
      if (slider._heroMotion !== list) return;
      done();
      list.forEach(function (a) { a.cancel(); });
      slider._heroMotion = null;
    });
    return list;
  };
})();
