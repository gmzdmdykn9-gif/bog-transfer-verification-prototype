/* BOG UI docs — "Motion · Bottom Sheet" section for components that open a Bottom Sheet
   (Select, Account Select). Same spec and code as the Bottom Sheet page.
   Put <div id="sheet-motion" data-component="Select" data-web="…optional web markup…"></div>
   where it should go and load this file with defer. The motion itself lives in bog-ui.js. */
(function () {
  var host = document.getElementById("sheet-motion");
  if (!host) return;
  var NAME = host.getAttribute("data-component") || "This component";
  var FIG = "https://www.figma.com/design/Xhy3YpxKNhhQzuYa1U2g54/Chat-Motion-Guidlines?node-id=2-4924";

  var SPEC = [
    ["Sheet", "Position Y", "+788 (below the screen) → −20", "0–300 ms", "0.33, 0, 0.25, 1"],
    ["Sheet", "Position Y", "−20 → 0 (settles)", "300–550 ms", "0.17, 0, 0.25, 1"]];
  var SPEC_CLOSE = [
    ["Sheet", "Position Y", "0 → its own height + 24 (off screen)", "0–250 ms", "0.75, 0, 0.67, 1"],
    ["Overlay", "Opacity", "100% → 0", "0–200 ms", "Linear"]];
  var pct = function (ms) { return (ms / 600 * 100).toFixed(2) + "%"; };
  var axis = '<span></span><div class="motion-tl__axis">' + Array.from({ length: 11 }, function (_, i) { return "<span>" + i * 60 + "</span>"; }).join("") + "</div>";
  var table = function (rows) {
    return '<table class="motion-spec"><thead><tr><th>Layer</th><th>Property</th><th>Keyframes</th><th>Timing</th><th>Easing (cubic-bezier)</th></tr></thead><tbody>' +
      rows.map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td><td>" + r[3] + "</td><td><code>" + r[4] + "</code></td></tr>"; }).join("") + "</tbody></table>";
  };
  var btns = function (key, copyLabel) {
    return '<div class="motion-actions"><button class="bog-btn" data-type="secondary" data-size="small" data-sm-link="' + key + '">Copy link</button>' +
      '<button class="bog-btn" data-type="neutral" data-size="small" data-sm-copy="' + key + '">' + (copyLabel || "Copy code") + "</button></div>";
  };

  var DESIGN =
    "<p>" + NAME + " opens a Bottom Sheet, so it uses the Bottom Sheet motion as it is. Tapping the field plays <strong>Open</strong>; picking an option — or the X, the overlay, a drag down or Escape — plays <strong>Close</strong>. Values are px (web) = pt (iOS) = dp (Android), measured from the sheet's resting spot; positive = down. The sheet starts 788 px below its spot — or its own height, if it is taller — so it always starts off screen.</p>" +
    '<h3>Open<a href="' + FIG + '" target="_blank" rel="noopener">Figma ↗</a></h3>' +
    '<div class="motion-tl"><span>Sheet · Position Y</span><div class="motion-tl__track"><span class="motion-tl__bar" style="left:0;width:' + pct(300) + '">300</span><span class="motion-tl__bar" style="left:' + pct(300) + ";width:" + pct(250) + '">250</span></div>' + axis + "</div>" +
    table(SPEC) +
    "<h3>Close</h3><p>Not part of the guide — the BOG UI addition that pairs with the open motion: the open curve mirrored, so the sheet accelerates away. No overshoot, and the overlay is gone before the sheet.</p>" +
    '<div class="motion-tl"><span>Sheet · Position Y</span><div class="motion-tl__track"><span class="motion-tl__bar" style="left:0;width:' + pct(250) + '">250</span></div>' +
    '<span>Overlay · Opacity</span><div class="motion-tl__track"><span class="motion-tl__bar" data-kind="fade" style="left:0;width:' + pct(200) + '">200</span></div>' + axis + "</div>" +
    table(SPEC_CLOSE) +
    "<h3>Rules</h3><ul>" +
      "<li>Picking an option fills the field right away; the sheet starts closing 120 ms later, so users see their choice land first. The field itself doesn't animate.</li>" +
      "<li>Open comes from the Action Sheet guide; Close is the BOG UI addition. The overlay fades in with the component's 280 ms fade.</li>" +
      "<li>Dragging the sheet down and letting go continues the close from where the finger left off, over the remaining distance (never under 150 ms).</li>" +
      "<li>During the 20 px overshoot the area under the sheet stays filled with the sheet's color, so no gap shows at the bottom edge.</li>" +
      "<li>The iOS home indicator belongs to the screen, not the sheet: it doesn't move.</li>" +
      '<li>Same spec as the <a href="bottom-sheet.html#motion">Bottom Sheet</a> — change it there and here together.</li>' +
      "<li>Reduce Motion / Remove animations on: the sheet appears and disappears without moving.</li>" +
    "</ul>" + btns("design", "Copy spec as text");

  var SPEC_TEXT = [NAME + " · Bottom Sheet motion — " + FIG, "Units: px = pt = dp; positive = down",
    "OPEN (550 ms) — tap the field"].concat(SPEC.map(function (r) { return "  " + r.join("  ·  "); }),
    ["Start = 788 below the resting spot, or the sheet's height if taller.", "", "CLOSE (250 ms, BOG UI addition) — pick an option (starts 120 ms after the field fills), X, overlay, drag, Escape"],
    SPEC_CLOSE.map(function (r) { return "  " + r.join("  ·  "); }),
    ["After a drag: continues from the finger over the remaining distance (min 150 ms).", "Home indicator: static. Reduce Motion: no movement."]).join("\n");

  var CODE = {
    web: (host.getAttribute("data-web") || "") +
`
// bog-ui.js — what plays on the sheet's panel when the field opens it
panel.animate([
  { translate: "0 max(100%, 788px)", easing: "cubic-bezier(0.33, 0, 0.25, 1)" },
  { translate: "0 -20px", offset: 300 / 550, easing: "cubic-bezier(0.17, 0, 0.25, 1)" },
  { translate: "0 0" }
], { duration: 550 });

// …and 120 ms after an option is picked (or at once for X, overlay, Escape, drag)
panel.animate({ translate: ["0 0", "0 " + (panel.offsetHeight + 24) + "px"] },
  { duration: 250, easing: "cubic-bezier(0.75, 0, 0.67, 1)", fill: "forwards" });
overlay.animate({ opacity: [1, 0] }, { duration: 200, easing: "linear", fill: "forwards" });`,
    ios: `import SwiftUI

// Chat Motion Guidelines › Action Sheet (2:4924) — open: rises 808pt (to 20pt past its spot) in 300ms,
// settles back 20pt in 250ms. iOS 17+.
struct BOGSheetPresenter<Sheet: View>: ViewModifier {
    @Binding var isPresented: Bool
    @ViewBuilder var sheet: () -> Sheet

    @State private var y: CGFloat = 788          // resting below the screen
    @State private var height: CGFloat = 0
    @State private var overlay = 0.0
    @Environment(\\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        content.overlay(alignment: .bottom) {
            ZStack(alignment: .bottom) {
                Color.black.opacity(0.68 * overlay).ignoresSafeArea()
                    .onTapGesture { isPresented = false }
                sheet()
                    .background(alignment: .bottom) {
                        // fills the gap under the sheet during the 20pt overshoot
                        Color(.systemBackground).frame(height: 24).offset(y: 24)
                    }
                    .onGeometryChange(for: CGFloat.self) { $0.size.height } action: { height = $0 }
                    .offset(y: y)
            }
            .allowsHitTesting(isPresented)
        }
        .onChange(of: isPresented) { _, open in open ? show() : hide() }
    }

    private func show() {
        withAnimation(.easeOut(duration: 0.28)) { overlay = 1 }
        if reduceMotion { y = 0; return }
        withAnimation(.timingCurve(0.33, 0, 0.25, 1, duration: 0.3)) { y = -20 } completion: {
            withAnimation(.timingCurve(0.17, 0, 0.25, 1, duration: 0.25)) { y = 0 }
        }
    }
    // Close (BOG UI addition, pairs with the open): drops its height + 24pt in 250ms, accelerating;
    // the overlay fades out in 200ms
    private func hide() {
        if reduceMotion { overlay = 0; y = 788; return }
        withAnimation(.linear(duration: 0.2)) { overlay = 0 }
        withAnimation(.timingCurve(0.75, 0, 0.67, 1, duration: 0.25)) { y = height + 24 } completion: { y = 788 }
    }
}

extension View {
    func bogSheet<S: View>(isPresented: Binding<Bool>, @ViewBuilder sheet: @escaping () -> S) -> some View {
        modifier(BOGSheetPresenter(isPresented: isPresented, sheet: sheet))
    }
}
// The home indicator is the system's — it doesn't move with the sheet.`,
    android: `import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity

// Chat Motion Guidelines › Action Sheet (2:4924) — open: rises 808dp (to 20dp past its spot) in 300ms,
// settles back 20dp in 250ms
private val RiseEasing = CubicBezierEasing(0.33f, 0f, 0.25f, 1f)
private val SettleEasing = CubicBezierEasing(0.17f, 0f, 0.25f, 1f)
private val CloseEasing = CubicBezierEasing(0.75f, 0f, 0.67f, 1f)   // close: BOG UI addition, the open curve mirrored

@Composable
fun BogSheetHost(visible: Boolean, sheet: @Composable () -> Unit) {
    val y = remember { Animatable(788f) }   // resting below the screen (dp)
    var heightDp by remember { mutableFloatStateOf(0f) }
    val density = LocalDensity.current
    LaunchedEffect(visible) {
        if (visible) {
            y.snapTo(788f)
            y.animateTo(-20f, tween(300, easing = RiseEasing))
            y.animateTo(0f, tween(250, easing = SettleEasing))
        } else if (y.value != 788f) {
            y.animateTo(heightDp + 24f, tween(250, easing = CloseEasing))   // drops its own height + 24dp
            y.snapTo(788f)
        }
    }
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.BottomCenter) {
        Box(
            Modifier
                .onSizeChanged { heightDp = with(density) { it.height.toDp().value } }
                .graphicsLayer { translationY = y.value * this.density }
        ) { sheet() }
    }
}
// Pair it with your scrim: fade in 280ms on open, out in 200ms (linear) on close. Keep the sheet's background
// extending ~24dp below it for the overshoot.
// Compose follows the system "Remove animations" setting (animator duration scale 0) automatically.`
  };

  host.innerHTML =
    '<h2 id="motion">Motion</h2>' +
    '<p class="lead">' + NAME + " opens its options in a Bottom Sheet, with the same motion: the sheet rises from below the screen, overshoots its spot by 20 px and settles back; picking an option closes it with a quick accelerating drop while the overlay fades. " +
    'Source: <a href="' + FIG + '" target="_blank" rel="noopener">Chat Motion Guidelines › Action Sheet ↗</a></p>' +
    '<div class="panel"><div class="motion-tabs" role="tablist">' +
      '<button role="tab" data-tab="design" aria-selected="true">Designers</button><button role="tab" data-tab="ios">iOS · SwiftUI</button>' +
      '<button role="tab" data-tab="android">Android · Compose</button><button role="tab" data-tab="web">Web</button></div>' +
    '<section class="motion-pane" data-pane="design">' + DESIGN + "</section>" +
    '<section class="motion-pane" data-pane="ios" hidden><p>Present the options with the same presenter as the Bottom Sheet: it keeps the sheet below the screen and plays the two-step rise. iOS 17+ (for the <code>completion</code>).</p><pre><code data-sm-snippet="ios"></code></pre>' + btns("ios") + "</section>" +
    '<section class="motion-pane" data-pane="android" hidden><p>Host the options sheet in the same composable as the Bottom Sheet: one <code>Animatable</code> for the sheet\'s offset.</p><pre><code data-sm-snippet="android"></code></pre>' + btns("android") + "</section>" +
    '<section class="motion-pane" data-pane="web" hidden><p>Built into <code>bog-ui.js</code>: the sheet the field opens plays it — nothing to call.</p><pre><code data-sm-snippet="web"></code></pre>' + btns("web") + "</section></div>";
  host.querySelectorAll("[data-sm-snippet]").forEach(function (c) { c.textContent = CODE[c.getAttribute("data-sm-snippet")]; });

  // Tabs (shareable via #motion-ios etc.) + copy buttons
  var tabs = host.querySelectorAll(".motion-tabs [data-tab]");
  function openTab(name) {
    tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t.getAttribute("data-tab") === name)); });
    host.querySelectorAll(".motion-pane").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== name; });
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { openTab(t.getAttribute("data-tab")); history.replaceState(null, "", "#motion-" + t.getAttribute("data-tab")); }); });
  var fromHash = location.hash.match(/^#motion-(design|ios|android|web)$/);
  if (fromHash) { openTab(fromHash[1]); document.getElementById("motion").scrollIntoView(); }
  else if (location.hash === "#motion") document.getElementById("motion").scrollIntoView();
  function copy(btn, text) {
    navigator.clipboard.writeText(text).then(function () { var was = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = was; }, 1200); });
  }
  host.addEventListener("click", function (e) {
    var link = e.target.closest("[data-sm-link]"), code = e.target.closest("[data-sm-copy]");
    if (link) copy(link, location.href.split("#")[0] + "#motion-" + link.getAttribute("data-sm-link"));
    if (code) { var k = code.getAttribute("data-sm-copy"); copy(code, k === "design" ? SPEC_TEXT : CODE[k]); }
  });
})();
