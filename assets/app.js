/* Transfer form (Figma: Transfers – Update · Step 949).
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

  // Account Select: update account name and available balance
  $("#from-account").addEventListener("change", function (e) {
    var picker = document.querySelector('#accounts-sheet .bog-picker[data-value="' + e.detail.value + '"]');
    if (!picker) return;
    $("#from-name").textContent = picker.getAttribute("data-name");
    $("#from-account .bog-select__fav").hidden = !picker.querySelector(".bog-picker__fav");
    balance = parseFloat(picker.getAttribute("data-balance"));
    setAmountError(null);
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
