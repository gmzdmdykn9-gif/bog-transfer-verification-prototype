/* BOG UI docs — the single list of components.
   Adding a component = add one entry here + create docs/<page>.html from docs/_template.html.
   Used by the start page (index.html) and the sidebar on every component page.
   updated: the day the component last changed (YYYY-MM-DD) — used by the "Recently updated" sort. */
window.BOG_COMPONENTS = [
  {
    id: "button",
    updated: "2026-09-30",
    name: "Button & Icon Button",
    page: "button.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=38686-29051",
    desc: "19 button types, 17 icon-button types, 2 sizes, 5 states, Themed and Inverse.",
    preview: '<button class="bog-btn" data-type="primary" data-size="small">Button</button> <button class="bog-icon-btn" data-type="neutral" data-size="small" aria-label="Icon"><span class="bog-icon"></span></button>'
  },
  {
    id: "text-input",
    updated: "2026-10-28",
    motion: true,
    name: "Text Input",
    page: "text-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=44129-67424",
    desc: "Floating label, clear button, validation, loading, read-only, disabled, skeleton.",
    preview: '<div class="bog-field" data-state="filled" style="width:220px"><label class="bog-field__box"><span class="bog-field__text"><span class="bog-field__label">Full name</span><input class="bog-field__input" placeholder=" " value="Nino B." tabindex="-1"></span></label></div>'
  },
  {
    id: "amount",
    updated: "2026-09-30",
    name: "Amount",
    page: "amount.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=47318-6396",
    desc: "Balance with currency, selector and per-currency balances. 3 sizes, 4 colors.",
    preview: '<div class="bog-amount" data-size="medium"><div class="bog-amount__main"><span class="bog-amount__value">1,000.00</span><span class="bog-amount__currency">₾</span></div></div>'
  },
  {
    id: "ui-elements",
    updated: "2026-10-19",
    name: "UI Elements",
    page: "ui-elements.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=54990-3178",
    desc: "Flags, images, illustrations, bank cards, icon containers and counters — used inside other components.",
    preview: '<span class="bog-flag" data-size="32"><img src="ASSETS/flags/ge.svg" alt=""></span> <span class="bog-media-circle" data-size="32"></span> <span class="bog-card-art" data-size="32"></span> <span class="bog-icon-holder" data-size="32"><span class="bog-icon"></span></span> <span class="bog-counter" data-size="32">99+</span>'
  },
  {
    id: "picker",
    updated: "2026-10-28",
    motion: true,
    name: "Account Picker",
    page: "picker.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=57967-24278",
    desc: "Selectable account card built from Amount, balances and UI Elements. Currency chips, loyalty, card number, IBAN.",
    preview: '<div class="bog-picker" data-selected style="width:260px"><div class="bog-picker__box"><div class="bog-picker__head"><div class="bog-picker__info"><span class="bog-picker__title">Multi-currency Account</span><div class="bog-amount" data-size="medium"><div class="bog-amount__main"><span class="bog-amount__value">1,000.00</span><span class="bog-amount__currency">₾</span></div></div></div><span class="bog-card-art" data-size="40"></span></div></div></div>'
  },
  {
    id: "bottom-sheet",
    updated: "2026-10-28",
    motion: true,
    name: "Bottom Sheet",
    page: "bottom-sheet.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=50084-32099",
    desc: "Slide-up panel with free content, title/description header, optional sticky bar. Opens with data-sheet-open.",
    preview: '<div style="width:200px;height:112px;overflow:hidden;border-radius:12px;background:#0f0f10ad;display:flex;align-items:flex-end"><div style="width:100%;background:#fff;border-radius:12px 12px 0 0;padding:14px 12px 10px;box-sizing:border-box;position:relative"><div style="position:absolute;top:5px;left:50%;width:24px;height:3px;margin-left:-12px;border-radius:9px;background:#d7d9db"></div><div style="font-weight:600;font-size:13px;margin-bottom:8px">Title</div><div style="height:6px;border-radius:3px;background:#ecedee;margin-bottom:6px"></div><div style="height:6px;width:70%;border-radius:3px;background:#ecedee;margin-bottom:10px"></div><div style="height:22px;border-radius:7px;background:#ff5c0a"></div></div></div>'
  },
  {
    id: "result",
    updated: "2026-11-03",
    motion: true,
    name: "Result Page",
    page: "result.html",
    figma: "https://www.figma.com/design/sDb5KObJDal0JvMECrN53T/?node-id=55279-42698",
    desc: "Full result screen: Result Status (success, warning, negative, info, pending) or Custom visual, amount, action, sticky bar.",
    preview: '<div class="bog-result" data-status="success" style="padding:0;gap:16px;transform:scale(.8)"><span class="bog-result__icon"></span><div class="bog-result__text" style="margin-top:-8px"><p class="bog-result__title">Transfer sent</p><p class="bog-result__desc">Nino B. will get it in seconds</p></div></div>'
  },
  {
    id: "select",
    updated: "2026-11-03",
    motion: true,
    name: "Select",
    page: "select.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=43757-27381",
    desc: "Input-style trigger that opens a Bottom Sheet with the options. Validation, read-only, disabled, skeleton.",
    preview: '<div class="bog-select" style="width:220px"><div class="bog-select__box"><span class="bog-select__text"><span class="bog-select__label">Country</span><span class="bog-select__value">Georgia</span></span><span class="bog-select__chevron"></span></div></div>'
  },
  {
    id: "action-card",
    updated: "2026-09-30",
    name: "Action Card",
    page: "action-card.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=48879-13185",
    desc: "Tappable bordered card with a UI Element slot, title, text, message and chevron. Row/column layouts and groups.",
    preview: '<div class="bog-action-card" style="width:250px;background:#fff"><span class="bog-icon-holder" data-size="40"><span class="bog-icon"></span></span><span class="bog-action-card__content"><span class="bog-action-card__title">Primary text</span><span class="bog-action-card__text">Secondary text</span></span><span class="bog-action-card__chevron"></span></div>'
  },
  {
    id: "action-item",
    updated: "2026-11-03",
    motion: true,
    name: "Action Item",
    page: "action-item.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=44073-26629",
    desc: "56px circle shortcut with label and amount: Primary, Secondary, Media, Avatar. Badges, remove button, 2/3-item rows.",
    preview: '<div class="bog-action-items" style="width:260px;gap:8px"><div class="bog-action-item" data-type="primary" style="width:80px"><span class="bog-action-item__main"><span class="bog-action-item__circle"><span class="bog-icon"></span></span><span class="bog-action-item__label">Transfer</span></span></div><div class="bog-action-item" data-type="secondary" style="width:80px"><span class="bog-action-item__main"><span class="bog-action-item__circle"><span class="bog-icon"></span></span><span class="bog-action-item__label">Pay</span></span></div><div class="bog-action-item" style="width:80px"><span class="bog-action-item__main"><span class="bog-action-item__circle"><span class="bog-avatar" data-size="56">NB</span></span><span class="bog-action-item__label">Nino</span></span></div></div>'
  },
  {
    id: "list",
    updated: "2026-10-19",
    name: "List",
    page: "list.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=45093-6300",
    desc: "List item rows: 1–3+ lines, left/right slots, amounts, chevron, dividers, group header. Skeleton, pressed, disabled.",
    preview: '<div class="bog-list" data-divider style="width:260px;background:#fff;border-radius:12px;padding:0 8px"><div class="bog-list-item"><span class="bog-icon-holder" data-size="40" data-type="outline"><span class="bog-icon"></span></span><span class="bog-list-item__content"><span class="bog-list-item__subtitle">Subtitle</span><span class="bog-list-item__label">Primary Label</span></span><span class="bog-list-item__chevron"></span></div></div>'
  },
  {
    id: "badge",
    updated: "2026-10-19",
    name: "Badges",
    page: "badge.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=40620-3172",
    desc: "Status, Currency, Loyalty and Feature badges. Medium/small, high contrast, disabled, skeleton.",
    preview: '<span class="bog-status-badge" data-status="success">Paid</span> <span class="bog-loyalty-badge" data-type="cashback">50% Cashback</span> <span class="bog-currency-badge">GEL</span> <span class="bog-feature-badge" data-type="new">New</span>'
  },
  {
    id: "avatar",
    updated: "2026-10-19",
    name: "Avatar",
    page: "avatar.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=41392-4706",
    desc: "Initials, icon or photo · 16–64 · status / action corners · add & overflow button · groups.",
    preview: '<div class="bog-avatar-group"><span class="bog-avatar" data-size="40">NB</span><span class="bog-avatar" data-size="40" data-type="icon"></span><span class="bog-avatar" data-size="40">GK</span><button type="button" class="bog-avatar-btn" data-size="40" data-type="overflow">+9</button></div>'
  },
  {
    id: "checkbox",
    updated: "2026-11-03",
    motion: true,
    name: "Checkbox",
    page: "checkbox.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=38613-9869",
    desc: "Checkbox, Checkbox + Label and Group. Checked, indeterminate, error, read-only, disabled, skeleton, inverse.",
    preview: '<label class="bog-checkbox"><input type="checkbox" class="bog-checkbox__input" checked><span class="bog-checkbox__text"><span class="bog-checkbox__label">I agree to the terms</span></span></label>'
  },
  {
    id: "radio",
    updated: "2026-11-03",
    motion: true,
    name: "Radio Button",
    page: "radio.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=38644-24312",
    desc: "Radio button, Radio Button + Label and Group. Left / right, horizontal, error, read-only, disabled, skeleton, inverse.",
    preview: '<div class="bog-radio-group" style="width:200px"><div class="bog-radio-group__options"><label class="bog-radio"><span class="bog-radio__row"><input type="radio" class="bog-radio__input" name="card-prev" tabindex="-1" checked><span class="bog-radio__text"><span class="bog-radio__title">Pick up at a branch</span></span></span></label><label class="bog-radio"><span class="bog-radio__row"><input type="radio" class="bog-radio__input" name="card-prev" tabindex="-1"><span class="bog-radio__text"><span class="bog-radio__title">Courier</span></span></span></label></div></div>'
  },
  {
    id: "toggle",
    updated: "2026-11-03",
    motion: true,
    name: "Toggle Switch",
    page: "toggle.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=38613-16004",
    desc: "Toggle Switch, Toggle Switch + Label and Group. On, indeterminate, error, read-only, disabled, skeleton, inverse.",
    preview: '<label class="bog-toggle" style="width:240px"><span class="bog-toggle__row"><span class="bog-toggle__text"><span class="bog-toggle__title">Push notifications</span><span class="bog-toggle__desc">Payments and offers</span></span><input type="checkbox" role="switch" class="bog-toggle__input" checked></span></label>'
  },
  {
    id: "chip",
    updated: "2026-10-19",
    name: "Chip",
    page: "chip.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=41453-45819",
    desc: "Assist, Suggestion, Filter and Icon-only chips · selected, pressed, disabled, skeleton · chip groups.",
    preview: '<div class="bog-chip-group"><button class="bog-chip" data-type="filter" aria-pressed="true">All</button><button class="bog-chip" data-type="filter" aria-pressed="false">Cards</button><button class="bog-chip"><span class="bog-icon"></span>Help</button></div>'
  },
  {
    id: "feedback",
    updated: "2026-10-28",
    motion: true,
    name: "Feedback",
    page: "feedback.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=42389-14182",
    desc: "Inline messages and Toasts · 5 statuses · title, actions, close, loading, skeleton · BOG.toast().",
    preview: '<div class="bog-feedback" data-status="positive" style="width:240px"><div class="bog-feedback__text"><p class="bog-feedback__title">Payment sent</p><p class="bog-feedback__desc">50.00 ₾ to Nino B.</p></div></div>'
  },
  {
    id: "empty-state",
    updated: "2026-10-19",
    name: "Empty State",
    page: "empty-state.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=46547-9704",
    desc: "Status icon or custom visual, title, description and button · error, warning, success, info · inverse, skeleton.",
    preview: '<div class="bog-empty" data-type="info" style="transform:scale(.7)"><p class="bog-empty__title">No transactions yet</p><p class="bog-empty__desc">Your payments will appear here.</p></div>'
  },
  {
    id: "currency-input",
    updated: "2026-10-28",
    motion: true,
    name: "Currency Input",
    page: "currency-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=44129-67946",
    desc: "Amount + currency symbol + currency picker (opens a Bottom Sheet) · selectable / fixed / hidden · small 96px input.",
    preview: '<div class="bog-field bog-currency-input" data-state="filled" style="width:240px"><div class="bog-field__box"><span class="bog-field__text"><span class="bog-field__label">Amount</span><span class="bog-currency-input__value"><input class="bog-field__input" value="250.00" tabindex="-1" placeholder=" " style="width:56px"><span class="bog-currency-input__symbol">₾</span></span></span><span class="bog-currency-input__currency"><span class="bog-flag" data-size="16"><img src="ASSETS/flags/ge.svg" alt=""></span>GEL</span></div></div>'
  },
  {
    id: "account-select",
    updated: "2026-11-03",
    motion: true,
    name: "Account Select",
    page: "account-select.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=44129-69842",
    desc: "Select variant for accounts · card visual · opens a Bottom Sheet of Account Pickers · validation, read-only, disabled, skeleton.",
    preview: '<div class="bog-select" data-variant="account" style="width:240px"><div class="bog-select__box"><span class="bog-select__text"><span class="bog-select__label">Account<span class="bog-select__fav"></span></span><span class="bog-select__value">Main account</span></span><span class="bog-card-art" data-size="40"></span><span class="bog-select__chevron"></span></div></div>'
  },
  {
    id: "hero",
    updated: "2026-10-28",
    motion: true,
    name: "Hero Area",
    page: "hero.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=47547-44068",
    desc: "Centered header: visual, label, title, description · badges, feedback and actions · skeleton.",
    preview: '<section class="bog-hero" style="padding:0;transform:scale(.8)"><div class="bog-hero__content" style="padding:0"><span class="bog-avatar" data-size="48">NB</span><div class="bog-hero__text"><h1 class="bog-hero__title">Nino Beridze</h1><p class="bog-hero__desc">Premium client</p></div></div></section>'
  },
  {
    id: "product-card",
    updated: "2026-10-19",
    name: "Product Card",
    page: "product-card.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=53662-4573",
    desc: "Product summary card: title, Amount with balances, card stack or other media · empty, pressed, skeleton.",
    preview: '<div class="bog-product-card" style="width:250px"><div class="bog-product-card__info"><span class="bog-product-card__title">Account</span><div class="bog-amount" data-size="medium"><div class="bog-amount__main"><span class="bog-amount__value">1,000.00</span><span class="bog-amount__currency">₾</span></div></div></div><span class="bog-product-card__media" data-more><span class="bog-card-art" data-size="40"></span></span></div>'
  },
  {
    id: "inline-message",
    updated: "2026-10-19",
    name: "Inline Message",
    page: "inline-message.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=41453-34518",
    desc: "One-line status message · 6 statuses · medium/small · left/right · inverse, disabled, skeleton.",
    preview: '<div style="display:flex;flex-direction:column;gap:8px"><span class="bog-inline-message" data-status="positive">Payment sent</span><span class="bog-inline-message" data-status="negative">Insufficient funds</span><span class="bog-inline-message" data-status="info">Updated just now</span></div>'
  },
  {
    id: "notification-badge",
    updated: "2026-10-19",
    name: "Notification Badge",
    page: "notification-badge.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=41563-26011",
    desc: "Count / dot badge · accent, negative, warning, positive, neutral · inverse · auto corner placement.",
    preview: '<button class="bog-icon-btn" data-type="neutral" aria-label="x"><span class="bog-icon"></span><span class="bog-notification-badge">3</span></button> <span class="bog-notification-badge" data-status="negative">44+</span> <span class="bog-notification-badge"></span>'
  },
  {
    id: "number-input",
    updated: "2026-10-28",
    motion: true,
    name: "Number Input",
    page: "number-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=44129-68889",
    desc: "Text Input with − / + stepper buttons.",
    preview: '<div class="bog-field bog-number-input" style="width:260px"><label class="bog-field__box"><span class="bog-field__text"><span class="bog-field__label">Enter amount</span><input class="bog-field__input" placeholder=" " value="100" tabindex="-1"></span><span class="bog-number-input__stepper"><span class="bog-icon-btn" data-type="neutral" data-size="small"><span class="bog-icon" data-icon="minus"></span></span><span class="bog-icon-btn" data-type="neutral" data-size="small"><span class="bog-icon" data-icon="plus"></span></span></span></label></div>'
  },
  {
    id: "password-input",
    updated: "2026-10-28",
    motion: true,
    name: "Password Input",
    page: "password-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=65690-6315",
    desc: "Masked input with eye toggle and a live requirements checklist.",
    preview: '<div class="bog-field bog-password-input" style="width:260px"><label class="bog-field__box"><span class="bog-field__text"><span class="bog-field__label">Enter Password</span><input class="bog-field__input" type="password" placeholder=" " value="secret1234" tabindex="-1"></span><span class="bog-password-input__toggle"></span></label></div>'
  },
  {
    id: "phone-input",
    updated: "2026-10-28",
    motion: true,
    name: "Phone Input",
    page: "phone-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=61708-3382",
    desc: "Phone number with a country-code picker (opens a Bottom Sheet).",
    preview: '<div class="bog-field bog-phone-input" style="width:260px"><label class="bog-field__box"><span class="bog-phone-input__country"><span class="bog-flag" data-size="20"><img src="assets/flags/ge.svg" alt=""></span><span class="bog-phone-input__code">+995</span></span><span class="bog-field__text"><span class="bog-field__label">Phone number</span><input class="bog-field__input" placeholder=" " tabindex="-1"></span></label></div>'
  },
  {
    id: "modal",
    updated: "2026-10-28",
    motion: true,
    name: "Modal Dialog",
    page: "modal.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=52913-5147",
    desc: "Centered dialog with title, content and 1–2 buttons. Opens with data-modal-open.",
    preview: '<div class="bog-modal" data-open style="position:static;padding:0;background:none"><div class="bog-modal__dialog" style="width:240px"><header class="bog-modal__header"><span class="bog-modal__title" style="font:600 16px/24px var(--font-family-bog)">Modal dialog</span></header><div class="bog-modal__body" style="padding-block:4px 8px"><p class="bog-modal__text" style="font-size:12px;line-height:16px">Body text goes here.</p></div><footer class="bog-modal__footer"><span class="bog-btn" data-type="primary" data-size="small">Confirm</span></footer></div></div>'
  },
  {
    id: "radio-card",
    updated: "2026-11-03",
    name: "Radio Card",
    page: "radio-card.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=22114-3977",
    desc: "Bordered single-choice option with title, description and radio. Left / Right, Error, Read-only, Disabled, Skeleton.",
    preview: '<label class="bog-radio-card" style="width:220px"><input type="radio" class="bog-radio-card__input" name="pv-rc" checked tabindex="-1"><span class="bog-radio-card__box"><span class="bog-radio-card__content"><span class="bog-radio-card__title">Title</span><span class="bog-radio-card__desc">Description</span></span><span class="bog-radio-card__radio"></span></span></label>'
  },
  {
    id: "otp-verification",
    updated: "2026-11-03",
    name: "OTP Verification",
    page: "otp-verification.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=65048-81195",
    desc: "One-time code block: SMS / Email choice, code field, resend timer and button. Default, Resend, Loading, Expired, Hard, Skeleton.",
    preview: '<div class="bog-otp" style="width:220px;gap:8px"><div class="bog-otp__form" style="gap:8px"><div class="bog-field"><span class="bog-field__box"><span class="bog-field__text"><span class="bog-field__label">Enter 4-digit code</span></span></span></div><div class="bog-otp__info"><p class="bog-otp__timer" style="font-size:12px">Resend code in <b class="bog-otp__time">00:35</b></p></div></div></div>'
  },
  {
    id: "menu",
    updated: "2026-11-03",
    name: "Menu",
    page: "menu.html",
    figma: "https://www.figma.com/design/7ceZjESb4Ga9PwNw4vP0p4/?node-id=17748-73134",
    desc: "Grey pill that opens an iOS-style pull-down menu with a checkmark, e.g. SMS / Email / WhatsApp.",
    preview: '<span class="bog-menu"><span class="bog-menu__trigger"><span class="bog-menu__value">SMS კოდი</span></span></span>'
  },
  {
    id: "pin-input",
    updated: "2026-11-03",
    name: "PIN code Input",
    page: "pin-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=64853-17381",
    desc: "Title, helper text and 4 dots for a PIN. Default, Filled, Error. Typed on a Keyboard Numeric.",
    preview: '<div class="bog-pin" style="width:200px;transform:scale(.85)"><div class="bog-pin__dots"><span class="bog-pin__dot" data-filled></span><span class="bog-pin__dot" data-filled></span><span class="bog-pin__dot"></span><span class="bog-pin__dot"></span></div></div>'
  },
  {
    id: "numpad",
    updated: "2026-11-03",
    name: "Keyboard Numeric",
    page: "numpad.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=64769-662",
    desc: "Number pad with Face ID / fingerprint / dot pads and backspace; Themed, White / Black Static, Invert. Types into a PIN code Input, Code Input or amount field.",
    preview: '<div class="bog-numpad" style="width:220px;transform:scale(.8);padding:0"><span class="bog-numpad__key">1</span><span class="bog-numpad__key">2</span><span class="bog-numpad__key">3</span></div>'
  },
  {
    id: "wizard-progress",
    updated: "2026-11-03",
    name: "Wizard Progress",
    page: "wizard-progress.html",
    figma: "https://www.figma.com/design/7ceZjESb4Ga9PwNw4vP0p4/?node-id=17658-72592",
    desc: "Step bar under the navigation bar: done, current (half) and upcoming steps.",
    preview: '<div class="bog-wizard" style="width:220px"><span class="bog-wizard__step" data-state="done"></span><span class="bog-wizard__step" data-state="current"></span></div>'
  },
  {
    id: "code-input",
    updated: "2026-11-03",
    name: "Code Input",
    page: "code-input.html",
    figma: "https://www.figma.com/design/7ceZjESb4Ga9PwNw4vP0p4/?node-id=17658-72586",
    desc: "4-digit cells for an SMS code (keyboard + autofill) or a masked passcode (with Keyboard Numeric).",
    preview: '<div class="bog-code" data-size="medium" style="transform:scale(.6)"><span class="bog-code__cell">1</span><span class="bog-code__cell">2</span><span class="bog-code__cell"></span><span class="bog-code__cell"></span></div>'
  },
  {
      id: "tooltip",
      updated: "2026-11-03",
      name: "Tooltip",
      page: "tooltip.html",
      figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=40699-20459",
      desc: "Dark label with an arrow, opened by tapping an info icon or any trigger. Top / Bottom × 5 alignments, flips to stay on screen.",
      preview: '<span class="bog-tooltip-anchor" style="margin-top:-36px"><span class="bog-tooltip-trigger"></span><span class="bog-tooltip" role="tooltip" data-position="bottom" data-alignment="center" data-open>Good for interactive elements</span></span>'
    },
  {
    id: "search-input",
    updated: "2026-11-03",
    name: "Search Input",
    page: "search-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=11564-39458",
    desc: "Search field with clear and Cancel. Page / Overlay, Small / Large, skeleton.",
    preview: '<div class="bog-field bog-search" style="width:240px"><label class="bog-field__box"><span class="bog-field__text"><span class="bog-search__icon"></span><input class="bog-field__input" type="search" placeholder="Search" tabindex="-1"></span></label></div>'
  },
  {
    id: "segmented-control",
    updated: "2026-11-03",
    name: "Segmented Control",
    page: "segmented-control.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=23453-49724",
    desc: "2–6 text segments or icons with a sliding thumb. Large / Small, skeleton.",
    preview: '<div class="bog-segmented" style="width:240px" role="radiogroup" aria-label="Preview"><label class="bog-segmented__item"><input type="radio" name="seg-preview" checked tabindex="-1"><span>Week</span></label><label class="bog-segmented__item"><input type="radio" name="seg-preview" tabindex="-1"><span>Month</span></label><label class="bog-segmented__item"><input type="radio" name="seg-preview" tabindex="-1"><span>Year</span></label></div>'
  },
  {
    id: "navigation-bar",
    updated: "2026-11-03",
    name: "Navigation Bar",
    page: "navigation-bar.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=53820-197",
    desc: "iOS / Android status bar, back button or media, title + secondary text or caption, icon buttons / button / timer. Themed, White, Black; divider & background on scroll.",
    preview: '<header class="bog-nav-bar" data-status-bar="false" data-divider style="width:300px;background:#fff"><div class="bog-nav-bar__header"><button class="bog-icon-btn" data-type="neutral" data-size="small" aria-label="Back" tabindex="-1"><span class="bog-icon" data-icon="chevron-left"></span></button><div class="bog-nav-bar__title"><span class="bog-nav-bar__heading">Title</span><span class="bog-nav-bar__subtitle">Secondary text</span></div><div class="bog-nav-bar__actions"><button class="bog-icon-btn" data-type="neutral" data-size="small" aria-label="Chat" tabindex="-1"><span class="bog-icon" data-icon="chat"></span></button></div></div></header>'
  },
  {
    id: "sticky-bar",
    updated: "2026-11-03",
    name: "Sticky Bar",
    page: "sticky-bar.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=46272-32125",
    desc: "Bottom action area: fade, slot, helper text, 1–2 buttons (stacked / row), quick amounts, home indicator. Page / Overlay, Themed / Static Black.",
    preview: '<div class="bog-sticky-bar" data-home-indicator="false" style="position:relative;width:280px;padding-top:0"><span class="bog-inline-message" data-size="small" data-icon="false">Message text</span><div class="bog-sticky-bar__buttons"><button class="bog-btn" data-type="primary" data-width="fill" tabindex="-1">Primary</button></div></div>'
  },
  { id: "progress-bar", name: "Progress Bar", page: "progress-bar.html", figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=42817-6944", desc: "Read-only bar toward a known end: Single or Segmented, Accent / Positive / Warning / Negative / Neutral-inverse, Thin / Thick, labels, skeleton.", preview: '<div style="display:grid;gap:12px;width:220px"><div class="bog-progress" style="--value:60%"><span class="bog-progress__bar"></span></div><div class="bog-progress" data-progress="segmented" data-type="positive" data-size="thick"><span class="bog-progress__bar"><span class="bog-progress__segment" data-state="filled"></span><span class="bog-progress__segment" data-state="filled"></span><span class="bog-progress__segment"></span></span></div></div>' },
  { id: "progress-tracker", name: "Progress Tracker", page: "progress-tracker.html", figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=64634-6060", desc: "Vertical step tracker: completed, current, warning, error and pending steps with a connector; label, helper, description, skeleton.", preview: '<div class="bog-progress-tracker" style="width:200px"><ol class="bog-progress-tracker__steps"><li class="bog-progress-tracker__step" data-status="completed"><span class="bog-progress-tracker__indicator"></span><div class="bog-progress-tracker__content"><p class="bog-progress-tracker__title">Sent</p></div></li><li class="bog-progress-tracker__step" data-status="current"><span class="bog-progress-tracker__indicator"></span><div class="bog-progress-tracker__content"><p class="bog-progress-tracker__title">In review</p></div></li><li class="bog-progress-tracker__step"><span class="bog-progress-tracker__indicator"></span><div class="bog-progress-tracker__content"><p class="bog-progress-tracker__title">Done</p></div></li></ol></div>' },
  {
    id: "tabs",
    updated: "2026-11-03",
    name: "Tabs",
    page: "tabs.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=38862-23400",
    desc: "Fixed or Wrapped (scrolling) tabs with a sliding indicator, keyboard support, tab panels; Default, Pressed, Selected, Disabled, Skeleton.",
    preview: '<div class="bog-tabs" role="tablist" style="width:260px;background:#fff"><button type="button" class="bog-tab" role="tab" aria-selected="true" tabindex="-1">Cards</button><button type="button" class="bog-tab" role="tab" aria-selected="false" tabindex="-1">Deposits</button><button type="button" class="bog-tab" role="tab" aria-selected="false" tabindex="-1">Loans</button></div>'
  },
  {
    id: "tab-bar",
    updated: "2026-11-03",
    name: "Tab Bar",
    page: "tab-bar.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=63155-50986",
    desc: "Bottom app navigation: floating BOG tab bar (Light / Dark, real app icons, notification dots, sliding selection) and the flat iOS / Android Toolbar with home indicator.",
    preview: '<nav class="bog-tab-bar" style="width:300px;padding:4px 0" aria-hidden="true"><div class="bog-tab-bar__items"><span class="bog-tab-bar__item" data-icon="home" aria-current="page"><span class="bog-icon"></span>Home</span><span class="bog-tab-bar__item" data-icon="products"><span class="bog-icon"></span>My Space</span><span class="bog-tab-bar__item" data-icon="payment"><span class="bog-icon"></span>Payments</span><span class="bog-tab-bar__item" data-icon="offer"><span class="bog-icon"></span>Offers<span class="bog-notification-badge" data-status="negative"></span></span><span class="bog-tab-bar__item" data-icon="dashboard"><span class="bog-icon"></span>Hub</span></div></nav>'
  }
];

/* Top-level sections of the workspace. Paths are from the bog-ui folder. */
window.BOG_SECTIONS = [
  { id: "components", name: "Mobile components", href: "index.html" },
  { id: "layout-animations", name: "Layout animations", href: "layout-animations.html" },
  { id: "tokens", name: "Tokens", href: "tokens.html" }
];

/* What's new on the start page — newest first. Add an entry whenever a component changes.
   kind: "motion" | "design" | "component" · page: path from the bog-ui folder */
window.BOG_UPDATES = [
  { date: "2026-11-03", kind: "motion", title: "Radio Button · Unselect", page: "docs/radio.html#motion",
    text: "Tapping the selected option again clears it and the dot shrinks away — on every radio button; data-deselectable=\"false\" turns it off. The slow-motion switch on the page works again." },
  { date: "2026-11-03", kind: "motion", title: "Checkbox · Motion", page: "docs/checkbox.html#motion",
    text: "Same speeds as Radio Button: the box turns orange and the check draws along its path while it grows in with an overshoot; unticking shrinks it away. The indeterminate dash grows from its centre. A BOG UI proposal until the Figma guide lands." },
  { date: "2026-11-03", kind: "motion", title: "Action Item · Selection strip", page: "docs/action-item.html#motion",
    text: "New selection strip for chosen recipients: avatars pop in with a small overshoot, the row slides along, and removing one closes the gap. Try it in the phone preview." },
  { date: "2026-11-03", kind: "motion", title: "Select & Account Select · Motion", page: "docs/select.html#motion",
    text: "Both now document the Bottom Sheet motion they open with: the sheet rises, overshoots 20 px and settles; picking an option drops it away. Same spec as Bottom Sheet." },
  { date: "2026-11-03", kind: "component", title: "Result Page", page: "docs/result.html",
    text: "New full-screen component with motion: the status appears, then the text blocks fade in and rise one after another. Success, Pending, Error and Custom (card flip)." },
  { date: "2026-11-03", kind: "component", title: "Radio Button", page: "docs/radio.html",
    text: "New component with motion: the ring turns orange and the dot grows in with an overshoot. Single buttons, labelled rows and groups, Themed and Inverse." },
  { date: "2026-11-03", kind: "motion", title: "Toggle Switch · Motion", page: "docs/toggle.html#motion",
    text: "The circle slides with a small overshoot and the track colour follows. In and out of Indeterminate it squashes into the bar, overshoots 1 px and settles." },
  { date: "2026-11-03", kind: "component", title: "Toggle Switch", page: "docs/toggle.html",
    text: "New component: on / off switches on their own, as setting rows with a label and description, and in groups. Themed and Inverse." },
  { date: "2026-10-28", kind: "motion", title: "Bottom Sheet · Open motion", page: "docs/bottom-sheet.html#motion",
    text: "Sheets rise from below the screen, overshoot 20 px and settle. Try every state in the new phone preview." },
  { date: "2026-10-28", kind: "motion", title: "Hero Area · Load and slide", page: "docs/hero.html#motion",
    text: "Slots load one after another, 66.7 ms apart for any number of slots; heroes slide between pages while the background cross-fades." },
  { date: "2026-10-28", kind: "motion", title: "Feedback · Toast motion", page: "docs/feedback.html#motion",
    text: "Toasts rise in, overshoot 20 px and settle; they drop back out after 3 s. Try every status in the new phone preview." },
  { date: "2026-10-28", kind: "motion", title: "Account Picker motion", page: "docs/picker.html#motion",
    text: "Chips check on and off, cards expand on select and minimize, the page loads in, and errors shake the list." },
  { date: "2026-10-28", kind: "design", title: "Flat workspace, dark mode and sections", page: "index.html",
    text: "Flat line-and-grid look, a light / dark switch, Motion badges, boxy state grids, and room for Layout animations and Tokens." },
  { date: "2026-10-28", kind: "motion", title: "Inputs · Focus and error motion", page: "docs/text-input.html#input-motion-section",
    text: "Text, Number, Currency, Password and Phone inputs animate Default ⇄ Active, errors, and helper text turning into error text." },
  { date: "2026-10-28", kind: "motion", title: "Modal Dialog · Open and close", page: "docs/modal.html#motion",
    text: "The dialog grows in from 60% while rising 70 px, and shrinks to 62% as it closes — the same for every layout." },
  { date: "2026-10-28", kind: "motion", title: "Number Input · Stepper motion", page: "docs/number-input.html#motion",
    text: "− / + squeeze the button and roll only the digits that change." }
];

/* "Motion" mark for components with motion: true — three outlined circles moving right: the leading
   one full strength, the two trailing ones fainter, on a violet chip. On start page thumbnails (corner) and sidebar rows (right edge). */
window.BOG_MOTION_ICON = '<svg class="docs-motion-icon" viewBox="0 0 22 11" aria-hidden="true" focusable="false"><circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-opacity="0.3"/><circle cx="11" cy="5.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-opacity="0.6"/><circle cx="16.5" cy="5.5" r="4.5" fill="currentColor" stroke="currentColor" stroke-width="1.6"/></svg>';
window.BOG_MOTION_BADGE = '<span class="docs-motion-badge" title="Has motion" role="img" aria-label="Has motion">' + window.BOG_MOTION_ICON + "</span>";
window.BOG_MOTION_CHIP = '<span class="docs-m" title="Has motion" role="img" aria-label="Has motion">' + window.BOG_MOTION_ICON + "</span>";

/* Sorting the component list: "name" (A–Z) or "updated" (newest first, then A–Z).
   The choice is shared by the start page and the sidebar and remembered. */
window.BOG_SORT = (function () {
  var KEY = "bog-ui-sort", listeners = [];
  function get() { try { return localStorage.getItem(KEY) === "updated" ? "updated" : "name"; } catch (e) { return "name"; } }
  function byName(a, b) { return a.name.localeCompare(b.name); }
  return {
    get: get,
    set: function (mode) {
      try { localStorage.setItem(KEY, mode); } catch (e) {}
      listeners.forEach(function (fn) { fn(mode); });
    },
    onChange: function (fn) { listeners.push(fn); },
    list: function (mode) {
      return window.BOG_COMPONENTS.slice().sort(mode === "updated"
        ? function (a, b) { return (b.updated || "").localeCompare(a.updated || "") || byName(a, b); }
        : byName);
    },
    // Segmented switch: <div class="docs-sort" data-sort-switch></div>
    html: function () {
      var m = get();
      return '<span class="docs-sort__label">Sort</span>' + [["name", "Name"], ["updated", "Updated"]].map(function (o) {
        return '<button type="button" data-sort="' + o[0] + '" aria-pressed="' + (m === o[0]) + '">' + o[1] + "</button>";
      }).join("");
    }
  };
})();
document.addEventListener("click", function (e) {
  var b = e.target.closest && e.target.closest("[data-sort-switch] [data-sort]");
  if (b) window.BOG_SORT.set(b.getAttribute("data-sort"));
});
// Search: every word must appear in the component's name or description (case-insensitive)
window.BOG_MATCH = function (c, query) {
  var hay = (c.name + " " + (c.desc || "")).toLowerCase();
  return String(query || "").toLowerCase().split(/\s+/).every(function (w) { return !w || hay.indexOf(w) >= 0; });
};
window.BOG_DATE = function (d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

(function () {
  function sections(prefix, current) {
    return window.BOG_SECTIONS.map(function (s) {
      return '<a href="' + prefix + s.href + '"' + (s.id === current ? ' aria-current="page"' : "") + ">" + s.name + "</a>";
    }).join("");
  }
  function theme() { return window.BOG_THEME ? window.BOG_THEME.button() : ""; }

  /* Sidebar for component pages: <nav id="bog-nav" data-current="button"></nav> */
  var navQuery = "";
  function filterNav(nav) {
    var shown = 0;
    nav.querySelectorAll("li[data-id]").forEach(function (li) {
      var c = window.BOG_COMPONENTS.find(function (x) { return x.id === li.getAttribute("data-id"); });
      li.hidden = !window.BOG_MATCH(c, navQuery);
      if (!li.hidden) shown++;
    });
    var empty = nav.querySelector(".docs-nav__empty");
    if (empty) empty.hidden = shown > 0;
  }
  function renderNav() {
    var nav = document.getElementById("bog-nav");
    if (!nav) return;
    var current = nav.getAttribute("data-current");
    var mode = window.BOG_SORT.get();
    var html = '<div class="docs-nav__sections">' + sections("../", "components") + "</div>" +
      '<div class="docs-nav__head"><a class="docs-nav__home" href="../index.html">Components</a>' +
      '<div class="docs-sort" data-sort-switch>' + window.BOG_SORT.html() + "</div></div>" +
      '<div class="docs-nav__search"><input type="search" class="docs-search" placeholder="Search components" aria-label="Search components" autocomplete="off"></div><ul>';
    window.BOG_SORT.list(mode).forEach(function (c) {
      html += '<li data-id="' + c.id + '"><a href="' + c.page + '"' + (c.id === current ? ' aria-current="page"' : "") +
        (mode === "updated" ? ' title="Updated ' + window.BOG_DATE(c.updated) + '"' : "") + ">" + c.name +
        (c.motion ? window.BOG_MOTION_CHIP : "") + "</a></li>";
    });
    nav.innerHTML = html + '<li class="docs-nav__empty" hidden>No components match</li></ul><div class="docs-nav__foot">' + theme() + "</div>";
    var input = nav.querySelector(".docs-search");
    input.value = navQuery;
    filterNav(nav);
    if (!nav._search) {   // listeners once; the list itself is re-rendered when the sort changes
      nav._search = true;
      nav.addEventListener("input", function (e) {
        if (!e.target.matches(".docs-search")) return;
        navQuery = e.target.value;
        filterNav(nav);
      });
      nav.addEventListener("keydown", function (e) {
        if (!e.target.matches(".docs-search")) return;
        if (e.key === "Enter") {   // open the first match
          var first = nav.querySelector("li[data-id]:not([hidden]) a");
          if (first) location.href = first.getAttribute("href");
        } else if (e.key === "Escape") {
          e.target.value = navQuery = "";
          filterNav(nav);
        }
      });
    }
    var me = window.BOG_COMPONENTS.find(function (c) { return c.id === current; });
    var link = document.getElementById("figma-link");
    if (me && link) link.href = me.figma;
  }

  /* Top bar for the start page and section pages: <header class="docs-top" id="bog-top" data-current="components"></header> */
  function renderTop() {
    var top = document.getElementById("bog-top");
    if (!top) return;
    top.innerHTML = '<a class="docs-top__brand" href="index.html">BOG UI</a>' +
      '<nav class="docs-sections">' + sections("", top.getAttribute("data-current")) + "</nav>" + theme();
  }

  function render() { renderNav(); renderTop(); }
  window.BOG_SORT.onChange(renderNav);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
