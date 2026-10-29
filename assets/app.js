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
    var n = parseFloat(amountInput.value);
    if (!n || n <= 0) { setAmountError("შეიყვანე თანხა"); amountInput.focus(); return; }
    if (n > balance) { setAmountError("ანგარიშზე არ არის საკმარისი თანხა"); amountInput.focus(); return; }
    var btn = this;
    btn.setAttribute("data-state", "loading");
    setTimeout(function () { btn.removeAttribute("data-state"); }, 800);
  });
})();
