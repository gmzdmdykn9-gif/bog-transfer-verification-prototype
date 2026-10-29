/* BOG UI docs — the single list of components.
   Adding a component = add one entry here + create docs/<page>.html from docs/_template.html.
   Used by the start page (index.html) and the sidebar on every component page. */
window.BOG_COMPONENTS = [
  {
    id: "button",
    name: "Button & Icon Button",
    page: "button.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=38686-29051",
    desc: "19 button types, 17 icon-button types, 2 sizes, 5 states, Themed and Inverse.",
    preview: '<button class="bog-btn" data-type="primary" data-size="small">Button</button> <button class="bog-icon-btn" data-type="neutral" data-size="small" aria-label="Icon"><span class="bog-icon"></span></button>'
  },
  {
    id: "text-input",
    name: "Text Input",
    page: "text-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=44129-67424",
    desc: "Floating label, clear button, validation, loading, read-only, disabled, skeleton.",
    preview: '<div class="bog-field" data-state="filled" style="width:220px"><label class="bog-field__box"><span class="bog-field__text"><span class="bog-field__label">Full name</span><input class="bog-field__input" placeholder=" " value="Nino B." tabindex="-1"></span></label></div>'
  },
  {
    id: "amount",
    name: "Amount",
    page: "amount.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=47318-6396",
    desc: "Balance with currency, selector and per-currency balances. 3 sizes, 4 colors.",
    preview: '<div class="bog-amount" data-size="medium"><div class="bog-amount__main"><span class="bog-amount__value">1,000.00</span><span class="bog-amount__currency">₾</span></div></div>'
  },
  {
    id: "ui-elements",
    name: "UI Elements",
    page: "ui-elements.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=54990-3178",
    desc: "Flags, images, illustrations, bank cards, icon containers and counters — used inside other components.",
    preview: '<span class="bog-flag" data-size="32"><img src="ASSETS/flags/ge.svg" alt=""></span> <span class="bog-media-circle" data-size="32"></span> <span class="bog-card-art" data-size="32"></span> <span class="bog-icon-holder" data-size="32"><span class="bog-icon"></span></span> <span class="bog-counter" data-size="32">99+</span>'
  },
  {
    id: "picker",
    name: "Account Picker",
    page: "picker.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=57967-24278",
    desc: "Selectable account card built from Amount, balances and UI Elements. Currency chips, loyalty, card number, IBAN.",
    preview: '<div class="bog-picker" data-selected style="width:260px"><div class="bog-picker__box"><div class="bog-picker__head"><div class="bog-picker__info"><span class="bog-picker__title">Multi-currency Account</span><div class="bog-amount" data-size="medium"><div class="bog-amount__main"><span class="bog-amount__value">1,000.00</span><span class="bog-amount__currency">₾</span></div></div></div><span class="bog-card-art" data-size="40"></span></div></div></div>'
  },
  {
    id: "bottom-sheet",
    name: "Bottom Sheet",
    page: "bottom-sheet.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=50084-32099",
    desc: "Slide-up panel with free content, title/description header, optional sticky bar. Opens with data-sheet-open.",
    preview: '<div style="width:200px;height:112px;overflow:hidden;border-radius:12px;background:#0f0f10ad;display:flex;align-items:flex-end"><div style="width:100%;background:#fff;border-radius:12px 12px 0 0;padding:14px 12px 10px;box-sizing:border-box;position:relative"><div style="position:absolute;top:5px;left:50%;width:24px;height:3px;margin-left:-12px;border-radius:9px;background:#d7d9db"></div><div style="font-weight:600;font-size:13px;margin-bottom:8px">Title</div><div style="height:6px;border-radius:3px;background:#ecedee;margin-bottom:6px"></div><div style="height:6px;width:70%;border-radius:3px;background:#ecedee;margin-bottom:10px"></div><div style="height:22px;border-radius:7px;background:#ff5c0a"></div></div></div>'
  },
  {
    id: "select",
    name: "Select",
    page: "select.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=43757-27381",
    desc: "Input-style trigger that opens a Bottom Sheet with the options. Validation, read-only, disabled, skeleton.",
    preview: '<div class="bog-select" style="width:220px"><div class="bog-select__box"><span class="bog-select__text"><span class="bog-select__label">Country</span><span class="bog-select__value">Georgia</span></span><span class="bog-select__chevron"></span></div></div>'
  },
  {
    id: "action-card",
    name: "Action Card",
    page: "action-card.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=48879-13185",
    desc: "Tappable bordered card with a UI Element slot, title, text, message and chevron. Row/column layouts and groups.",
    preview: '<div class="bog-action-card" style="width:250px;background:#fff"><span class="bog-icon-holder" data-size="40"><span class="bog-icon"></span></span><span class="bog-action-card__content"><span class="bog-action-card__title">Primary text</span><span class="bog-action-card__text">Secondary text</span></span><span class="bog-action-card__chevron"></span></div>'
  },
  {
    id: "action-item",
    name: "Action Item",
    page: "action-item.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=44073-26629",
    desc: "56px circle shortcut with label and amount: Primary, Secondary, Media, Avatar. Badges, remove button, 2/3-item rows.",
    preview: '<div class="bog-action-items" style="width:260px;gap:8px"><div class="bog-action-item" data-type="primary" style="width:80px"><span class="bog-action-item__main"><span class="bog-action-item__circle"><span class="bog-icon"></span></span><span class="bog-action-item__label">Transfer</span></span></div><div class="bog-action-item" data-type="secondary" style="width:80px"><span class="bog-action-item__main"><span class="bog-action-item__circle"><span class="bog-icon"></span></span><span class="bog-action-item__label">Pay</span></span></div><div class="bog-action-item" style="width:80px"><span class="bog-action-item__main"><span class="bog-action-item__circle"><span class="bog-avatar" data-size="56">NB</span></span><span class="bog-action-item__label">Nino</span></span></div></div>'
  },
  {
    id: "list",
    name: "List",
    page: "list.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=45093-6300",
    desc: "List item rows: 1–3+ lines, left/right slots, amounts, chevron, dividers, group header. Skeleton, pressed, disabled.",
    preview: '<div class="bog-list" data-divider style="width:260px;background:#fff;border-radius:12px;padding:0 8px"><div class="bog-list-item"><span class="bog-icon-holder" data-size="40" data-type="outline"><span class="bog-icon"></span></span><span class="bog-list-item__content"><span class="bog-list-item__subtitle">Subtitle</span><span class="bog-list-item__label">Primary Label</span></span><span class="bog-list-item__chevron"></span></div></div>'
  },
  {
    id: "badge",
    name: "Badges",
    page: "badge.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=40620-3172",
    desc: "Status, Currency, Loyalty and Feature badges. Medium/small, high contrast, disabled, skeleton.",
    preview: '<span class="bog-status-badge" data-status="success">Paid</span> <span class="bog-loyalty-badge" data-type="cashback">50% Cashback</span> <span class="bog-currency-badge">GEL</span> <span class="bog-feature-badge" data-type="new">New</span>'
  },
  {
    id: "avatar",
    name: "Avatar",
    page: "avatar.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=41392-4706",
    desc: "Initials, icon or photo · 16–64 · status / action corners · add & overflow button · groups.",
    preview: '<div class="bog-avatar-group"><span class="bog-avatar" data-size="40">NB</span><span class="bog-avatar" data-size="40" data-type="icon"></span><span class="bog-avatar" data-size="40">GK</span><button type="button" class="bog-avatar-btn" data-size="40" data-type="overflow">+9</button></div>'
  },
  {
    id: "checkbox",
    name: "Checkbox",
    page: "checkbox.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=38613-9869",
    desc: "Checkbox, Checkbox + Label and Group. Checked, indeterminate, error, read-only, disabled, skeleton, inverse.",
    preview: '<label class="bog-checkbox"><input type="checkbox" class="bog-checkbox__input" checked><span class="bog-checkbox__text"><span class="bog-checkbox__label">I agree to the terms</span></span></label>'
  },
  {
    id: "chip",
    name: "Chip",
    page: "chip.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=41453-45819",
    desc: "Assist, Suggestion, Filter and Icon-only chips · selected, pressed, disabled, skeleton · chip groups.",
    preview: '<div class="bog-chip-group"><button class="bog-chip" data-type="filter" aria-pressed="true">All</button><button class="bog-chip" data-type="filter" aria-pressed="false">Cards</button><button class="bog-chip"><span class="bog-icon"></span>Help</button></div>'
  },
  {
    id: "feedback",
    name: "Feedback",
    page: "feedback.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=42389-14182",
    desc: "Inline messages and Toasts · 5 statuses · title, actions, close, loading, skeleton · BOG.toast().",
    preview: '<div class="bog-feedback" data-status="positive" style="width:240px"><div class="bog-feedback__text"><p class="bog-feedback__title">Payment sent</p><p class="bog-feedback__desc">50.00 ₾ to Nino B.</p></div></div>'
  },
  {
    id: "empty-state",
    name: "Empty State",
    page: "empty-state.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=46547-9704",
    desc: "Status icon or custom visual, title, description and button · error, warning, success, info · inverse, skeleton.",
    preview: '<div class="bog-empty" data-type="info" style="transform:scale(.7)"><p class="bog-empty__title">No transactions yet</p><p class="bog-empty__desc">Your payments will appear here.</p></div>'
  },
  {
    id: "currency-input",
    name: "Currency Input",
    page: "currency-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=44129-67946",
    desc: "Amount + currency symbol + currency picker (opens a Bottom Sheet) · selectable / fixed / hidden · small 96px input.",
    preview: '<div class="bog-field bog-currency-input" data-state="filled" style="width:240px"><div class="bog-field__box"><span class="bog-field__text"><span class="bog-field__label">Amount</span><span class="bog-currency-input__value"><input class="bog-field__input" value="250.00" tabindex="-1" placeholder=" " style="width:56px"><span class="bog-currency-input__symbol">₾</span></span></span><span class="bog-currency-input__currency"><span class="bog-flag" data-size="16"><img src="ASSETS/flags/ge.svg" alt=""></span>GEL</span></div></div>'
  },
  {
    id: "account-select",
    name: "Account Select",
    page: "account-select.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=44129-69842",
    desc: "Select variant for accounts · card visual · opens a Bottom Sheet of Account Pickers · validation, read-only, disabled, skeleton.",
    preview: '<div class="bog-select" data-variant="account" style="width:240px"><div class="bog-select__box"><span class="bog-select__text"><span class="bog-select__label">Account<span class="bog-select__fav"></span></span><span class="bog-select__value">Main account</span></span><span class="bog-card-art" data-size="40"></span><span class="bog-select__chevron"></span></div></div>'
  },
  {
    id: "hero",
    name: "Hero Area",
    page: "hero.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=47547-44068",
    desc: "Centered header: visual, label, title, description · badges, feedback and actions · skeleton.",
    preview: '<section class="bog-hero" style="padding:0;transform:scale(.8)"><div class="bog-hero__content" style="padding:0"><span class="bog-avatar" data-size="48">NB</span><div class="bog-hero__text"><h1 class="bog-hero__title">Nino Beridze</h1><p class="bog-hero__desc">Premium client</p></div></div></section>'
  },
  {
    id: "product-card",
    name: "Product Card",
    page: "product-card.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=53662-4573",
    desc: "Product summary card: title, Amount with balances, card stack or other media · empty, pressed, skeleton.",
    preview: '<div class="bog-product-card" style="width:250px"><div class="bog-product-card__info"><span class="bog-product-card__title">Account</span><div class="bog-amount" data-size="medium"><div class="bog-amount__main"><span class="bog-amount__value">1,000.00</span><span class="bog-amount__currency">₾</span></div></div></div><span class="bog-product-card__media" data-more><span class="bog-card-art" data-size="40"></span></span></div>'
  },
  {
    id: "inline-message",
    name: "Inline Message",
    page: "inline-message.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=41453-34518",
    desc: "One-line status message · 6 statuses · medium/small · left/right · inverse, disabled, skeleton.",
    preview: '<div style="display:flex;flex-direction:column;gap:8px"><span class="bog-inline-message" data-status="positive">Payment sent</span><span class="bog-inline-message" data-status="negative">Insufficient funds</span><span class="bog-inline-message" data-status="info">Updated just now</span></div>'
  },
  {
    id: "notification-badge",
    name: "Notification Badge",
    page: "notification-badge.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=41563-26011",
    desc: "Count / dot badge · accent, negative, warning, positive, neutral · inverse · auto corner placement.",
    preview: '<button class="bog-icon-btn" data-type="neutral" aria-label="x"><span class="bog-icon"></span><span class="bog-notification-badge">3</span></button> <span class="bog-notification-badge" data-status="negative">44+</span> <span class="bog-notification-badge"></span>'
  },
  {
    id: "number-input",
    name: "Number Input",
    page: "number-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=44129-68889",
    desc: "Text Input with − / + stepper buttons.",
    preview: '<div class="bog-field bog-number-input" style="width:260px"><label class="bog-field__box"><span class="bog-field__text"><span class="bog-field__label">Enter amount</span><input class="bog-field__input" placeholder=" " value="100" tabindex="-1"></span><span class="bog-number-input__stepper"><span class="bog-icon-btn" data-type="neutral" data-size="small"><span class="bog-icon" data-icon="minus"></span></span><span class="bog-icon-btn" data-type="neutral" data-size="small"><span class="bog-icon" data-icon="plus"></span></span></span></label></div>'
  },
  {
    id: "password-input",
    name: "Password Input",
    page: "password-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=65690-6315",
    desc: "Masked input with eye toggle and a live requirements checklist.",
    preview: '<div class="bog-field bog-password-input" style="width:260px"><label class="bog-field__box"><span class="bog-field__text"><span class="bog-field__label">Enter Password</span><input class="bog-field__input" type="password" placeholder=" " value="secret1234" tabindex="-1"></span><span class="bog-password-input__toggle"></span></label></div>'
  },
  {
    id: "phone-input",
    name: "Phone Input",
    page: "phone-input.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=61708-3382",
    desc: "Phone number with a country-code picker (opens a Bottom Sheet).",
    preview: '<div class="bog-field bog-phone-input" style="width:260px"><label class="bog-field__box"><span class="bog-phone-input__country"><span class="bog-flag" data-size="20"><img src="assets/flags/ge.svg" alt=""></span><span class="bog-phone-input__code">+995</span></span><span class="bog-field__text"><span class="bog-field__label">Phone number</span><input class="bog-field__input" placeholder=" " tabindex="-1"></span></label></div>'
  },
  {
    id: "modal",
    name: "Modal Dialog",
    page: "modal.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=52913-5147",
    desc: "Centered dialog with title, content and 1–2 buttons. Opens with data-modal-open.",
    preview: '<div class="bog-modal__dialog" style="width:240px;transform:none"><header class="bog-modal__header"><span class="bog-modal__title" style="font:600 16px/24px var(--font-family-bog)">Modal dialog</span></header><div class="bog-modal__body" style="padding-block:4px 8px"><p class="bog-modal__text" style="font-size:12px;line-height:16px">Body text goes here.</p></div><footer class="bog-modal__footer"><span class="bog-btn" data-type="primary" data-size="small">Confirm</span></footer></div>'
  },
  {
    id: "radio-card",
    name: "Radio Card",
    page: "radio-card.html",
    figma: "https://www.figma.com/design/EI6tYmEC7DhjpnzeuF5C45/?node-id=22114-3977",
    desc: "Bordered single-choice option with title, description and radio. Left / Right, Error, Read-only, Disabled, Skeleton.",
    preview: '<label class="bog-radio-card" style="width:220px"><input type="radio" class="bog-radio-card__input" name="pv-rc" checked tabindex="-1"><span class="bog-radio-card__box"><span class="bog-radio-card__content"><span class="bog-radio-card__title">Title</span><span class="bog-radio-card__desc">Description</span></span><span class="bog-radio-card__radio"></span></span></label>'
  },
];

/* Sidebar for component pages: <nav id="bog-nav" data-current="button"></nav> */
(function () {
  function renderNav() {
    var nav = document.getElementById("bog-nav");
    if (!nav) return;
    var current = nav.getAttribute("data-current");
    var html = '<a class="docs-nav__home" href="../index.html">← All components</a><ul>';
    window.BOG_COMPONENTS.forEach(function (c) {
      html += '<li><a href="' + c.page + '"' + (c.id === current ? ' aria-current="page"' : "") + ">" + c.name + "</a></li>";
    });
    nav.innerHTML = html + "</ul>";
    var me = window.BOG_COMPONENTS.find(function (c) { return c.id === current; });
    var link = document.getElementById("figma-link");
    if (me && link) link.href = me.figma;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderNav);
  else renderNav();
})();
