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

  function openSheet(sheet, opener) {
    sheet = resolve(sheet);
    if (!sheet || sheet.hasAttribute("data-open")) return;
    ensureClose(sheet);
    sheet._opener = opener || document.activeElement;
    sheet.hidden = false;
    sheet.getBoundingClientRect(); // start the slide-up from the closed position
    sheet.setAttribute("data-open", "");
    openStack.push(sheet);
    document.documentElement.classList.add("bog-sheet-locked"); // freeze the page behind the sheet
    var panel = sheet.querySelector(".bog-sheet__panel");
    if (panel) {
      if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");
      var target = panel.querySelector('[aria-selected="true"]') || panel;
      setTimeout(function () { target.focus({ preventScroll: true }); }, 50);
    }
  }

  function closeSheet(sheet) {
    sheet = resolve(sheet) || openStack[openStack.length - 1];
    if (!sheet || !sheet.hasAttribute("data-open")) return;
    sheet.removeAttribute("data-open");
    sheet.style.removeProperty("--drag");
    openStack = openStack.filter(function (s) { return s !== sheet; });
    if (!openStack.length) document.documentElement.classList.remove("bog-sheet-locked");
    var panel = sheet.querySelector(".bog-sheet__panel");
    var done = function () { if (!sheet.hasAttribute("data-open")) sheet.hidden = true; };
    if (panel && getComputedStyle(panel).transitionDuration !== "0s") panel.addEventListener("transitionend", done, { once: true });
    else done();
    setTimeout(done, 400); // fallback
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
})();

/* ---- Action Item: remove button ------------------------------------------ */
(function () {
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".bog-action-item__remove");
    if (!btn) return;
    var item = btn.closest(".bog-action-item");
    var ev = new CustomEvent("actionitemremove", { bubbles: true, cancelable: true });
    if (!item.dispatchEvent(ev)) return; // call e.preventDefault() in a listener to keep the item
    item.setAttribute("data-removing", "");
    setTimeout(function () { item.remove(); }, 180);
  });
})();

/* ---- Checkbox: data-indeterminate attribute → indeterminate property ------ */
(function () {
  document.querySelectorAll(".bog-checkbox__input[data-indeterminate]").forEach(function (i) { i.indeterminate = true; });
  document.addEventListener("change", function (e) {
    if (e.target.matches && e.target.matches(".bog-checkbox__input[data-indeterminate]")) e.target.removeAttribute("data-indeterminate");
  });
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
      el.setAttribute("data-leaving", "");           // toast: slide back out (see feedback.css)
      setTimeout(function () { el.remove(); }, 160);
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
    // visible ~3 s after it has settled (enter animation is 520ms)
    if (o.timeout !== 0) setTimeout(function () { if (el.isConnected) dismiss(el); }, 520 + (o.timeout || 3000));
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
  document.addEventListener("mousedown", function (e) { if (e.target.closest(".bog-number-input [data-step]")) e.preventDefault(); });
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".bog-number-input [data-step]");
    if (!btn) return;
    e.preventDefault();
    var field = btn.closest(".bog-number-input"), input = field.querySelector(".bog-field__input");
    var step = parseFloat(input.dataset.step) || 1, min = parseFloat(input.dataset.min), max = parseFloat(input.dataset.max);
    var v = (parseFloat(input.value) || 0) + (btn.dataset.step === "up" ? step : -step);
    if (!isNaN(min)) v = Math.max(min, v);
    if (!isNaN(max)) v = Math.min(max, v);
    input.value = String(Math.round(v * 1e6) / 1e6);
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
  function formatAll() { document.querySelectorAll(".bog-phone-input").forEach(function (f) { formatField(f, false); }); }
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
  function openModal(modal, opener) {
    modal = resolve(modal);
    if (!modal || modal.hasAttribute("data-open")) return;
    modal._opener = opener || document.activeElement;
    modal.hidden = false;
    modal.getBoundingClientRect();
    modal.setAttribute("data-open", "");
    var dialog = modal.querySelector(".bog-modal__dialog");
    if (dialog) { if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex", "-1"); setTimeout(function () { dialog.focus({ preventScroll: true }); }, 50); }
  }
  function closeModal(modal) {
    modal = resolve(modal) || document.querySelector(".bog-modal[data-open]");
    if (!modal || !modal.hasAttribute("data-open")) return;
    modal.removeAttribute("data-open");
    setTimeout(function () { if (!modal.hasAttribute("data-open")) modal.hidden = true; }, 220);
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
    var open = document.querySelectorAll(".bog-modal[data-open]");
    if (open.length) closeModal(open[open.length - 1]);
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
