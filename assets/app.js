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
    btn.setAttribute("data-state", "loading");
    setTimeout(function () { btn.removeAttribute("data-state"); startVerification(); }, 700);
  });

  /* ---- Verification ------------------------------------------------------
     Entry points (URL hash) — which methods the bank asks for:
       Trusted device (one method):   #trusted-otp · #trusted-passcode · #trusted-passkey
       Not trusted (two methods):     #otp-passcode · #otp-passkey · #passcode-passkey
     No hash = #otp-passkey. Test code 0000 = wrong code.                                 */
  var SCENARIOS = {
    "trusted-otp": ["otp"], "trusted-passcode": ["passcode"], "trusted-passkey": ["passkey"],
    "otp-passcode": ["otp", "passcode"], "otp-passkey": ["otp", "passkey"], "passcode-passkey": ["passcode", "passkey"]
  };
  function scenario() { return SCENARIOS[location.hash.slice(1)] || SCENARIOS["otp-passkey"]; }

  // Start page (no hash) ↔ transfer form (#scenario). Back on the transfer form returns to the start page.
  function route() {
    var atStart = !SCENARIOS[location.hash.slice(1)];
    if (atStart) { closeAll(); if (page.hasAttribute("data-open")) closePicker(); }
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

  function showStep(i) {
    var prev = stepIndex >= 0 ? screen(steps[stepIndex]) : transfer;
    stepIndex = i;
    var next = screen(steps[i]);
    // wizard: hidden for a single method; earlier steps done, this one current
    var wiz = next.querySelector("[data-wizard]");
    wiz.hidden = steps.length < 2;
    wiz.innerHTML = steps.map(function (_, k) { return '<span class="bog-wizard__step"' + (k < i ? ' data-state="done"' : k === i ? ' data-state="current"' : "") + "></span>"; }).join("");
    wiz.setAttribute("role", "progressbar"); wiz.setAttribute("aria-valuemin", "1"); wiz.setAttribute("aria-valuemax", steps.length); wiz.setAttribute("aria-valuenow", i + 1);
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
  function closeAll() { while (stepIndex >= 0) back(); }
  function stepDone() {
    if (stepIndex < steps.length - 1) { leave(steps[stepIndex]); showStep(stepIndex + 1); return; }
    closeAll();
    setTimeout(function () { BOG.toast({ status: "positive", title: "გადარიცხვა დადასტურებულია", text: (amountInput.value ? amountInput.value + " ₾ · " : "") + "მიხეილ გოგიბერიძე" }); }, 400);
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-verify-close]")) closeAll();
    else if (e.target.closest("[data-verify-back]")) back();
  });

  function enter(name) {
    if (name === "otp") enterOtp();
    if (name === "passcode") resetCode("passcode");
    if (name === "passkey") enterPasskey();
  }

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
  function enterOtp() {
    resetCode("otp"); startCountdown();
    setTimeout(function () { $("#otp-code .bog-code__input").focus({ preventScroll: true }); }, 420);
  }
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#otp-resend")) return;
    BOG.toast({ status: "positive", title: "კოდი ხელახლა გამოიგზავნა", text: "+995 512 345 678" });
    resetCode("otp"); startCountdown();
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
    if (!silent) $("#passkey-retry").hidden = false;
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

  route();
})();
