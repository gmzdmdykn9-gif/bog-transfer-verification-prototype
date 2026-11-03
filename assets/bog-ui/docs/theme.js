/* BOG UI docs — light / dark theme.
   Load in <head> without defer so pages draw in the saved theme straight away.
   Sets <html data-theme="light|dark">: docs.css uses it now, tokens.css will hold the components' dark values.
   Any element with [data-theme-toggle] switches the theme; the choice is remembered. */
(function () {
  var KEY = "bog-ui-theme", root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  root.setAttribute("data-theme", saved === "dark" ? "dark" : "light");

  function label() { return root.getAttribute("data-theme") === "dark" ? "Light mode" : "Dark mode"; }
  function set(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) { b.textContent = label(); });
  }
  window.BOG_THEME = {
    get: function () { return root.getAttribute("data-theme"); },
    set: set,
    toggle: function () { set(root.getAttribute("data-theme") === "dark" ? "light" : "dark"); },
    button: function () { return '<button type="button" class="docs-theme" data-theme-toggle>' + label() + "</button>"; }
  };
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-theme-toggle]")) window.BOG_THEME.toggle();
  });
})();
