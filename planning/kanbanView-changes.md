# kanbanView.ts — fix untuk CardDetailPanel integration

## Masalah: `this.app` undefined di constructor

`BasesView` inject `this.app` SETELAH `super(controller)` selesai via property
injection. Jadi `new CardDetailPanel(this.app, ...)` di constructor memberikan
`undefined`.

## Fix: ganti dengan lazy getter

### Change 1: Constructor — ganti instantiasi CardDetailPanel

SEBELUM (line 161-165):
```typescript
this._detailPanel = new CardDetailPanel(
  this.app,
  this._controller,
  this.scrollEl,
);
```

SESUDAH:
```typescript
// Pass a lazy getter instead of this.app directly.
// BasesView injects `app` after super() — if we capture it now it's undefined.
this._detailPanel = new CardDetailPanel(
  () => this.app,   // <-- lazy getter, evaluated at open() time
  this._controller,
);
```

### Change 2: Hapus `this.scrollEl` dari parameter CardDetailPanel

CardDetailPanel tidak lagi terima `scrollEl` — ia inject ke
`app.workspace.containerEl` sendiri secara internal. Constructor signature baru:

```typescript
constructor(getApp: () => App, controller: QueryController)
```

### Change 3: isOpenPanel() → isOpen()

Method di panel sekarang bernama `isOpen()`, bukan `isOpenPanel()`.
Update di click handler (line 696):

SEBELUM:
```typescript
this._detailPanel.isOpenPanel()
```

SESUDAH:
```typescript
this._detailPanel.isOpen()
```

---

## Constants yang perlu ditambah ke constants.ts CSS_CLASSES

Tambahkan ke object `CSS_CLASSES` yang sudah ada:

```typescript
// Card detail panel wrapper (injected into workspace.containerEl)
CARD_DETAIL_WRAPPER:        "obk-card-detail-wrapper",
CARD_DETAIL_ACTIONS:        "obk-card-detail-actions",
CARD_DETAIL_BTN:            "obk-card-detail-btn",
CARD_DETAIL_BTN_OPEN:       "obk-card-detail-btn--open",
CARD_DETAIL_PROPERTY_INPUT: "obk-card-detail-property-input",
CARD_DETAIL_TEXTAREA:       "obk-card-detail-textarea",
CARD_DETAIL_MD_WRAP:        "obk-card-detail-md-wrap",
CARD_DETAIL_MD_TOGGLE:      "obk-card-detail-md-toggle",
CARD_DETAIL_PREVIEW:        "obk-card-detail-preview",
```

(CARD_DETAIL_PANEL, CARD_DETAIL_BACKDROP, CARD_DETAIL_HEADER, CARD_DETAIL_TITLE,
CARD_DETAIL_CLOSE_BTN, CARD_DETAIL_BODY, CARD_DETAIL_SECTION,
CARD_DETAIL_SECTION_TITLE, CARD_DETAIL_FILE_TITLE, CARD_DETAIL_FILE_PATH,
CARD_DETAIL_PROPERTIES, CARD_DETAIL_PROPERTY, CARD_DETAIL_PROPERTY_LABEL,
CARD_DETAIL_PROPERTY_VALUE, CARD_DETAIL_BUTTON sudah ada di constants.ts)
