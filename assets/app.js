/* Transfer form (Figma: Transfers – Update · Step 949) + Account Picker Page (pushed).
   "Next" validates the amount; verification screens get wired in once the designs arrive. */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var balance = 24.02;
  var amountField = $("#amount-field"), amountInput = $("#amount"), amountMsg = $("#amount-msg");

  function setAmountError(text) {
    if (text) { amountField.setAttribute("data-validation", "error"); amountMsg.textContent = text; }
    else { amountField.removeAttribute("data-validation"); amountMsg.textContent = "საკომისიო: 0.00 ₾"; }
  }

  // Amount: digits and one decimal point, max 2 decimals
  amountInput.addEventListener("input", function () {
    var v = amountInput.value.replace(",", ".").replace(/[^\d.]/g, "");
    var parts = v.split(".");
    if (parts.length > 1) v = parts[0] + "." + parts.slice(1).join("").slice(0, 2);
    amountInput.value = v;
    setAmountError(null);
  });

  /* ---- Account Picker Page (pushed) ---------------------------------- */
  var transfer = $('[data-screen="transfer"]'), page = $('[data-screen="picker"]');
  var options = $("#picker-options"), pickerError = $("#picker-error");
  var MEDIA = {
    "apple-pay": '<img class="apple-pay-mark" src="assets/img/apple-pay.svg" alt="" width="40" height="26">',
    "mastercard": '<span class="bog-media-circle" data-size="40"><img src="assets/img/mastercard.png" alt=""></span>',
    "visa": '<span class="bog-media-circle" data-size="40"><img src="assets/img/visa.png" alt=""></span>',
    "just-card": '<span class="bog-card-art" data-size="40"><img src="assets/img/just-card.png" alt=""></span>',
    "business-visa": '<span class="bog-card-art" data-size="40"><img src="assets/img/business-visa.png" alt=""></span>'
  };
  var current = "salary";   // what the Account Select shows

  // One choice across the whole page: Apple Pay (Radio Card), cards and accounts (Account Pickers)
  function clearChoice() {
    options.querySelectorAll(".bog-picker[data-selected]").forEach(function (p) { p.removeAttribute("data-selected"); });
    options.querySelectorAll(".bog-radio-card__input").forEach(function (r) { r.checked = false; });
  }
  function choose(value) {
    clearChoice();
    var el = options.querySelector('[value="' + value + '"], .bog-picker[data-value="' + value + '"]');
    if (!el) return;
    if (el.matches("input")) el.checked = true; else el.setAttribute("data-selected", "");
    pickerError.hidden = true;
  }
  function chosen() {
    var r = options.querySelector(".bog-radio-card__input:checked");
    return r || options.querySelector(".bog-picker[data-selected]");
  }
  options.addEventListener("click", function (e) {
    var box = e.target.closest(".bog-picker__box");
    if (box) choose(box.closest(".bog-picker").getAttribute("data-value"));
  });
  options.addEventListener("change", function (e) {
    if (e.target.matches(".bog-radio-card__input")) choose(e.target.value);
  });
  $("#add-card").addEventListener("click", function () {
    BOG.toast({ status: "info", title: "ბარათის დამატება", text: "ეს ნაკადი პროტოტიპში ჯერ არ არის" });
  });

  function openPicker() {
    choose(current);
    pickerError.hidden = true;
    options.scrollTop = 0;
    page.setAttribute("data-open", "");
    page.removeAttribute("aria-hidden");
    transfer.inert = true;
    transfer.setAttribute("data-covered", "");
    setTimeout(function () { $("#picker-close").focus({ preventScroll: true }); }, 450);
  }
  function closePicker() {
    page.removeAttribute("data-open");
    page.setAttribute("aria-hidden", "true");
    transfer.inert = false;
    transfer.removeAttribute("data-covered");
    $("#from-account .bog-select__box").focus({ preventScroll: true });
  }
  $("#from-account .bog-select__box").addEventListener("click", openPicker);
  $("#picker-close").addEventListener("click", closePicker);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && page.hasAttribute("data-open")) closePicker(); });

  $("#picker-choose").addEventListener("click", function () {
    var el = chosen();
    if (!el) { pickerError.hidden = false; return; }
    current = el.matches("input") ? el.value : el.getAttribute("data-value");
    var name = el.getAttribute("data-name");
    var label = el.getAttribute("data-label") || "";
    $("#from-name").textContent = name;
    $("#from-account .bog-select__value").textContent = label;
    $("#from-account .bog-select__fav").style.display = el.hasAttribute("data-fav") ? "" : "none";
    $("#from-account").setAttribute("data-value", current);
    $("#from-media").innerHTML = MEDIA[el.getAttribute("data-media")] || "";
    var b = el.getAttribute("data-balance");
    balance = b ? parseFloat(b) : Infinity;   // cards and Apple Pay: no balance check here
    setAmountError(null);
    closePicker();
  });

  $("#next-btn").addEventListener("click", function () {
    // No amount validation in the prototype: Next always continues to verification
    var btn = this;
    // OTP first: push the step right in the tap, so the keyboard rises together with the
    // slide-in (as in the app) instead of popping up over the transfer form
    if (scenario()[0] === "otp") { startVerification(); return; }
    btn.setAttribute("data-state", "loading");
    setTimeout(function () { btn.removeAttribute("data-state"); startVerification(); }, 700);
  });

  /* ---- Verification ------------------------------------------------------
     Entry points (URL hash) — which methods the bank asks for:
       Trusted device (one method):   #trusted-otp · #trusted-passcode · #trusted-passkey
       Not trusted (two methods):     #otp-passcode · #otp-passkey · #passcode-passkey
     Add "/sheet" (e.g. #otp-passkey/sheet) to run the steps in a Bottom Sheet over the form.
     Add "/ds" (e.g. #otp-passkey/ds or #otp-passkey/sheet/ds) for the Current Design System OTP component.
     No hash = start page. Test code 0000 = wrong code.                                   */
  var SCENARIOS = {
    "trusted-otp": ["otp"], "trusted-passcode": ["passcode"], "trusted-passkey": ["passkey"],
    "otp-passcode": ["otp", "passcode"], "otp-passkey": ["otp", "passkey"], "passcode-passkey": ["passcode", "passkey"]
  };
  function hashName() { return location.hash.slice(1).split("/")[0]; }
  function scenario() { return SCENARIOS[hashName()] || SCENARIOS["otp-passkey"]; }
  var sheetMode = false;

  // Start-page toggle: run verification in a Bottom Sheet. Remembered, and added to the links as "/sheet".
  var modeToggle = $("#sheet-mode");
  function syncLinks() {
    document.querySelectorAll('[data-screen="start"] a.bog-list-item').forEach(function (a) {
      a.setAttribute("href", "#" + a.getAttribute("href").slice(1).split("/")[0] + (modeToggle.checked ? "/sheet" : "") + (dsToggle.checked ? "/ds" : ""));
    });
  }
  function hashFlag(f) { return location.hash.slice(1).split("/").indexOf(f) > 0; }
  modeToggle.checked = hashFlag("sheet") || localStorage.getItem("verify-sheet-mode") === "1";
  modeToggle.addEventListener("change", function () {
    localStorage.setItem("verify-sheet-mode", modeToggle.checked ? "1" : "0");
    syncLinks();
  });

  // Start-page toggle: "Current Design System" — the OTP step uses the new OTP Verification
  // component (bog-otp) instead of the Onboarding code cells. Added to the links as "/ds".
  var dsToggle = $("#ds-mode");
  function applyDs(on) { if (on) document.documentElement.setAttribute("data-ds", "current"); else document.documentElement.removeAttribute("data-ds"); }
  dsToggle.checked = hashFlag("ds") || localStorage.getItem("verify-ds-current") === "1";
  dsToggle.addEventListener("change", function () {
    localStorage.setItem("verify-ds-current", dsToggle.checked ? "1" : "0");
    applyDs(dsToggle.checked);
    syncLinks();
  });
  applyDs(dsToggle.checked);
  syncLinks();

  // Start page (no hash) ↔ transfer form (#scenario). Back on the transfer form returns to the start page.
  function route() {
    var atStart = !SCENARIOS[hashName()];
    if (atStart) { closeAll(); if (page.hasAttribute("data-open")) closePicker(); }
    else if (stepIndex < 0) { sheetMode = hashFlag("sheet"); applyDs(hashFlag("ds")); }
    document.documentElement.toggleAttribute("data-at-start", atStart);
    $('[data-screen="start"]').inert = !atStart;
    transfer.inert = atStart;
  }
  window.addEventListener("hashchange", route);
  $("#transfer-back").addEventListener("click", function () {
    history.pushState(null, "", location.pathname + location.search);   // drop the #scenario
    route();
  });
  var steps = [], stepIndex = -1, timer = null;
  function screen(name) { return $('[data-screen="' + name + '"]'); }

  // Wizard: hidden for a single method; earlier steps done, this one current
  function renderWizard(scr, i) {
    var wiz = scr.querySelector("[data-wizard]");
    wiz.hidden = steps.length < 2;
    wiz.innerHTML = steps.map(function (_, k) { return '<span class="bog-wizard__step"' + (k < i ? ' data-state="done"' : k === i ? ' data-state="current"' : "") + "></span>"; }).join("");
    wiz.setAttribute("role", "progressbar"); wiz.setAttribute("aria-valuemin", "1"); wiz.setAttribute("aria-valuemax", steps.length); wiz.setAttribute("aria-valuenow", i + 1);
  }

  function showStep(i) {
    if (sheetMode) { sheetShow(i); return; }
    var prev = stepIndex >= 0 ? screen(steps[stepIndex]) : transfer;
    stepIndex = i;
    var next = screen(steps[i]);
    renderWizard(next, i);
    // back on a 1st step closes the whole verification
    prev.inert = true; prev.setAttribute("data-covered", "");
    next.removeAttribute("aria-hidden"); next.inert = false; next.removeAttribute("data-covered");
    next.setAttribute("data-open", "");
    enter(steps[i]);
  }
  function startVerification() { steps = scenario(); stepIndex = -1; showStep(0); }
  function leave(name) {
    if (name === "otp") clearInterval(timer);
    if (name === "passkey") closeSystemSheet(true);
  }
  function back() {
    var cur = screen(steps[stepIndex]);
    leave(steps[stepIndex]);
    cur.removeAttribute("data-open"); cur.setAttribute("aria-hidden", "true");
    stepIndex--;
    var under = stepIndex >= 0 ? screen(steps[stepIndex]) : transfer;
    under.inert = false; under.removeAttribute("data-covered");
    if (stepIndex >= 0) enter(steps[stepIndex]);
  }
  function closeAll() {
    if (sheetMode) { sheetCancel(true); return; }
    while (stepIndex >= 0) back();
  }
  // Last step: the Result Page slides up over everything; the verification steps close behind it.
  var resultScr = screen("result");
  function showResult() {
    var n = parseFloat(String(amountInput.value).replace(/[^\d.]/g, "")) || 0;
    $("#result-amount").textContent = n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    resultScr.removeAttribute("aria-hidden"); resultScr.inert = false;
    resultScr.setAttribute("data-open", "");
  }
  function hideResult(then) {
    resultScr.removeAttribute("data-open"); resultScr.setAttribute("aria-hidden", "true"); resultScr.inert = true;
    if (then) then();
  }
  resultScr.inert = true;
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-result-done]")) {          // Done / ✕ → back to the scenario list
      hideResult(function () { history.pushState(null, "", location.pathname + location.search); route(); });
    } else if (e.target.closest("#result-new")) {         // New transfer → an empty form
      amountInput.value = ""; amountInput.dispatchEvent(new Event("input", { bubbles: true }));
      hideResult();
    }
  });
  function stepDone() {
    if (sheetMode) { sheetStepDone(); return; }
    if (stepIndex < steps.length - 1) { leave(steps[stepIndex]); showStep(stepIndex + 1); return; }
    showResult();
    setTimeout(closeAll, 450);
  }

  /* ---- Sheet mode: the step's content moves into one Bottom Sheet over the form.
     A finished step closes the sheet, then it opens again with the next step.
     Closing the sheet (X, swipe down, tap outside) cancels verification. */
  var vSheet = $("#verify-sheet"), vContent = vSheet.querySelector(".bog-sheet__content");
  var mounted = null, closingByCode = false;
  function mountStep(name) {
    var scr = screen(name);
    var parts = ["[data-wizard]", ".verify__body"].map(function (sel) { return scr.querySelector(sel); }).filter(Boolean);
    mounted = parts.map(function (el) { return { el: el, parent: el.parentNode, next: el.nextSibling }; });
    var wrap = document.createElement("div");
    wrap.className = "verify verify--sheet";
    parts.forEach(function (el) { wrap.appendChild(el); });
    vContent.innerHTML = ""; vContent.appendChild(wrap);
  }
  function unmountStep() {
    if (!mounted) return;
    mounted.slice().reverse().forEach(function (m) { m.parent.insertBefore(m.el, m.next); });
    vContent.innerHTML = ""; mounted = null;
  }
  function sheetShow(i) {
    stepIndex = i;
    // Passkey: only the phone's own passkey sheet, no Bottom Sheet behind it
    if (steps[i] === "passkey") { sysTimer = setTimeout(openSystemSheet, i === 0 ? 300 : 0); return; }
    renderWizard(screen(steps[i]), i);
    // The step's title ("შეიყვანე ვერიფიკაციის კოდი" / "შეიყვანე პასკოდი") becomes the sheet title
    var t = screen(steps[i]).querySelector(".bog-empty__title");
    $("#verify-sheet-title").textContent = t ? t.textContent : "ვერიფიკაცია";
    mountStep(steps[i]);
    vContent.scrollTop = 0;
    BOG.openSheet(vSheet);
    enter(steps[i]);
  }
  function closeSheetByCode(then) {
    closingByCode = true;
    BOG.closeSheet(vSheet);
    setTimeout(function () { closingByCode = false; unmountStep(); if (then) then(); }, 420);
  }
  function sheetStepDone() {
    var wasPasskey = steps[stepIndex] === "passkey";
    leave(steps[stepIndex]);
    var next = stepIndex + 1;
    var after = function () {
      if (next < steps.length) sheetShow(next);
      else { stepIndex = -1; showResult(); }
    };
    if (wasPasskey) setTimeout(after, 380); else closeSheetByCode(after);
  }
  function sheetCancel(fromCode) {
    if (stepIndex < 0) return;
    var wasPasskey = steps[stepIndex] === "passkey";
    leave(steps[stepIndex]);
    stepIndex = -1;
    if (wasPasskey) return;
    if (fromCode) closeSheetByCode(); else setTimeout(unmountStep, 420);   // after the slide-down
  }
  vSheet.addEventListener("sheetclose", function () { if (!closingByCode) sheetCancel(false); });
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-verify-close]")) closeAll();
    else if (e.target.closest("[data-verify-back]")) back();
  });

  function enter(name) {
    if (name === "otp") enterOtp();
    if (name === "passcode") { resetCode("passcode"); anchorPasscode(); }
    if (name === "passkey") enterPasskey();
  }

  // Passcode: if everything fits, nothing scrolls. If not, the content is anchored to the bottom
  // (keypad + code in place) and the top (illustration) tucks under the nav bar / sheet top;
  // scroll up to see it.
  function passcodeScroller() {
    return sheetMode ? vContent : screen("passcode").querySelector(".screen__body");
  }
  function anchorPasscode() {
    var el = passcodeScroller();
    var pin = function () { el.scrollTop = el.scrollHeight; };
    pin(); requestAnimationFrame(pin); setTimeout(pin, 60);
  }
  window.addEventListener("resize", function () {
    if (steps && steps[stepIndex] === "passcode") anchorPasscode();
  });

  // Code steps (OTP + passcode): 4 digits → check → 0000 is wrong
  function resetCode(name) {
    var code = $("#" + name + "-code");
    BOG.setCode(code, "");
    code.removeAttribute("data-validation"); code.removeAttribute("data-state");
    if (name === "passcode") setHint("passcode", "");
  }
  function setHint(name, html, error) {
    var h = $("#" + name + "-hint"); h.innerHTML = html;
    if (error) h.setAttribute("data-status", "error"); else h.removeAttribute("data-status");
  }
  ["otp", "passcode"].forEach(function (name) {
    var code = $("#" + name + "-code");
    code.addEventListener("codechange", function () { if (name === "passcode" || !timer) setHint(name, ""); else countdownText(); });
    code.addEventListener("codecomplete", function (e) {
      code.setAttribute("data-state", "loading");
      var input = code.querySelector(".bog-code__input"); if (input) input.blur();
      setTimeout(function () {
        code.removeAttribute("data-state");
        if (e.detail.value === "0000") {
          BOG.setCode(code, "");
          code.setAttribute("data-validation", "error");
          setHint(name, name === "otp" ? "კოდი არასწორია, სცადე თავიდან" : "პასკოდი არასწორია, სცადე თავიდან", true);
          if (input) input.focus();
        } else {
          stepDone();
        }
      }, 900);
    });
  });

  // OTP: 30 s countdown, then resend
  var left = 0;
  function countdownText() { setHint("otp", "კოდს მიიღებ <strong>0:" + String(left).padStart(2, "0") + "</strong> წამში"); }
  function startCountdown() {
    clearInterval(timer); left = 30; countdownText();
    timer = setInterval(function () {
      left--;
      if (left > 0) { if (!$("#otp-hint").hasAttribute("data-status")) countdownText(); return; }
      clearInterval(timer); timer = null;
      setHint("otp", '<button type="button" class="bog-btn" data-type="text-primary" id="otp-resend">კოდის ხელახლა გაგზავნა</button>');
    }, 1000);
  }
  // Delivery method (SMS / email / WhatsApp): the pill's iOS pull-down. Switching sends a new code.
  var METHODS = {
    sms:      { desc: "კოდი გამოგზავნილია ნომერზე <strong>+995 512 345 678</strong>", short: "კოდი გამოგზავნილია ნომერზე ••• •• 56 78", toast: "კოდი გამოიგზავნა SMS-ით", to: "+995 512 345 678" },
    email:    { desc: "კოდი გამოგზავნილია ელფოსტაზე <strong>m•••@gmail.com</strong>", short: "კოდი გამოგზავნილია ელფოსტაზე m•••@gmail.com", toast: "კოდი გამოიგზავნა ელფოსტაზე", to: "m•••@gmail.com" },
    whatsapp: { desc: "კოდი გამოგზავნილია WhatsApp-ში ნომერზე <strong>+995 512 345 678</strong>", short: "კოდი გამოგზავნილია WhatsApp-ში ••• •• 56 78", toast: "კოდი გამოიგზავნა WhatsApp-ში", to: "+995 512 345 678" }
  };
  var otpMethod = $("#otp-method");
  function setMethodText(value) {
    var m = METHODS[value] || METHODS.sms;
    $("#otp-desc").innerHTML = m.desc;
    $("#otp-ds-message").textContent = m.short;
  }
  otpMethod.addEventListener("menuchange", function (e) {
    var m = METHODS[e.detail.value];
    setMethodText(e.detail.value);
    BOG.toast({ status: "positive", title: m.toast, text: m.to });
    enterOtp(true);
  });

  // iOS opens the keyboard only for a focus made during the tap. The OTP field shows up later
  // (loading + slide-in), so the tap focuses a hidden numeric field first; the keyboard opens,
  // and focus moves to the OTP field once it's on screen (the keyboard stays up).
  var kbProxy = null;
  function primeKeyboard() {
    if (!kbProxy) {
      kbProxy = document.createElement("input");
      kbProxy.setAttribute("inputmode", "numeric");
      kbProxy.setAttribute("aria-hidden", "true");
      kbProxy.tabIndex = -1;
      kbProxy.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;border:0;padding:0;pointer-events:none";
      document.body.appendChild(kbProxy);
    }
    kbProxy.focus({ preventScroll: true });
  }
  function focusOtpField(input) {
    input.focus({ preventScroll: true });
    if (kbProxy) { kbProxy.remove(); kbProxy = null; }
  }

  function enterOtp(keepMethod) {
    primeKeyboard();   // a tap (back, method change) opens the keyboard right away
    if (keepMethod !== true) { BOG.selectMenu(otpMethod, "sms"); setMethodText("sms"); }
    BOG.closeMenu();
    if (document.documentElement.getAttribute("data-ds") === "current") return enterOtpDs();
    resetCode("otp"); startCountdown();
    setTimeout(function () { focusOtpField($("#otp-code .bog-code__input")); }, 420);
  }
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#otp-resend")) return;
    BOG.toast({ status: "positive", title: "კოდი ხელახლა გამოიგზავნა", text: "+995 512 345 678" });
    resetCode("otp"); startCountdown();
  });

  // OTP, Current Design System (bog-otp): bog-ui runs the 30 s timer and Resend; 0000 = wrong code
  var otpDs = $("#otp-ds"), otpDsField = $("#otp-ds-field"), otpDsInput = otpDs.querySelector(".bog-field__input");
  function otpDsError(on) {
    if (on) otpDsField.setAttribute("data-validation", "error"); else otpDsField.removeAttribute("data-validation");
    otpDsField.querySelector(".bog-field__message").hidden = !on;
  }
  function enterOtpDs() {
    otpDs.querySelector('.bog-radio__input[value="sms"]').checked = true;
    otpDsInput.value = ""; otpDsError(false); syncOtpDsSubmit();
    BOG.setOtpState(otpDs, "default"); BOG.startOtpTimer(otpDs);
    setTimeout(function () { focusOtpField(otpDsInput); }, 420);
  }
  // Current Design System: SMS / Email radios (the official component's Selector) instead of the pill
  otpDs.addEventListener("change", function (e) {
    if (!e.target.matches(".bog-radio__input")) return;
    var m = METHODS[e.target.value];
    setMethodText(e.target.value);
    BOG.toast({ status: "positive", title: m.toast, text: m.to });
    otpDsInput.value = ""; otpDsError(false); syncOtpDsSubmit();
    BOG.setOtpState(otpDs, "default"); BOG.startOtpTimer(otpDs);
  });
  otpDsInput.addEventListener("input", function () { if (otpDsInput.value.length < 4) otpDsError(false); });
  // Confirm button under OTP Verification: enabled once all 4 digits are in; tapping it checks the code
  var otpDsSubmit = $("#otp-ds-submit");
  function syncOtpDsSubmit() { otpDsSubmit.disabled = otpDsInput.value.length < 4; }
  otpDsInput.addEventListener("input", syncOtpDsSubmit);
  otpDsSubmit.addEventListener("click", function () {
    var value = otpDsInput.value;
    otpDsInput.blur();
    BOG.setOtpState(otpDs, "loading");
    otpDsSubmit.setAttribute("data-state", "loading");
    setTimeout(function () {
      otpDsSubmit.removeAttribute("data-state");
      // back to Default while the timer runs, Resend once it has finished
      BOG.setOtpState(otpDs, otpDs.querySelector(".bog-otp__timer").hidden ? "resend" : "default");
      if (value === "0000") { otpDsInput.value = ""; otpDsError(true); syncOtpDsSubmit(); otpDsInput.focus(); }
      else stepDone();
    }, 900);
  });
  otpDs.addEventListener("otpresend", function () {
    otpDsError(false); syncOtpDsSubmit();
    BOG.toast({ status: "positive", title: "კოდი ხელახლა გამოიგზავნა", text: "+995 512 345 678" });
  });

  // Passkey: the phone shows its own passkey sheet; Continue = Face ID → done
  var sys = $("#ios-passkey"), sysTimer;
  function openSystemSheet() {
    $("#passkey-retry").hidden = true;
    sys.hidden = false; sys.getBoundingClientRect();
    sys.setAttribute("data-open", "");
    screen("passkey").inert = true;
  }
  function closeSystemSheet(silent) {
    clearTimeout(sysTimer);
    if (sys.hidden) return;
    sys.removeAttribute("data-open");
    screen("passkey").inert = false;
    setTimeout(function () { sys.hidden = true; }, 360);
    if (silent) return;
    if (sheetMode) sheetCancel(false);          // sheet mode: closing the passkey sheet cancels
    else $("#passkey-retry").hidden = false;
  }
  function enterPasskey() {
    $("#passkey-retry").hidden = true;
    clearTimeout(sysTimer);
    sysTimer = setTimeout(openSystemSheet, 700);
  }
  $("#ios-passkey-close").addEventListener("click", function () { closeSystemSheet(false); });
  $("#passkey-retry").addEventListener("click", openSystemSheet);
  $("#ios-passkey-continue").addEventListener("click", function () {
    var btn = this; btn.setAttribute("data-state", "loading");
    setTimeout(function () { btn.removeAttribute("data-state"); closeSystemSheet(true); stepDone(); }, 1100);
  });

  // Keyboard open (phones): lets the CSS drop the illustration so the code stays visible
  if (window.visualViewport) {
    var vvp = window.visualViewport;
    var kbFlag = function () { document.documentElement.toggleAttribute("data-keyboard", window.innerHeight - vvp.height - vvp.offsetTop > 80); };
    vvp.addEventListener("resize", kbFlag);
  }

  route();
})();
