# BOG UI — prototype component library

HTML/CSS versions of the BOG mobile components, coded from the Figma file
**Mobile Components – SwiftUI – Compose** (`EI6tYmEC7DhjpnzeuF5C45`).
No build step: link one CSS file and use the markup below.

Open **`index.html`** (the start page) and pick a component. Each component has its own page under `docs/` with every variant, the markup to copy, and a link to the Figma source.

## Setup

```html
<link rel="stylesheet" href="bog-ui/bog-ui.css">
<script src="bog-ui/bog-ui.js" defer></script>  <!-- needed for the text-input clear button -->
```

Fonts: `fonts/` holds BOG woff2 files. They are licensed, so they stay out of git (see `.gitignore`). If you have BOG installed on your Mac it's picked up automatically.

## Components

| Component   | Figma node   | Status |
|-------------|--------------|--------|
| Button      | `38686:29051` | ✅ all BOG Design variants |
| Icon Button | `38686:29095` | ✅ all BOG Design variants |
| Text Input  | `9881:38941`  | ✅ all 32 variants |
| Amount      | `47318:6396`  | ✅ all 72 variants |
| Account Picker | `57967:24278` | ✅ all 24 variants + Currency Chip |
| Bottom Sheet | `50810:6775` | ✅ Overlay on/off, all header types, free content, sticky bar (Promo Bottom Sheet not built) |
| Select | `43757:27381` | ✅ all 11 variants; opens a Bottom Sheet |
| Action Card | `49354:36678` | ✅ all 27 variants + Action Card Group (vertical / horizontal) |
| Action Item | `44073:26629` | ✅ Primary, Secondary, Media, Avatar × all states; badges, remove, 2/3-item rows |
| List | `45093:6300` | ✅ List item (1/2/2 Reverse/3/3+ lines × Default, Pressed, Disabled, Skeleton), slots, dividers, List group |
| Badges | `40620:3172` | ✅ Status, Currency, Loyalty, Feature (deprecated New Badge skipped) |
| Avatar | `41392:4706` | ✅ Initial / Icon / Image × 7 sizes, status & action, Avatar Button, groups |
| Checkbox | `38613:9869` | ✅ Checkbox, + Label, Group · all states, Themed & Inverse |
| Chip | `41453:45819` | ✅ Assist, Suggestion, Filter, Icon-only, Chip group (BOG Design only) |
| Feedback | `42389:14182` | ✅ Inline + Toast, 5 statuses, loading, skeleton, Inverse · `BOG.toast()` |
| Empty State | `46547:9704` | ✅ Error, Warning, Success, Info, Custom · Inverse · skeleton |
| Currency Input | `44129:67946` | ✅ Selectable / Fixed / Hidden currency (opens a Bottom Sheet) + Small Input |
| Account Select | `44129:69842` | ✅ all 11 variants; opens a Bottom Sheet of Account Pickers |
| Hero Area | `47547:44068` | ✅ media, text, badges, feedback, actions, skeleton (Navigation bar not built yet) |
| Product Card | `53662:4573` | ✅ all 5 variants, card stack |
| Inline Message | `41453:34518` | ✅ 6 statuses × Medium / Small, right-aligned, disabled, skeleton, Inverse |
| Notification Badge | `41563:26011` | ✅ Dot / Single / Multi × 6 statuses, Inverse; auto-positions on Icon Button, Avatar, Chip… |
| Number Input | `44129:68889` | ✅ all 15 variants; − / + stepper with min / max |
| Password Input | `65690:6315` | ✅ all Themed variants + Password Requirements (Incomplete / Valid / Non-Valid, live) |
| Phone Input | `61708:3382` | ✅ International (country picker → Bottom Sheet) / National × all states |
| Modal Dialog | `52913:5147` | ✅ Standard, Minimal, Cover (image / illustration), Destructive, Single / Dual · `BOG.openModal()` (Image Only modal not built: needs Slider Indicator) |
| Radio Card | `22114:3977` | ✅ Left / Right × Enabled, Pressed, Selected, Error, Read-only, Disabled, Skeleton; built-in Radio button |
| Wizard Progress | `Mobile Components` (instance `17658:72592`) | ✅ done / current / upcoming steps |
| Code Input | `17658:72586` (Onboarding) | ✅ medium (SMS) / large (passcode), masked, active, error, loading; keyboard + SMS autofill · not in Mobile Components yet |
| Keypad | `17658:72652` (Onboarding) | ✅ 0–9 + delete, types into a Code Input, desktop keys · not in Mobile Components yet |
| UI Elements | `54990:3178`  | ✅ Flags, Media Circle/Square/Rectangle, Illustration, Card Placeholder, Icon Placeholder, Counter |

The "iOS Liquid Glass" source variants are intentionally **not** implemented.

### Button

```html
<button class="bog-btn" data-type="primary">Continue</button>
<button class="bog-btn" data-type="secondary" data-size="small">Edit</button>
<button class="bog-btn" data-type="primary" data-width="fill">Pay 25.00 ₾</button>
<button class="bog-btn" data-type="neutral"><span class="bog-icon"></span>With icon</button>
<button class="bog-btn" data-type="primary" data-state="loading">Loading</button>
<button class="bog-btn" data-type="primary" disabled>Continue</button>
```

### Icon Button

```html
<button class="bog-icon-btn" data-type="neutral" aria-label="Close"><span class="bog-icon"></span></button>
<button class="bog-icon-btn" data-type="neutral" aria-label="Notifications">
  <span class="bog-icon" style="--icon: url(assets/icons/bell.svg)"></span>
  <span class="bog-badge-dot"></span>
</button>
```

### Attributes (both components)

| Attribute         | Values | Figma property |
|-------------------|--------|----------------|
| `data-type`       | `primary` `secondary` `neutral` `ghost` `negative` `negative-secondary` `negative-ghost` `positive` `positive-secondary` `positive-ghost` `black` `black-secondary` `black-ghost` `white` `white-ghost` `invert` · Button only: `text-primary` `text-black` `text-white` · Icon Button only: `neutral-ghost` | Type |
| `data-size`       | `medium` (default, 48 / 44px) · `small` (32px). `text-*` types are always 24px | Size |
| `data-appearance` | `inverse`: only for `primary` `secondary` `neutral` `ghost` `text-primary`, on dark backgrounds | Appearance = Inverse Static |
| `data-state`      | `pressed` `loading` `skeleton` (pressed also happens automatically on tap) | State |
| `disabled`        | native attribute | State = Disabled |
| `data-width`      | `fill`: full width of the container | — |

### Text Input

```html
<div class="bog-field">
  <label class="bog-field__box">
    <span class="bog-field__text">
      <span class="bog-field__label">Full name</span>
      <input class="bog-field__input" placeholder="Name Surname">
    </span>
    <button type="button" class="bog-field__clear" aria-label="Clear"></button>   <!-- optional -->
    <span class="bog-icon"></span>                                                  <!-- optional slot icon -->
    <button type="button" class="bog-field__info" aria-label="More info"></button> <!-- optional tooltip trigger -->
  </label>
  <p class="bog-field__message">As shown on your ID card</p>                      <!-- optional -->
</div>
```

States follow real interaction, so you don't set them: **Default** (empty) → **Active** (focused, empty; label floats and placeholder shows) → **Typing** (focused with a value; clear button appears) → **Filled** (value, not focused).

| Put on `.bog-field` | Values | Figma property |
|---|---|---|
| `data-validation` | `error` `warning` `success`: colors the border and message and adds the status icon | Validation |
| `data-appearance` | `inverse` for dark backgrounds | Appearance = Inverse Static |
| `data-state` | `loading` `skeleton`. `active` `typing` `filled` force a look for static mockups | State |

| Put on the `<input>` | Figma |
|---|---|
| `disabled` | Disabled = True |
| `readonly` | State = Read-only |

Always give the input a `placeholder` (`placeholder=" "` if you don't want one). The CSS uses it to detect an empty field, and `bog-ui.js` adds one automatically.

### Amount

```html
<div class="bog-amount" data-size="large">
  <button type="button" class="bog-amount__main">          <!-- use <div> if there's no selector -->
    <span class="bog-amount__value">1,000.00</span>
    <span class="bog-amount__currency">₾</span>             <!-- optional (Currency Symbol) -->
    <span class="bog-amount__selector"></span>              <!-- optional (Selector) -->
  </button>
  <div class="bog-amount__balances">                        <!-- optional (Account Balance) -->
    <span class="bog-amount__balance" data-active><span class="bog-amount__num">2.00</span>₾</span>
    <span class="bog-amount__balance"><span class="bog-amount__num">0.00</span>$</span>
  </div>
</div>
```

| Attribute | Values | Figma property |
|---|---|---|
| `data-size` | `large` (default) `medium` `small` | Size |
| `data-color` | `default` `black` `white` `inverse` | Color (Default / Black static / White static / Inverse) |
| `data-align` | `left` (default) `center` | Alignment |
| `data-hidden` | shows "......" and hides balance numbers | Amount visible = False |
| `data-state` | `skeleton` | Skeleton = True |

`data-active` on a balance means it's non-zero (full color). Empty balances are dimmed with the Default and Black colors. `.bog-amount__balances` can also be used on its own, as the Account Picker does.

### UI Elements (flags, images, illustrations, cards, icon circles, counters)

These are the visual slots other components use. **Whenever a design shows a flag, photo/avatar, illustration, bank card, icon in a circle or a counter, use these. Don't style a plain `<img>`.**

```html
<span class="bog-flag" data-size="32"><img src="bog-ui/assets/flags/ge.svg" alt="Georgia"></span>
<span class="bog-media-circle" data-size="40"><img src="avatar.jpg" alt=""></span>
<span class="bog-media-square" data-size="48"><img src="product.jpg" alt=""></span>
<span class="bog-media-rect" data-size="48"><img src="banner.jpg" alt=""></span>          <!-- 4:3 -->
<span class="bog-illustration" data-size="96"><img src="bog-ui/assets/illustrations/404.svg" alt=""></span>
<span class="bog-card-art" data-size="32"><img src="my-card.png" alt="Visa Gold"></span>
<span class="bog-icon-holder" data-size="40"><span class="bog-icon"></span></span>   <!-- data-type="outline" for Outline -->
<span class="bog-counter" data-size="40">99+</span>
<span class="bog-avatar" data-size="56">AV</span>                                <!-- initials -->
```

- `data-size` is the **height** from the Figma size name ("Medium 32" → `32`); widths follow Figma's aspect ratios.
- Leave out the `<img>` to show Figma's grey placeholder.
- `data-disabled` → Disabled=True · `data-state="skeleton"` → Skeleton=True · add `<span class="bog-badge-dot"></span>` inside for the Status dot · `style="--progress: 60%"` on `.bog-media-circle` for the progress ring.
- Assets in `assets/`: flags `ge` `us` `eu` `gb`, `illustrations/404.svg`, `cards/placeholder.svg`, `media/placeholder.png`. Claude can add more flags from the Figma **country-flags** library.

### Account Picker

A selectable account card **built from other library parts**: Amount (medium), balances (`.bog-amount__balances`), a UI Element in the media slot, and Country Flags in the currency chips. See `docs/picker.html` for all layouts (Multi/Single currency, Loyalty, Card Number, IBAN, Expandable, Error, Skeleton).

```html
<div class="bog-picker-group">                       <!-- makes the pickers inside single-select -->
  <div class="bog-picker" data-selected>
    <div class="bog-picker__box" role="button" tabindex="0">
      <div class="bog-picker__head">
        <div class="bog-picker__info">
          <span class="bog-picker__title">Multi-currency Account</span>
          <div class="bog-amount" data-size="medium"><div class="bog-amount__main">
            <span class="bog-amount__value">1,000.00</span><span class="bog-amount__currency">₾</span>
          </div></div>
        </div>
        <span class="bog-card-art" data-size="56"><img src="card.png" alt=""></span>
      </div>
      <div class="bog-amount__balances">…</div>
      <div class="bog-picker__expand">               <!-- optional: tap card to expand -->
        <div class="bog-picker__chips">
          <button type="button" class="bog-currency-chip" aria-pressed="true">
            <span class="bog-flag" data-size="20"><img src="bog-ui/assets/flags/ge.svg" alt=""></span>₾
          </button>
        </div>
      </div>
    </div>
    <p class="bog-picker__message">Message text</p>  <!-- with data-validation="error" -->
  </div>
</div>
```

| On `.bog-picker` | Figma |
|---|---|
| `data-selected` | Selected = True |
| `data-validation="error"` | Validation = Error |
| `data-state="pressed"` / `"skeleton"` | State = Pressed / Skeleton = True |

**Tap to expand:** wrap the chips in `.bog-picker__expand`. Tapping the card selects it and animates it open to the Expandable layout. Tapping it again collapses it, and opening another card in the group closes the previous one (needs `bog-ui.js`). Add `data-expanded` to start open. For a static always-open card, leave the chips unwrapped.

Info column alternatives: `.bog-picker__number` (Card Number / IBAN) and `.bog-picker__points` (Loyalty). Favorite star: `<span class="bog-picker__fav"></span>` inside the title. Media slot: `.bog-card-art` 56 (card accounts), `.bog-illustration` 56 (single currency, loyalty), `.bog-media-circle` 48 (IBAN).

### Bottom Sheet

Free content goes in `.bog-sheet__content`. The sheet is opened and closed by `bog-ui.js`.

```html
<div class="bog-sheet" id="my-sheet" hidden>
  <div class="bog-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="my-sheet-title">
    <header class="bog-sheet__nav">
      <div class="bog-sheet__heading">
        <h2 class="bog-sheet__title" id="my-sheet-title">Title</h2>
        <p class="bog-sheet__desc">Description</p>                      <!-- optional -->
      </div>
    </header>
    <div class="bog-sheet__content"> …any content… </div>
    <div class="bog-sheet__bar">                                         <!-- optional Sticky Bar -->
      <p class="bog-sheet__bar-text">Message text</p>
      <button class="bog-btn" data-type="primary" data-width="fill" data-sheet-close>Primary</button>
    </div>
  </div>
</div>
<button class="bog-btn" data-sheet-open="my-sheet">Open</button>     <!-- or BOG.openSheet("my-sheet") -->
```

- Every sheet gets an **X close button** on the right of the header by default. Turn it off with `data-close="false"` on `.bog-sheet`, or add your own `data-sheet-close` button to replace it.
- Closes on the X, an overlay tap, Escape, any `data-sheet-close` element, or dragging the handle down.
- `data-overlay="false"` removes the dark overlay. `data-home-indicator` draws the iOS home bar (for mockups).
- `data-type="list"` on the content gives list padding. Header icon buttons: put `.bog-icon-btn` elements before or after `.bog-sheet__heading`. Omit the heading for a blank header.
- In a phone-frame mockup, add `class="bog-sheet-host"` to the frame so the sheet opens inside it.

### Select

Tapping it opens a Bottom Sheet with the options. The quickest way is to list the options in a hidden native `<select>`, and the sheet is built automatically:

```html
<div class="bog-select">
  <button type="button" class="bog-select__box">
    <span class="bog-select__text">
      <span class="bog-select__label">Country</span>
      <span class="bog-select__value"></span>
    </span>
    <span class="bog-select__chevron"></span>
  </button>
  <select class="bog-select__native" name="country">
    <option value="GE">Georgia</option>
    <option value="US">United States</option>
  </select>
  <p class="bog-select__message">Helper text</p>                         <!-- optional -->
</div>
```

- **Custom options** (flags, subtitles): add `data-sheet="sheet-id"` to the `.bog-select` and put `.bog-list-item` rows with `data-value` (and optional `data-label`) in that sheet.
- `data-validation="error|warning|success"` · `data-state="skeleton"` on `.bog-select`; `disabled` or `aria-readonly="true"` on the button.
- Empty shows the label as the placeholder; once picked, the label shrinks above the value. The `.bog-select` fires a `change` event (`e.detail.value`, `e.detail.label`) and keeps `data-value` up to date.

### Action Card

```html
<button type="button" class="bog-action-card">                                <!-- or <a href> -->
  <span class="bog-icon-holder" data-size="40"><span class="bog-icon"></span></span>  <!-- any UI Element, 40 -->
  <span class="bog-action-card__content">
    <span class="bog-action-card__title">Primary text</span>
    <span class="bog-action-card__text">Secondary text</span>                   <!-- optional -->
    <span class="bog-action-card__message" data-status="warning">Message</span> <!-- optional -->
  </span>
  <span class="bog-action-card__chevron"></span>                                <!-- optional -->
</button>
<div class="bog-action-card-group">…</div>                   <!-- stack, 12px gap -->
<div class="bog-action-card-group" data-horizontal>…</div>   <!-- horizontal scroll, 343px cards -->
```

| Attribute | Values | Figma |
|---|---|---|
| `data-layout` | `row` (default) · `column` | Layout |
| `data-align` | `center` (default) · `top` | Alignment |
| `data-order` | `reversed` | Text Order = Reversed |
| `data-state` | `pressed` · `loading` · `skeleton` | State |
| `disabled` | native attribute | State = Disabled |

Message `data-status`: `warning` `error` `success` `neutral`. For badges or custom content, use `<span class="bog-action-card__extra">…</span>`. The Loyalty Badge isn't in the library yet.

### Action Item

```html
<div class="bog-action-items">                                   <!-- 2 items: centered · 3 items: spread -->
  <div class="bog-action-item" data-type="primary">              <!-- primary (orange) · secondary (grey) -->
    <button type="button" class="bog-action-item__main">
      <span class="bog-action-item__circle"><span class="bog-icon"></span></span>
      <span class="bog-action-item__label">Transfer</span>
      <span class="bog-action-item__amount">0.01 ₾</span>        <!-- optional -->
    </button>
  </div>
  <div class="bog-action-item">                                   <!-- Avatar: UI Element in the circle -->
    <button type="button" class="bog-action-item__main">
      <span class="bog-action-item__circle"><span class="bog-avatar" data-size="56">NB</span></span>
      <span class="bog-action-item__label">Nino B.</span>
    </button>
    <button type="button" class="bog-action-item__remove" aria-label="Remove"></button>  <!-- optional -->
  </div>
</div>
```

- **Media:** `<span class="bog-media-circle" data-size="56"><img …></span>` in the circle. **Avatar:** `<span class="bog-avatar" data-size="56">AV</span>`.
- **Badges** inside the circle: `<span class="bog-action-item__badge">New</span>`, `data-badge="dot"` (notification) or `data-badge="lock"`.
- `disabled` on the main button · `data-state="pressed"` or `"skeleton"` on `.bog-action-item`.
- The remove button fades the item out and deletes it. Listen for `actionitemremove` (call `preventDefault()` to keep the item).

### List (List item + List group)

```html
<div class="bog-list-group">
  <div class="bog-list-group__header"><span>Accounts</span><span>Balance</span></div>   <!-- optional -->
  <div class="bog-list" data-divider>                                                    <!-- data-divider: lines between rows -->
    <button type="button" class="bog-list-item">                                        <!-- <a> to navigate, <div> for static -->
      <span class="bog-icon-holder" data-size="40" data-type="outline"><span class="bog-icon"></span></span>
      <span class="bog-list-item__content">
        <span class="bog-list-item__subtitle">Subtitle</span>
        <span class="bog-list-item__label">Primary Label</span>
        <span class="bog-list-item__secondary">Secondary text</span>                     <!-- 3 Line -->
      </span>
      <span class="bog-list-item__end">
        <span class="bog-list-item__value">0.00 ₾</span>
        <span class="bog-list-item__value-sub">Secondary text</span>
      </span>
      <span class="bog-list-item__chevron"></span>
    </button>
  </div>
</div>
```

- **The layout comes from the content, in reading order:** 1 Line = label · 2 Line = subtitle + label · 2 Line Reverse = label + subtitle · 3 Line = subtitle + label + secondary · 3 Line+ = label + subtitle + `.bog-list-item__extra` (badge, message).
- **Left slot:** any UI Element at 40. **Right slot:** `__end` text, `__chevron`, a UI Element, or a small Icon Button.
- **Label icons:** `.bog-list-item__fav` (orange star) and `.bog-list-item__info` go inside the label.
- **States:** `data-state="pressed"` or `"skeleton"` · `disabled`. `aria-selected="true"` shows a check (used by Select).

### Badges

```html
<span class="bog-status-badge" data-status="success">Paid</span>          <!-- success warning negative info neutral neutral-static -->
<span class="bog-status-badge" data-status="negative" data-contrast="high" data-size="small">Overdue</span>
<span class="bog-currency-badge">GEL</span>                                <!-- data-color default|black|white|inverse · data-size large|small -->
<span class="bog-loyalty-badge" data-type="cashback">50% Cashback</span>   <!-- mr plus cashback discount solo other · data-contrast="high" -->
<span class="bog-feature-badge" data-type="new">New</span>                 <!-- new beta availability · data-disabled -->
```

### Avatar

```html
<span class="bog-avatar" data-size="40">NB</span>                                   <!-- initials -->
<span class="bog-avatar" data-size="40" data-type="icon"></span>                    <!-- user icon -->
<span class="bog-avatar" data-size="40"><img src="photo.jpg" alt=""></span>         <!-- photo -->
<span class="bog-avatar" data-size="56">NB<span class="bog-avatar__status" data-status="verify"></span></span>
<div class="bog-avatar-group"> …avatars… <button class="bog-avatar-btn" data-size="40" data-type="overflow">+9</button></div>
<span class="bog-avatar-pair" data-size="48"><span class="bog-avatar">A</span><span class="bog-avatar">B</span></span>
```
Sizes 16–64 · `data-disabled` · `data-state="skeleton"` · status `verify|favorite|react` (32+) · action: `<span class="bog-avatar__action"><button class="bog-icon-btn" data-type="neutral" data-size="small">…</button></span>` (48+).

### Checkbox

```html
<label class="bog-checkbox">
  <input type="checkbox" class="bog-checkbox__input">
  <span class="bog-checkbox__text">
    <span class="bog-checkbox__label">I agree to the <a href="#">terms ↗</a></span>
    <span class="bog-checkbox__desc">Description</span>
  </span>
</label>
<fieldset class="bog-checkbox-group"><legend class="bog-checkbox-group__label">Group label</legend>…</fieldset>
```
Native `checked` / `disabled` · `data-indeterminate` · `data-state="error|readonly|skeleton"` · `data-appearance="inverse"` · `data-align="right"`.

### Chip

```html
<button type="button" class="bog-chip">Chip text</button>
<button type="button" class="bog-chip" data-type="filter" aria-pressed="false">Cards</button>   <!-- data-dropdown adds a chevron -->
<button type="button" class="bog-chip" data-type="icon" aria-pressed="false" aria-label="Filters"><span class="bog-icon"></span></button>
<div class="bog-chip-group">…</div>              <!-- one scrolling row · data-wrap for multiple rows -->
```

### Feedback (Inline + Toast)

```html
<div class="bog-feedback" data-status="positive">
  <div class="bog-feedback__text"><p class="bog-feedback__title">Payment sent</p><p class="bog-feedback__desc">50.00 ₾ to Nino B.</p></div>
  <button type="button" class="bog-feedback__close" aria-label="Close"></button>
</div>
<script>BOG.toast({ status: "positive", title: "Saved", text: "Template saved" });</script>
```
Statuses `positive warning negative info neutral` · `data-appearance="inverse"` · `data-state="loading|skeleton"` · actions in `.bog-feedback__actions`.
Small inline message anywhere: `<span class="bog-inline-message" data-status="info" data-size="small">Text</span>`.

### Empty State

```html
<div class="bog-empty" data-type="info">                <!-- error warning success info custom -->
  <p class="bog-empty__title">No transactions yet</p>
  <p class="bog-empty__desc">Your payments will appear here.</p>
  <div class="bog-empty__actions"><button class="bog-btn" data-type="neutral">Make a payment</button></div>
</div>
```

### Currency Input

A Text Input (`.bog-field`) plus `.bog-currency-input`: amount + symbol, and a currency picker that opens a Bottom Sheet. Its rows need `data-currency`, `data-symbol` and `data-flag`. See `docs/currency-input.html`. Compact version: `.bog-currency-small`.

### Account Select

A Select with `data-variant="account"` and a UI Element (e.g. `.bog-card-art` 40) before the chevron. Its Bottom Sheet holds Account Pickers with `data-value` and `data-label`. See `docs/account-select.html`.

### Hero Area

```html
<section class="bog-hero">
  <div class="bog-hero__content">
    <span class="bog-avatar" data-size="64">NB</span>
    <div class="bog-hero__text"><p class="bog-hero__label">Label</p><h1 class="bog-hero__title">Header</h1><p class="bog-hero__desc">Description</p></div>
    <div class="bog-hero__badges">…</div>
  </div>
  <div class="bog-hero__actions"><button class="bog-btn" data-type="secondary" data-width="fill">Action</button></div>
</section>
```
Gradient background: `data-gradient="peach | mint | green | brown"` on `.bog-hero`. The colour covers the whole hero, including buttons, and fades out only towards the bottom edge. Green and brown are dark: the hero text turns white, so use light content inside (Amount `data-color="white"`, Feedback `data-appearance="inverse"`). Figma marks these gradients as work in progress.

### Product Card

```html
<div class="bog-product-card" role="button" tabindex="0">
  <div class="bog-product-card__info">
    <span class="bog-product-card__title">Account</span>
    <div class="bog-amount" data-size="medium">…</div>
  </div>
  <span class="bog-product-card__media" data-more><span class="bog-card-art" data-size="56"></span></span>
</div>
```
Empty: add `data-empty` and replace the Amount with `<span class="bog-inline-message" data-status="info" data-size="small">…</span>`.

### Inline Message

`<span class="bog-inline-message" data-status="positive" data-size="small">Saved</span>`. Statuses: neutral (default), positive, negative, warning, info, black. Also `data-align="right"`, `data-appearance="inverse"`, `data-disabled`, `data-state="skeleton"`. See `docs/inline-message.html`.

### Notification Badge

`<span class="bog-notification-badge" data-status="negative">4</span>`: empty = dot, 1 digit = 16px circle, more = pill. Put it inside an Icon Button, Avatar, Chip, Media Circle, Icon Holder or Action Item circle and it sits on the top-right corner automatically. See `docs/notification-badge.html`.

### Number Input · Password Input · Phone Input

All three are Text Inputs (`.bog-field`) with an extra class, so states, validation, read-only, disabled and skeleton work the same way.
- **Number**: `.bog-number-input` + `.bog-number-input__stepper` with two Icon Buttons (`data-step="down|up"`). `data-min`, `data-max`, `data-step` go on the input.
- **Password**: `.bog-password-input` + `<button class="bog-password-input__toggle">`. Checklist: `.bog-password-rules[data-for="input-id"]` with small Inline Messages that have `data-pattern` (a regex) and update live.
- **Phone**: `.bog-phone-input` + `<button class="bog-phone-input__country">` (flag 20 + `.bog-phone-input__code`). Tapping it opens a built-in Bottom Sheet of countries (flag, name, code) and sets the one you pick; the list is `BOG.countries`. The number is formatted as you type using the selected country's pattern (e.g. Georgia `555 12 34 56`, US `(555) 123-4567`), and the placeholder shows that pattern. Leave the button out for National (format via `data-format="XXX XX XX XX"` on `.bog-phone-input`, default Georgia).

### Modal Dialog

```html
<div class="bog-modal" id="confirm" hidden>
  <div class="bog-modal__dialog" role="dialog" aria-modal="true">
    <header class="bog-modal__header"><h2 class="bog-modal__title">Title</h2><button class="bog-icon-btn" data-type="neutral" data-size="small" aria-label="Close" data-modal-close><span class="bog-icon" data-icon="close"></span></button></header>
    <div class="bog-modal__body"><p class="bog-modal__text">Text</p></div>
    <footer class="bog-modal__footer"><button class="bog-btn" data-type="primary" data-size="medium">OK</button></footer>
  </div>
</div>
```
Open with `data-modal-open="confirm"` or `BOG.openModal("confirm")`. Minimal: `data-layout="minimal"` on the body, no header. Cover: `.bog-modal__cover` (img or `.bog-illustration`) before the body. Destructive: `data-type="negative"` button and no X. Use a Modal for short centered confirmations; anything sliding from the bottom is still a Bottom Sheet.

### Radio Card

```html
<div class="bog-radio-card-group">
  <label class="bog-radio-card">
    <input type="radio" class="bog-radio-card__input" name="pay-with" value="apple-pay" checked>
    <span class="bog-radio-card__box">
      <span class="bog-icon"></span>                         <!-- optional leading slot -->
      <span class="bog-radio-card__content">
        <span class="bog-radio-card__title">Title</span>
        <span class="bog-radio-card__desc">Description</span> <!-- optional -->
      </span>
      <span class="bog-radio-card__radio"></span>
    </span>
    <span class="bog-inline-message" data-status="negative">Message text</span>  <!-- Error only -->
  </label>
</div>
```
Selected = `checked` · Disabled = `disabled` on the input · on `.bog-radio-card`: `data-align="left"`, `data-validation="error"`, `data-state="readonly | skeleton | pressed"`. Same `name` = one group.

### Wizard Progress · Code Input · Keypad

```html
<div class="bog-wizard"><span class="bog-wizard__step" data-state="done"></span><span class="bog-wizard__step" data-state="current"></span></div>

<div class="bog-code" data-size="medium">                       <!-- SMS code: phone keyboard + autofill -->
  <input class="bog-code__input" inputmode="numeric" autocomplete="one-time-code" maxlength="4" aria-label="SMS code">
  <span class="bog-code__cell"></span><span class="bog-code__cell"></span><span class="bog-code__cell"></span><span class="bog-code__cell"></span>
</div>

<div class="bog-code" data-size="large" data-mask id="passcode">…4 cells…</div>   <!-- passcode -->
<div class="bog-keypad" data-for="passcode">…keys…</div>
```
Code Input: `data-validation="error"`, `data-state="loading"`, events `codechange` / `codecomplete` (detail.value), `BOG.setCode(el, value)`. See the docs pages for the full keypad markup.

### Icons

`.bog-icon` is a 16×16 slot that takes the button's text color automatically. Built-in: `data-icon="close"` (X).
Pass any single-color SVG with `style="--icon: url(path.svg)"`. The default is the Figma placeholder icon.

## Adding a new component

1. Give Claude the Figma link to the component set.
2. Claude reads the variables and variant styles, then adds `components/<name>.css` and its tokens to `tokens.css`, and imports the file in `bog-ui.css`.
3. Copy `docs/_template.html` to `docs/<name>.html`, add every variant, and add one entry to `docs/components.js`. The start page and sidebar pick it up automatically.
4. Compare the page with the Figma screenshot and add a row to the table above.
