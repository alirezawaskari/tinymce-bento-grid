# tinymce-bento-grid

Zero-dependency **Bento Grid** block plugin for **TinyMCE 6 & 7** with responsive mobile/desktop CSS and full RTL support.

Instead of abusing `<table>` tags (which overflow on mobile), writers can insert real CSS Grid Bento layouts directly from TinyMCE's toolbar — with live grid preview inside the editor and a contextual toolbar to add tiles, toggle full-width spans, or remove tiles.

## Features

- **TinyMCE 6 & 7 GPL compatible** — uses TinyMCE's built-in `ui.registry` and `windowManager` APIs (zero paid plugins, zero runtime dependencies)
- **4 responsive presets**:
  - `cols-2` — balanced 2-column grid
  - `cols-3` — 3 columns on desktop, 2 on tablet, 1 on narrow mobile
  - `hero-2` — full-width hero tile + 2-column tiles
  - `featured` — 2×2 featured tile + side tiles on desktop, clean stack on mobile
- **Contextual tile toolbar** — click any tile inside the editor to `+ Tile`, toggle `Full Width`, or `Remove Tile`
- **RTL & i18n ready** — pass custom `labels` for Persian, Arabic, or any locale
- **TinyMCE `content_style` included** — renders the Bento Grid visually while editing

## Installation

```bash
npm install tinymce-bento-grid
# or
yarn add tinymce-bento-grid
```

## Usage (TinyMCE / `@tinymce/tinymce-react`)

1. Import the public stylesheet once in your app (e.g. `globals.css` or `_app.tsx`):

```css
@import "tinymce-bento-grid/styles.css";
```

2. Register the plugin in your TinyMCE `init`:

```ts
import {
  registerBentoGridPlugin,
  BENTO_GRID_CONTENT_CSS,
} from "tinymce-bento-grid";

export const tinymceInit = {
  // ...
  toolbar: "undo redo | blocks | bold italic | bentoGrid | link image",
  content_style: `body { font-family: sans-serif; } ${BENTO_GRID_CONTENT_CSS}`,
  setup: (editor) => {
    registerBentoGridPlugin(editor, {
      defaultLayout: "cols-2",
      defaultCount: 4,
    });
  },
};
```

## Localization (i18n)

Pass any subset of `labels` to localize the dialog, toolbar tooltip, and default tile text:

```ts
registerBentoGridPlugin(editor, {
  labels: {
    buttonTooltip: "افزودن چیدمان بنتو (Bento Grid)",
    dialogTitle: "درج شبکهٔ بنتو",
    layoutLabel: "چیدمان",
    insertButton: "درج در متن",
    cancelButton: "انصراف",
  },
});
```

## CSS Customization

Override any CSS custom property on `.bento-grid`:

```css
.bento-grid {
  --bento-gap: 1rem;
  --bento-radius: 1rem;
  --bento-border: #e5e7eb;
  --bento-tile-bg: #ffffff;
  --bento-title-color: #111827;
  --bento-text-color: #4b5563;
}
```

## License

MIT
