/* BOG UI docs — "Motion · Focus & error" section, shared by every input page
   (Text, Number, Currency, Password, Phone). Put <div id="input-motion"></div> where it should go
   and load this file after bog-ui.js. The motion itself lives in bog-ui.js + text-input.css. */
(function () {
  var host = document.getElementById("input-motion");
  if (!host) return;

  var FIGMA = "https://www.figma.com/design/LCAlFnhOdhc9q4LDoajuhw/Component-Motion-Guidelines?node-id=";
  var SRC = { active: FIGMA + "2274-961", error: FIGMA + "2274-2662", message: FIGMA + "3090-12182" };

  // ---- Styles (this section only) -------------------------------------------
  var style = document.createElement("style");
  style.textContent = [
    ".im-note { margin: 0 0 20px; color: var(--docs-muted); font-size: 14px; }",
    ".im-page { position: absolute; inset: 88px 0 0; display: flex; flex-direction: column; gap: 16px; padding: 24px 16px 0; background: #fff; }",
    ".im-page__title { margin: 0; font: 600 20px/28px var(--font-family-bog); }",
    ".im-page__fields { display: flex; flex-direction: column; gap: 16px; }",
    ".im-page__bar { margin: auto -16px 0; padding: 16px 16px 34px; }",
    ".im-tabs { display: flex; margin: 0 0 16px; border-bottom: 1px solid var(--docs-line); }",
    ".im-tabs button { margin-bottom: -1px; padding: 10px 16px; border: 0; border-bottom: 2px solid transparent; background: none; font: inherit; font-size: 14px; font-weight: 600; color: var(--docs-muted); cursor: pointer; }",
    ".im-tabs button[aria-selected='true'] { border-bottom-color: var(--docs-accent); color: var(--docs-fg); }",
    ".im-pane[hidden] { display: none; }",
    ".im-pane > p, .im-pane li { max-width: 760px; font-size: 14px; line-height: 22px; }",
    ".im-pane h3 { margin: 28px 0 8px; font-size: 15px; }",
    ".im-pane h3 a { margin-left: 8px; color: var(--text-accent); font-size: 12px; font-weight: 600; }",
    ".im-actions { display: flex; gap: 8px; margin: 16px 0 0; }",
    ".im-spec { border-spacing: 0; width: 100%; font-size: 13px; }",
    ".im-spec th, .im-spec td { padding: 8px 12px; border-bottom: 1px solid var(--docs-line); text-align: left; vertical-align: top; }",
    ".im-spec td code { white-space: nowrap; }",
    ".im-tl { display: grid; grid-template-columns: 190px 1fr; gap: 8px 16px; align-items: center; max-width: 820px; font-size: 13px; }",
    ".im-tl__track { position: relative; height: 22px; border-radius: 6px; background: repeating-linear-gradient(90deg, var(--docs-line) 0 1px, transparent 1px 10%); }",
    ".im-tl__bar { position: absolute; top: 3px; bottom: 3px; overflow: hidden; border-radius: 4px; background: var(--text-accent); color: #fff; font-size: 10px; line-height: 16px; text-align: center; white-space: nowrap; }",
    ".im-tl__bar[data-kind='fade'] { background: var(--docs-muted); }",
    ".im-tl__bar[data-kind='color'] { background: #da1e28; }",
    ".im-tl__axis { display: flex; justify-content: space-between; color: var(--docs-muted); font-size: 11px; }"
  ].join("\n");
  document.head.appendChild(style);

  // ---- Data ---------------------------------------------------------------
  // Timelines: [label, [[start, length], …], kind]
  var TL_FOCUS = [
    ["Container · Border opacity", [[0, 250]], "fade"],
    ["Label · Scale 143 → 95 → 100%", [[0, 100], [100, 100]], "move"],
    ["Label · Position Y −9.14, +0.33", [[0, 100], [100, 100]], "move"],
    ["Placeholder · Scale 80 → 105 → 100%", [[17, 100], [117, 100]], "move"],
    ["Placeholder · Position Y −11, +1", [[17, 100], [117, 100]], "move"],
    ["Placeholder · Opacity", [[17, 150]], "fade"],
    ["Caret · Opacity", [[17, 150]], "fade"]
  ];
  var TL_ERROR = [
    ["Container · Color → red", [[0, 100]], "color"],
    ["Container · Stroke 1.6 → 3 → 1.6", [[0, 100], [100, 250]], "move"],
    ["Container · Position X shake", [[0, 150], [150, 150], [300, 150]], "move"],
    ["Error message · Position Y", [[17, 150], [167, 150]], "move"],
    ["Error message · Opacity", [[17, 150]], "fade"]
  ];
  var TL_MESSAGE = [
    ["Helper text · Position Y +8.62", [[0, 167]], "move"],
    ["Helper text · Opacity", [[0, 83]], "fade"],
    ["Error text · Position Y +4.58", [[50, 167]], "move"],
    ["Error text · Opacity", [[50, 83]], "fade"]
  ];

  // Spec rows: [layer, property, keyframes, timing, easing]
  var SPEC_FOCUS = [
    ["Container", "Border opacity (1.6 px, width fixed)", "0 → 100%", "0–250 ms", "0.33, 0, 0.16, 1"],
    ["Label", "Scale", "143% → 95% → 100%", "0–100 · 100–200 ms", "0.33, 0, 0.67, 1"],
    ["Label", "Position Y", "+8.8 → −0.34 → 0 (rises 9.14, settles 0.33)", "0–100 · 100–200 ms", "0.33, 0, 0.67, 1"],
    ["Placeholder", "Scale", "80% → 105% → 100%", "17–117 · 117–217 ms", "0.33, 0, 0.26, 1 → 0.17, 0, 0.83, 1"],
    ["Placeholder", "Position Y", "+10 → −1 → 0", "17–117 · 117–217 ms", "0.33, 0, 0.17, 1"],
    ["Placeholder", "Opacity", "0 → 100%", "17–167 ms", "0.33, 0, 0.17, 1"],
    ["Caret", "Opacity (no scale, no movement)", "0 → 100%", "17–167 ms", "0.33, 0, 0.17, 1"]
  ];
  var SPEC_ERROR = [
    ["Container", "Stroke color", "#515457 → #DA1E28", "0–100 ms", "Linear"],
    ["Container", "Stroke width", "1.6 → 3 → 1.6", "0–100 · 100–350 ms", "0.33, 0, 0.67, 1"],
    ["Container", "Position X", "0 → +3.33 → −3.33 → 0", "0–150 · 150–300 · 300–450 ms", "0.33, 0, 0.27, 1"],
    ["Error message", "Position Y", "−3.17 → +3.33 → 0", "17–167 · 167–317 ms", "0.33, 0, 0.21, 1"],
    ["Error message", "Opacity", "0 → 100%", "17–167 ms", "0.33, 0, 0.21, 1"]
  ];
  var SPEC_MESSAGE = [
    ["Helper text", "Position Y", "0 → +8.62 (drops away)", "0–167 ms", "0.33, 0, 0, 1"],
    ["Helper text", "Opacity", "100% → 0", "0–83 ms", "0.33, 0, 0, 1"],
    ["Error text", "Position Y", "−4.58 → 0 (drops in)", "50–217 ms", "0.33, 0, 0.07, 1"],
    ["Error text", "Opacity", "0 → 100%", "50–133 ms", "0.33, 0, 0.67, 1"]
  ];

  var SPEC_TEXT = [
    "Input motion · Default ⇄ Active, Error (Text, Number, Currency, Password, Phone)",
    "Active:  " + SRC.active, "Error:   " + SRC.error, "Message → Error: " + SRC.message,
    "Units: px = pt = dp. Scale pivots on the left edge (label, placeholder).",
    "",
    "DEFAULT → ACTIVE (250 ms) — label, placeholder and caret move only when the field is empty"
  ].concat(SPEC_FOCUS.map(row), [
    "ACTIVE → DEFAULT — the same keyframes played backwards (mirrored curves), 250 ms",
    "",
    "ERROR (450 ms) — field turns Error with no message before"
  ], SPEC_ERROR.map(row), [
    "",
    "HELPER TEXT → ERROR TEXT — when the field already showed a helper message (replaces the Error message rows above)"
  ], SPEC_MESSAGE.map(row), [
    "",
    "Caret: opacity only, timed with the placeholder fade (the guide's caret scale and movement are not used).",
    "Reduce Motion: change states instantly."
  ]).join("\n");
  function row(r) { return "  " + pad(r[0], 14) + pad(r[1], 13) + pad(r[2], 40) + pad(r[3], 30) + r[4]; }
  function pad(s, n) { s = String(s); while (s.length < n) s += " "; return s; }

  // ---- Platform code --------------------------------------------------------
  var CODE = {};
  CODE.ios = [
    "import SwiftUI",
    "",
    "// Component Motion Guidelines › Input Active (2274:961), Input Error (2274:2662), Message → Error (3090:12182)",
    "// Active → Default plays Default → Active backwards (same keyframes, mirrored curves). iOS 17+.",
    "private func curve(_ x1: Double, _ y1: Double, _ x2: Double, _ y2: Double, _ ms: Double, delay: Double = 0) -> Animation {",
    "    .timingCurve(x1, y1, x2, y2, duration: ms / 1000).delay(delay / 1000)",
    "}",
    "private func reversed(_ x1: Double, _ y1: Double, _ x2: Double, _ y2: Double, _ ms: Double, delay: Double = 0) -> Animation {",
    "    curve(1 - x2, 1 - y2, 1 - x1, 1 - y1, ms, delay: delay)",
    "}",
    "",
    "struct BOGTextField: View {",
    "    let label: String",
    "    var placeholder = \"\"",
    "    @Binding var text: String",
    "    var helper: String? = nil",
    "    var errorMessage: String? = nil          // non-nil = Error state",
    "",
    "    @FocusState private var focused: Bool",
    "    @Environment(\\.accessibilityReduceMotion) private var reduceMotion",
    "",
    "    // The label is drawn at its floated size (11pt). At rest it's scaled to 16pt and sits half the value row lower.",
    "    private let restScale = CGFloat(16.0 / 11.0)",
    "    private let restY = CGFloat(10)",
    "    private let neutral = Color(red: 81 / 255, green: 84 / 255, blue: 87 / 255)   // Border / Selected neutral strong",
    "    private let red = Color(red: 218 / 255, green: 30 / 255, blue: 40 / 255)      // Border / Error",
    "",
    "    @State private var labelScale = CGFloat(16.0 / 11.0)",
    "    @State private var labelY = CGFloat(10)",
    "    @State private var phScale = CGFloat(0.8)",
    "    @State private var phY = CGFloat(10)",
    "    @State private var phOpacity = 0.0",
    "    @State private var ringWidth = CGFloat(1.6)   // focus border: only its opacity animates",
    "    @State private var ringOpacity = 0.0",
    "    @State private var ringColor = Color(red: 81 / 255, green: 84 / 255, blue: 87 / 255)",
    "    @State private var shakeX = CGFloat(0)",
    "    @State private var helperY = CGFloat(0)",
    "    @State private var helperOpacity = 1.0",
    "    @State private var errorY = CGFloat(-3.17)",
    "    @State private var errorOpacity = 0.0",
    "",
    "    var body: some View {",
    "        VStack(alignment: .leading, spacing: 8) {",
    "            VStack(alignment: .leading, spacing: 0) {",
    "                Text(label)",
    "                    .font(.system(size: 11, weight: .medium))",
    "                    .foregroundStyle(.secondary)",
    "                    .scaleEffect(labelScale, anchor: .leading)",
    "                    .offset(y: labelY)",
    "                ZStack(alignment: .leading) {",
    "                    Text(placeholder)",
    "                        .foregroundStyle(.tertiary)",
    "                        .scaleEffect(phScale, anchor: .leading)",
    "                        .offset(y: phY)",
    "                        .opacity(text.isEmpty ? phOpacity : 0)",
    "                    TextField(\"\", text: $text).focused($focused)   // system caret: can't be animated",
    "                }",
    "                .font(.system(size: 16, weight: .medium))",
    "                .frame(height: 20)",
    "            }",
    "            .padding(.horizontal, 16)",
    "            .frame(maxWidth: .infinity, minHeight: 56, alignment: .leading)",
    "            .background(Color.black.opacity(0.04), in: RoundedRectangle(cornerRadius: 12))",
    "            .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(ringColor.opacity(ringOpacity), lineWidth: ringWidth))",
    "            .offset(x: shakeX)",
    "            .contentShape(Rectangle())",
    "            .onTapGesture { focused = true }",
    "",
    "            ZStack(alignment: .topLeading) {",
    "                if let helper {",
    "                    Text(helper).foregroundStyle(.secondary).offset(y: helperY).opacity(helperOpacity)",
    "                }",
    "                Label(errorMessage ?? \" \", systemImage: \"exclamationmark.circle.fill\")",
    "                    .foregroundStyle(red).offset(y: errorY).opacity(errorOpacity)",
    "            }",
    "            .font(.system(size: 12, weight: .semibold))",
    "            .padding(.leading, 16)",
    "        }",
    "        .onAppear {",
    "            if !text.isEmpty { labelScale = 1; labelY = 0 }",
    "            errorY = helper == nil ? -3.17 : -4.58",
    "        }",
    "        .onChange(of: focused) { _, on in",
    "            if reduceMotion { snapFocus(on) } else { animateFocus(on) }",
    "        }",
    "        .onChange(of: errorMessage != nil) { _, isError in",
    "            if !isError { clearError() } else if reduceMotion { snapError() } else { animateError() }",
    "        }",
    "    }",
    "",
    "    // Default → Active, and the same keyframes backwards for Active → Default (ending 250ms after the change)",
    "    private func animateFocus(_ on: Bool) {",
    "        if errorMessage == nil {",
    "            withAnimation(on ? curve(0.33, 0, 0.16, 1, 250) : reversed(0.33, 0, 0.16, 1, 250)) { ringOpacity = on ? 1 : 0 }",
    "        }",
    "        guard text.isEmpty else { return }",
    "        if on {",
    "            withAnimation(curve(0.33, 0, 0.67, 1, 100)) { labelScale = 0.95; labelY = -0.34 } completion: {",
    "                withAnimation(curve(0.33, 0, 0.67, 1, 100)) { labelScale = 1; labelY = 0 }",
    "            }",
    "            withAnimation(curve(0.33, 0, 0.26, 1, 100, delay: 17)) { phScale = 1.05 } completion: {",
    "                withAnimation(curve(0.17, 0, 0.83, 1, 100)) { phScale = 1 }",
    "            }",
    "            withAnimation(curve(0.33, 0, 0.17, 1, 100, delay: 17)) { phY = -1 } completion: {",
    "                withAnimation(curve(0.33, 0, 0.17, 1, 100)) { phY = 0 }",
    "            }",
    "            withAnimation(curve(0.33, 0, 0.17, 1, 150, delay: 17)) { phOpacity = 1 }",
    "        } else {",
    "            withAnimation(reversed(0.33, 0, 0.67, 1, 100, delay: 50)) { labelScale = 0.95; labelY = -0.34 } completion: {",
    "                withAnimation(reversed(0.33, 0, 0.67, 1, 100)) { labelScale = restScale; labelY = restY }",
    "            }",
    "            withAnimation(reversed(0.17, 0, 0.83, 1, 100, delay: 33)) { phScale = 1.05 } completion: {",
    "                withAnimation(reversed(0.33, 0, 0.26, 1, 100)) { phScale = 0.8 }",
    "            }",
    "            withAnimation(reversed(0.33, 0, 0.17, 1, 100, delay: 33)) { phY = -1 } completion: {",
    "                withAnimation(reversed(0.33, 0, 0.17, 1, 100)) { phY = 10 }",
    "            }",
    "            withAnimation(reversed(0.33, 0, 0.17, 1, 150, delay: 83)) { phOpacity = 0 }",
    "        }",
    "    }",
    "",
    "    private func snapFocus(_ on: Bool) {",
    "        let isError = errorMessage != nil",
    "        ringWidth = on || !isError ? 1.6 : 1; ringOpacity = on || isError ? 1 : 0",
    "        guard text.isEmpty else { return }",
    "        labelScale = on ? 1 : restScale; labelY = on ? 0 : restY",
    "        phScale = on ? 1 : 0.8; phY = on ? 0 : 10; phOpacity = on ? 1 : 0",
    "    }",
    "",
    "    // Error: border → red (100ms, linear) and 3pt → resting width, a 3.33pt shake, then the message",
    "    private func animateError() {",
    "        let restWidth: CGFloat = focused ? 1.6 : 1",
    "        ringOpacity = 1",
    "        withAnimation(.linear(duration: 0.1)) { ringColor = red }",
    "        withAnimation(curve(0.33, 0, 0.67, 1, 100)) { ringWidth = 3 } completion: {",
    "            withAnimation(curve(0.33, 0, 0.67, 1, 250)) { ringWidth = restWidth }",
    "        }",
    "        withAnimation(curve(0.33, 0, 0.27, 1, 150)) { shakeX = 3.33 } completion: {",
    "            withAnimation(curve(0.33, 0, 0.27, 1, 150)) { shakeX = -3.33 } completion: {",
    "                withAnimation(curve(0.33, 0, 0.27, 1, 150)) { shakeX = 0 }",
    "            }",
    "        }",
    "        if helper != nil {",
    "            // Helper text drops away, the error text drops in 50ms later",
    "            withAnimation(curve(0.33, 0, 0, 1, 167)) { helperY = 8.62 }",
    "            withAnimation(curve(0.33, 0, 0, 1, 83)) { helperOpacity = 0 }",
    "            withAnimation(curve(0.33, 0, 0.07, 1, 167, delay: 50)) { errorY = 0 }",
    "            withAnimation(curve(0.33, 0, 0.67, 1, 83, delay: 50)) { errorOpacity = 1 }",
    "        } else {",
    "            withAnimation(curve(0.33, 0, 0.21, 1, 150, delay: 17)) { errorY = 3.33; errorOpacity = 1 } completion: {",
    "                withAnimation(curve(0.33, 0, 0.21, 1, 150)) { errorY = 0 }",
    "            }",
    "        }",
    "    }",
    "",
    "    private func snapError() {",
    "        ringOpacity = 1; ringColor = red; ringWidth = focused ? 1.6 : 1",
    "        helperOpacity = 0; errorY = 0; errorOpacity = 1",
    "    }",
    "",
    "    // The guides define no motion for clearing an error: back to the resting pose",
    "    private func clearError() {",
    "        ringColor = neutral; ringWidth = 1.6; ringOpacity = focused ? 1 : 0",
    "        helperY = 0; helperOpacity = 1",
    "        errorOpacity = 0; errorY = helper == nil ? -3.17 : -4.58",
    "    }",
    "}",
    "",
    "// Usage",
    "// @State private var email = \"\"",
    "// @State private var emailError: String? = nil",
    "// BOGTextField(label: \"Email\", placeholder: \"name@mail.com\", text: $email,",
    "//              helper: \"We'll send the receipt here\", errorMessage: emailError)"
  ].join("\n");

  CODE.android = [
    "import androidx.compose.animation.Animatable as ColorAnimatable",
    "import androidx.compose.animation.core.Animatable",
    "import androidx.compose.animation.core.CubicBezierEasing",
    "import androidx.compose.animation.core.LinearEasing",
    "import androidx.compose.animation.core.tween",
    "import androidx.compose.foundation.background",
    "import androidx.compose.foundation.border",
    "import androidx.compose.foundation.interaction.MutableInteractionSource",
    "import androidx.compose.foundation.interaction.collectIsFocusedAsState",
    "import androidx.compose.foundation.layout.*",
    "import androidx.compose.foundation.shape.RoundedCornerShape",
    "import androidx.compose.foundation.text.BasicTextField",
    "import androidx.compose.material3.Text",
    "import androidx.compose.runtime.*",
    "import androidx.compose.ui.Alignment",
    "import androidx.compose.ui.Modifier",
    "import androidx.compose.ui.graphics.Color",
    "import androidx.compose.ui.graphics.TransformOrigin",
    "import androidx.compose.ui.graphics.graphicsLayer",
    "import androidx.compose.ui.text.TextStyle",
    "import androidx.compose.ui.text.font.FontWeight",
    "import androidx.compose.ui.unit.dp",
    "import androidx.compose.ui.unit.sp",
    "import kotlinx.coroutines.coroutineScope",
    "import kotlinx.coroutines.launch",
    "",
    "// Component Motion Guidelines › Input Active (2274:961), Input Error (2274:2662), Message → Error (3090:12182)",
    "// Active → Default plays Default → Active backwards (same keyframes, mirrored curves).",
    "private fun t(ms: Int, x1: Float, y1: Float, x2: Float, y2: Float, delay: Int = 0, back: Boolean = false) =",
    "    if (back) tween<Float>(ms, delay, CubicBezierEasing(1 - x2, 1 - y2, 1 - x1, 1 - y1))",
    "    else tween<Float>(ms, delay, CubicBezierEasing(x1, y1, x2, y2))",
    "",
    "private val Neutral = Color(0xFF515457)    // Border / Selected neutral strong",
    "private val ErrorRed = Color(0xFFDA1E28)   // Border / Error",
    "private const val REST_SCALE = 16f / 11f   // the label is drawn at 11sp; at rest it's scaled to 16sp…",
    "private const val REST_Y = 10f             // …and sits half the value row lower (dp)",
    "",
    "@Composable",
    "fun BogTextField(",
    "    label: String,",
    "    value: String,",
    "    onValueChange: (String) -> Unit,",
    "    placeholder: String = \"\",",
    "    helper: String? = null,",
    "    errorMessage: String? = null,   // non-null = Error state",
    ") {",
    "    val interaction = remember { MutableInteractionSource() }",
    "    val focused by interaction.collectIsFocusedAsState()",
    "    val isError = errorMessage != null",
    "    val restErrorY = if (helper == null) -3.17f else -4.58f",
    "",
    "    val labelScale = remember { Animatable(if (value.isEmpty()) REST_SCALE else 1f) }",
    "    val labelY = remember { Animatable(if (value.isEmpty()) REST_Y else 0f) }",
    "    val phScale = remember { Animatable(0.8f) }",
    "    val phY = remember { Animatable(10f) }",
    "    val phAlpha = remember { Animatable(0f) }",
    "    val ringW = remember { Animatable(1.6f) }   // focus border: only its opacity animates",
    "    val ringA = remember { Animatable(0f) }",
    "    val ringColor = remember { ColorAnimatable(Neutral) }",
    "    val shakeX = remember { Animatable(0f) }",
    "    val helperY = remember { Animatable(0f) }",
    "    val helperA = remember { Animatable(1f) }",
    "    val errorY = remember { Animatable(restErrorY) }",
    "    val errorA = remember { Animatable(0f) }",
    "",
    "    // Default → Active, and the same keyframes backwards for Active → Default (ending 250ms after the change)",
    "    var focusSeen by remember { mutableStateOf(false) }",
    "    LaunchedEffect(focused) {",
    "        if (!focusSeen) { focusSeen = true; return@LaunchedEffect }",
    "        val back = !focused",
    "        coroutineScope {",
    "            if (!isError) {",
    "                launch { ringA.animateTo(if (focused) 1f else 0f, t(250, .33f, 0f, .16f, 1f, 0, back)) }",
    "            }",
    "            if (value.isEmpty() && focused) {",
    "                launch { labelScale.animateTo(.95f, t(100, .33f, 0f, .67f, 1f)); labelScale.animateTo(1f, t(100, .33f, 0f, .67f, 1f)) }",
    "                launch { labelY.animateTo(-.34f, t(100, .33f, 0f, .67f, 1f)); labelY.animateTo(0f, t(100, .33f, 0f, .67f, 1f)) }",
    "                launch { phScale.animateTo(1.05f, t(100, .33f, 0f, .26f, 1f, 17)); phScale.animateTo(1f, t(100, .17f, 0f, .83f, 1f)) }",
    "                launch { phY.animateTo(-1f, t(100, .33f, 0f, .17f, 1f, 17)); phY.animateTo(0f, t(100, .33f, 0f, .17f, 1f)) }",
    "                launch { phAlpha.animateTo(1f, t(150, .33f, 0f, .17f, 1f, 17)) }",
    "            } else if (value.isEmpty()) {",
    "                launch { labelScale.animateTo(.95f, t(100, .33f, 0f, .67f, 1f, 50, true)); labelScale.animateTo(REST_SCALE, t(100, .33f, 0f, .67f, 1f, 0, true)) }",
    "                launch { labelY.animateTo(-.34f, t(100, .33f, 0f, .67f, 1f, 50, true)); labelY.animateTo(REST_Y, t(100, .33f, 0f, .67f, 1f, 0, true)) }",
    "                launch { phScale.animateTo(1.05f, t(100, .17f, 0f, .83f, 1f, 33, true)); phScale.animateTo(.8f, t(100, .33f, 0f, .26f, 1f, 0, true)) }",
    "                launch { phY.animateTo(-1f, t(100, .33f, 0f, .17f, 1f, 33, true)); phY.animateTo(10f, t(100, .33f, 0f, .17f, 1f, 0, true)) }",
    "                launch { phAlpha.animateTo(0f, t(150, .33f, 0f, .17f, 1f, 83, true)) }",
    "            }",
    "        }",
    "    }",
    "",
    "    // Error: border → red (100ms, linear) and 3dp → resting width, a 3.33dp shake, then the message",
    "    var errorSeen by remember { mutableStateOf(false) }",
    "    LaunchedEffect(isError) {",
    "        if (!errorSeen) { errorSeen = true; return@LaunchedEffect }",
    "        if (isError) coroutineScope {",
    "            ringA.snapTo(1f)",
    "            launch { ringColor.animateTo(ErrorRed, tween(100, easing = LinearEasing)) }",
    "            launch { ringW.animateTo(3f, t(100, .33f, 0f, .67f, 1f)); ringW.animateTo(if (focused) 1.6f else 1f, t(250, .33f, 0f, .67f, 1f)) }",
    "            launch { for (x in listOf(3.33f, -3.33f, 0f)) shakeX.animateTo(x, t(150, .33f, 0f, .27f, 1f)) }",
    "            if (helper != null) {   // helper text drops away, the error text drops in 50ms later",
    "                launch { helperY.animateTo(8.62f, t(167, .33f, 0f, 0f, 1f)) }",
    "                launch { helperA.animateTo(0f, t(83, .33f, 0f, 0f, 1f)) }",
    "                launch { errorY.animateTo(0f, t(167, .33f, 0f, .07f, 1f, 50)) }",
    "                launch { errorA.animateTo(1f, t(83, .33f, 0f, .67f, 1f, 50)) }",
    "            } else {",
    "                launch { errorY.animateTo(3.33f, t(150, .33f, 0f, .21f, 1f, 17)); errorY.animateTo(0f, t(150, .33f, 0f, .21f, 1f)) }",
    "                launch { errorA.animateTo(1f, t(150, .33f, 0f, .21f, 1f, 17)) }",
    "            }",
    "        } else {",
    "            // The guides define no motion for clearing an error: back to the resting pose",
    "            ringColor.snapTo(Neutral); ringW.snapTo(1.6f); ringA.snapTo(if (focused) 1f else 0f)",
    "            helperY.snapTo(0f); helperA.snapTo(1f); errorA.snapTo(0f); errorY.snapTo(restErrorY)",
    "        }",
    "    }",
    "",
    "    val shape = RoundedCornerShape(12.dp)",
    "    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {",
    "        BasicTextField(",
    "            value = value,",
    "            onValueChange = onValueChange,",
    "            singleLine = true,",
    "            interactionSource = interaction,",
    "            textStyle = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.Medium),",
    "            modifier = Modifier.fillMaxWidth().graphicsLayer { translationX = shakeX.value * density },",
    "            decorationBox = { inner ->",
    "                Column(",
    "                    Modifier",
    "                        .fillMaxWidth()",
    "                        .heightIn(min = 56.dp)",
    "                        .background(Color(0x0A000000), shape)",
    "                        .then(if (ringW.value > 0f) Modifier.border(ringW.value.dp, ringColor.value.copy(alpha = ringA.value), shape) else Modifier)",
    "                        .padding(horizontal = 16.dp),",
    "                    verticalArrangement = Arrangement.Center,",
    "                ) {",
    "                    Text(label, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Color.Gray,",
    "                        modifier = Modifier.graphicsLayer {",
    "                            transformOrigin = TransformOrigin(0f, 0.5f)",
    "                            scaleX = labelScale.value; scaleY = labelScale.value",
    "                            translationY = labelY.value * density",
    "                        })",
    "                    Box(Modifier.height(20.dp), contentAlignment = Alignment.CenterStart) {",
    "                        if (value.isEmpty()) Text(placeholder, fontSize = 16.sp, color = Color.Gray.copy(alpha = .6f),",
    "                            modifier = Modifier.graphicsLayer {",
    "                                transformOrigin = TransformOrigin(0f, 0.5f)",
    "                                scaleX = phScale.value; scaleY = phScale.value",
    "                                translationY = phY.value * density",
    "                                alpha = phAlpha.value",
    "                            })",
    "                        inner()   // system cursor: can't be animated",
    "                    }",
    "                }",
    "            },",
    "        )",
    "        Box(Modifier.padding(start = 16.dp)) {",
    "            if (helper != null) Text(helper, fontSize = 12.sp, color = Color.Gray,",
    "                modifier = Modifier.graphicsLayer { translationY = helperY.value * density; alpha = helperA.value })",
    "            Text(errorMessage ?: \"\", fontSize = 12.sp, color = ErrorRed,",
    "                modifier = Modifier.graphicsLayer { translationY = errorY.value * density; alpha = errorA.value })",
    "        }",
    "    }",
    "}",
    "// Compose follows the system \"Remove animations\" setting (animator duration scale 0) automatically.",
    "",
    "// Usage",
    "// var email by remember { mutableStateOf(\"\") }",
    "// var emailError by remember { mutableStateOf<String?>(null) }",
    "// BogTextField(\"Email\", email, { email = it }, placeholder = \"name@mail.com\",",
    "//     helper = \"We'll send the receipt here\", errorMessage = emailError)"
  ].join("\n");

  CODE.web = [
    "<!-- Built in: every .bog-field (Text, Number, Currency, Password, Phone) animates on its own. -->",
    "<!-- Default ⇄ Active runs on focus / blur. Nothing to add.                                 -->",
    "",
    "<!-- Error: set data-validation=\"error\" on .bog-field. Put the error text in .bog-field__message:  -->",
    "<!-- replace the helper text (helper → error motion) or add the element (error message motion).  -->",
    "<script>",
    "  const field = document.getElementById(\"email-field\");",
    "  field.dataset.validation = \"error\";",
    "  field.querySelector(\".bog-field__message\").textContent = \"Enter a valid email address\";",
    "<\/script>",
    "",
    "<!-- Clearing an error has no motion in the guides: remove the attribute and restore the text. -->",
    "<!-- Under prefers-reduced-motion: reduce every change is instant.                           -->"
  ].join("\n");

  // ---- Markup -------------------------------------------------------------
// ---- Phone preview fields: the page's own input type -----------------------------
// a: no message (error message drops in) · b: helper text (helper → error text)
var PAGE = (document.getElementById("bog-nav") || host).getAttribute("data-current") || "text-input";
var DEMOS = {
  "text-input": { title: "Personal details", a: ["Full name", "Name Surname", "This field is required"], b: ["Email", "name@mail.com", "Enter a valid email address", "We'll send the receipt here"] },
  "number-input": { title: "Booking", a: ["Passengers", " ", "Add at least one passenger"], b: ["Tickets", " ", "You can book up to 10 tickets", "Up to 10 per order"] },
  "currency-input": { title: "Transfer", a: ["Amount", "0.00", "Enter an amount"], b: ["Amount", "0.00", "Not enough money on this account", "Max 500.00 ₾"] },
  "password-input": { title: "Create password", a: ["Password", " ", "Enter your password"], b: ["New password", " ", "Password is too short", "At least 8 characters"] },
  "phone-input": { title: "Contact", a: ["Phone number", "XXX XX XX XX", "Enter your phone number"], b: ["Contact phone", "XXX XX XX XX", "Enter a valid phone number", "We'll text you a code"] }
};
var DEMO = DEMOS[PAGE] || DEMOS["text-input"];
function field(id, label, placeholder, helper) {
  var msg = helper ? '<p class="bog-field__message">' + helper + "</p>" : "";
  var input = function (attrs) { return '<input class="bog-field__input" placeholder="' + placeholder + '"' + (attrs || "") + ">"; };
  var text = function (inner) { return '<span class="bog-field__text"><span class="bog-field__label">' + label + "</span>" + inner + "</span>"; };
  if (PAGE === "number-input") {
    return '<div class="bog-field bog-number-input" id="' + id + '"><label class="bog-field__box">' + text(input(' inputmode="numeric" data-min="0" data-max="10"')) +
      '<span class="bog-number-input__stepper"><button type="button" class="bog-icon-btn" data-type="neutral" data-size="small" data-step="down" aria-label="Decrease"><span class="bog-icon" data-icon="minus"></span></button>' +
      '<button type="button" class="bog-icon-btn" data-type="neutral" data-size="small" data-step="up" aria-label="Increase"><span class="bog-icon" data-icon="plus"></span></button></span></label>' + msg + "</div>";
  }
  if (PAGE === "currency-input") {
    return '<div class="bog-field bog-currency-input" id="' + id + '"><label class="bog-field__box">' +
      text('<span class="bog-currency-input__value">' + input(' inputmode="decimal"') + '<span class="bog-currency-input__symbol">₾</span></span>') +
      '<span class="bog-currency-input__currency"><span class="bog-flag" data-size="16"><img src="../assets/flags/ge.svg" alt=""></span>GEL</span></label>' + msg + "</div>";
  }
  if (PAGE === "password-input") {
    return '<div class="bog-field bog-password-input" id="' + id + '"><label class="bog-field__box">' + text(input(' type="password"')) +
      '<button type="button" class="bog-password-input__toggle" aria-label="Show password" aria-pressed="false"></button></label>' + msg + "</div>";
  }
  if (PAGE === "phone-input") {
    return '<div class="bog-field bog-phone-input" data-format="XXX XX XX XX" id="' + id + '"><label class="bog-field__box">' + text(input(' type="tel" inputmode="tel"')) + "</label>" + msg + "</div>";
  }
  return '<div class="bog-field" id="' + id + '"><label class="bog-field__box">' + text(input()) + "</label>" + msg + "</div>";
}
  function timeline(rows, max) {
    var pct = function (ms) { return (ms / max * 100).toFixed(2) + "%"; };
    var axis = [];
    for (var i = 0; i <= 10; i++) axis.push("<span>" + Math.round(i * max / 10) + "</span>");
    return '<div class="im-tl">' + rows.map(function (r) {
      return "<span>" + r[0] + '</span><div class="im-tl__track">' + r[1].map(function (b) {
        return '<span class="im-tl__bar" data-kind="' + r[2] + '" style="left:' + pct(b[0]) + ";width:" + pct(b[1]) + '">' + b[1] + "</span>";
      }).join("") + "</div>";
    }).join("") + '<span></span><div class="im-tl__axis">' + axis.join("") + "</div></div>";
  }
  function spec(rows) {
    return '<table class="im-spec"><thead><tr><th>Layer</th><th>Property</th><th>Keyframes</th><th>Timing</th><th>Easing (cubic-bezier)</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td><td>" + r[3] + "</td><td><code>" + r[4] + "</code></td></tr>";
      }).join("") + "</tbody></table>";
  }
  function actions(tab, what) {
    return '<div class="im-actions"><button class="bog-btn" data-type="secondary" data-size="small" data-im-link="' + tab + '">Copy link</button>' +
      '<button class="bog-btn" data-type="neutral" data-size="small" data-im-copy="' + tab + '">' + what + "</button></div>";
  }

  host.innerHTML =
    '<h2 id="input-motion-section">Motion · Focus &amp; error</h2>' +
    '<p class="lead">Shared by every input (Text, Number, Currency incl. Currency Small, Password, Phone). Sources: ' +
    '<a href="' + SRC.active + '" target="_blank" rel="noopener">Input Active ↗</a> · ' +
    '<a href="' + SRC.error + '" target="_blank" rel="noopener">Input Error ↗</a> · ' +
    '<a href="' + SRC.message + '" target="_blank" rel="noopener">Message → Error ↗</a></p>' +
    '<div class="panel">' +
      '<p class="im-note">Try it in the phone on the right: tap a field (Default → Active), tap outside (Active → Default), and press Show error or Continue while a field is focused.</p>' +
      '<div class="im-tabs" role="tablist">' +
        '<button role="tab" data-im-tab="design" aria-selected="true">Designers</button>' +
        '<button role="tab" data-im-tab="ios">iOS · SwiftUI</button>' +
        '<button role="tab" data-im-tab="android">Android · Compose</button>' +
        '<button role="tab" data-im-tab="web">Web</button>' +
      "</div>" +

      '<section class="im-pane" data-im-pane="design">' +
        "<p>Every input moves the same way. <b>Default → Active</b> takes 250 ms: the 1.6 px border fades in (its width doesn't animate), the label shrinks up to the top with a small 95% undershoot, then 17 ms later the placeholder rises into place and the caret fades in. " +
        "<b>Active → Default</b> is the same motion played backwards. The label, placeholder and caret only move when the field is empty; with a value only the border animates. " +
        "<b>Error</b> turns the border red, pulses it to 3 px and shakes the field; the message either drops in, or replaces the helper text.</p>" +
        '<h3>Default → Active<a href="' + SRC.active + '" target="_blank" rel="noopener">Figma ↗</a></h3>' + timeline(TL_FOCUS, 500) + spec(SPEC_FOCUS) +
        "<p><small>The caret only fades in, timed with the placeholder fade. The guide's caret scale and movement aren't used.</small></p>" +
        "<h3>Active → Default</h3><p>The Default → Active keyframes played backwards over the same 250 ms: the caret fades out and the placeholder drops and shrinks away first, the label grows back down last, and the border fades out.</p>" +
        '<h3>Error<a href="' + SRC.error + '" target="_blank" rel="noopener">Figma ↗</a></h3>' + timeline(TL_ERROR, 500) + spec(SPEC_ERROR) +
        '<h3>Helper text → error text<a href="' + SRC.message + '" target="_blank" rel="noopener">Figma ↗</a></h3>' +
        "<p>When the field already shows a helper message, these rows replace the error message rows above.</p>" + timeline(TL_MESSAGE, 500) + spec(SPEC_MESSAGE) +
        "<h3>Rules</h3><ul>" +
          "<li>Values are in px (web) = pt (iOS) = dp (Android). Label and placeholder scale from their left edge.</li>" +
          "<li>The label's start pose matches the field's real resting label: 16 → 11 px text (145%, the guide rounds to 143%) and half the value row lower (10 px, the guide shows 8.8). This keeps the hand-off seamless.</li>" +
          "<li>Default ⇄ Active only fades the border; its width stays 1.6 px (the guide's 0 → 1.6 stroke width is not used).</li>" +
          "<li>Currency Small Input has no floating label, so it gets the border fade on focus and the Error motion only.</li>" +
          "<li>The error border settles at the field's resting width: 1.6 when focused, 1 when not.</li>" +
          "<li>Clearing an error has no motion in the guides: it switches back instantly.</li>" +
          "<li>Reduce Motion / Remove animations on: every change is instant.</li>" +
        "</ul>" + actions("design", "Copy spec as text") +
      "</section>" +

      '<section class="im-pane" data-im-pane="ios" hidden>' +
        "<p>A complete field with the three motions. Each property gets its own <code>withAnimation</code> (different durations and curves); two-step keyframes chain with <code>completion</code> (iOS 17+). The system caret can't be animated in SwiftUI, so only the web version draws the caret motion.</p>" +
        '<pre><code data-im-code="ios"></code></pre>' + actions("ios", "Copy code") +
      "</section>" +

      '<section class="im-pane" data-im-pane="android" hidden>' +
        "<p>A complete field with the three motions, one <code>Animatable</code> per property. Like on iOS, the system cursor isn't animated.</p>" +
        '<pre><code data-im-code="android"></code></pre>' + actions("android", "Copy code") +
      "</section>" +

      '<section class="im-pane" data-im-pane="web" hidden>' +
        "<p>Built into <code>bog-ui.js</code> + <code>text-input.css</code>, so prototypes get it for free.</p>" +
        '<pre><code data-im-code="web"></code></pre>' + actions("web", "Copy code") +
      "</section>" +
    "</div>";
  host.querySelectorAll("[data-im-code]").forEach(function (c) { c.textContent = CODE[c.getAttribute("data-im-code")]; });

// ---- Phone preview on the right (shared .docs-split / .docs-phone styles in docs.css) -------
var main = host.closest("main");
if (main && !main.classList.contains("docs-split")) {
  var content = document.createElement("div");
  while (main.firstChild) content.appendChild(main.firstChild);
  main.classList.add("docs-split");
  main.appendChild(content);
}
var aside = document.createElement("aside");
aside.className = "docs-preview";
aside.setAttribute("aria-label", "Mobile preview");
aside.innerHTML =
  '<div class="docs-preview__controls">' +
    '<button class="bog-btn" data-type="negative-secondary" data-size="small" id="im-error">Show error</button>' +
    '<button class="bog-btn" data-type="neutral" data-size="small" id="im-clear">Clear error</button>' +
  "</div>" +
  '<div class="docs-preview__controls"><label><input type="checkbox" id="im-slow"> Slow motion (×10)</label></div>' +
  '<div class="docs-phone">' +
    '<div class="docs-phone__status"><span>9:41</span><span>●●●</span></div>' +
    '<div class="docs-phone__nav"><span class="bog-icon-btn" data-type="neutral" data-size="small"><span class="bog-icon" data-icon="chevron-right"></span></span>' + DEMO.title + "</div>" +
    '<div class="im-page"><div class="im-page__fields">' +
      field("im-a", DEMO.a[0], DEMO.a[1]) + field("im-b", DEMO.b[0], DEMO.b[1], DEMO.b[3]) +
    '</div><div class="im-page__bar"><button class="bog-btn" data-type="primary" data-width="fill" id="im-continue">Continue</button></div></div>' +
  "</div>" +
  "<small>375 × 812 · tap a field, then Show error or Continue. The top field has no message, the bottom one has helper text.</small>";
(main || host.parentNode).appendChild(aside);

// ---- Demo -------------------------------------------------------------------
var a = document.getElementById("im-a"), b = document.getElementById("im-b");
var HELPER = DEMO.b[3];
  function keepFocus(e) { e.preventDefault(); }   // so the error shows on a focused field, like the guide
  document.getElementById("im-error").addEventListener("mousedown", keepFocus);
  document.getElementById("im-clear").addEventListener("mousedown", keepFocus);
  document.getElementById("im-continue").addEventListener("mousedown", keepFocus);
  function showError() {
    if (!a.querySelector(".bog-field__message")) {
      var m = document.createElement("p");
      m.className = "bog-field__message";
      m.textContent = DEMO.a[2];
      a.appendChild(m);
    }
    a.setAttribute("data-validation", "error");
    b.querySelector(".bog-field__message").textContent = DEMO.b[2];
    b.setAttribute("data-validation", "error");
  }
  document.getElementById("im-error").addEventListener("click", showError);
  document.getElementById("im-continue").addEventListener("click", showError);
  document.getElementById("im-clear").addEventListener("click", function () {
    a.removeAttribute("data-validation");
    var m = a.querySelector(".bog-field__message");
    if (m) m.remove();
    b.removeAttribute("data-validation");
    b.querySelector(".bog-field__message").textContent = HELPER;
  });

  // Slow motion: stretch the demo animations that start on this interaction (next tick, after bog-ui.js)
  var slow = document.getElementById("im-slow");
  function slowDown() {
    if (!slow.checked) return;
    setTimeout(function () {
      [a, b].forEach(function (f) {
        f.getAnimations({ subtree: true }).forEach(function (an) { an.playbackRate = 0.1; });
      });
    });
  }
  ["focusin", "focusout", "click"].forEach(function (t) { document.addEventListener(t, slowDown); });

  // ---- Tabs + sharing ---------------------------------------------------------
  var tabs = host.querySelectorAll("[data-im-tab]");
  function openTab(name) {
    tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t.getAttribute("data-im-tab") === name)); });
    host.querySelectorAll("[data-im-pane]").forEach(function (p) { p.hidden = p.getAttribute("data-im-pane") !== name; });
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      openTab(t.getAttribute("data-im-tab"));
      history.replaceState(null, "", "#input-motion-" + t.getAttribute("data-im-tab"));
    });
  });
  var m = location.hash.match(/^#input-motion-(design|ios|android|web)$/);
  if (m) { openTab(m[1]); document.getElementById("input-motion-section").scrollIntoView(); }

  function copy(btn, text) {
    navigator.clipboard.writeText(text).then(function () {
      var was = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = was; }, 1200);
    });
  }
  host.querySelectorAll("[data-im-link]").forEach(function (btn) {
    btn.addEventListener("click", function () { copy(btn, location.href.split("#")[0] + "#input-motion-" + btn.getAttribute("data-im-link")); });
  });
  host.querySelectorAll("[data-im-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var k = btn.getAttribute("data-im-copy");
      copy(btn, k === "design" ? SPEC_TEXT : CODE[k]);
    });
  });
})();
