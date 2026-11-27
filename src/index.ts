export type BentoLayoutPreset = "cols-2" | "cols-3" | "hero-2" | "featured";
export type BentoStyleVariant = "default" | "compact" | "elevated";

export interface BentoGridLabels {
  buttonTooltip: string;
  menuText: string;
  dialogTitle: string;
  layoutLabel: string;
  layoutCols2: string;
  layoutCols3: string;
  layoutHero2: string;
  layoutFeatured: string;
  tileCountLabel: string;
  variantLabel: string;
  variantDefault: string;
  variantCompact: string;
  variantElevated: string;
  insertButton: string;
  cancelButton: string;
  defaultTileTitle: string;
  defaultTileBody: string;
  ctxAddTile: string;
  ctxToggleFull: string;
  ctxRemoveTile: string;
}

export interface BentoGridOptions {
  defaultLayout?: BentoLayoutPreset;
  defaultCount?: number;
  defaultVariant?: BentoStyleVariant;
  labels?: Partial<BentoGridLabels>;
}

export interface BuildBentoGridInput {
  layout?: BentoLayoutPreset;
  count?: number;
  variant?: BentoStyleVariant;
  titlePrefix?: string;
  defaultBody?: string;
}

/** Minimal structural TinyMCE Editor interface (compatible with TinyMCE 6 & 7). */
export interface TinyMceEditorLike {
  ui: {
    registry: {
      addIcon(name: string, svgData: string): void;
      addButton(name: string, spec: Record<string, unknown>): void;
      addMenuItem?(name: string, spec: Record<string, unknown>): void;
      addContextToolbar?(name: string, spec: Record<string, unknown>): void;
    };
  };
  windowManager: {
    open(spec: Record<string, unknown>): void;
  };
  selection: {
    getNode(): HTMLElement;
    select?(node: Element, collapse?: boolean): void;
  };
  dom: {
    getParent(
      node: Node | null,
      selector: string,
    ): HTMLElement | null;
    toggleClass?(node: HTMLElement, cls: string): void;
    remove?(node: HTMLElement): void;
    create?(
      name: string,
      attrs?: Record<string, string>,
      html?: string,
    ): HTMLElement;
    insertAfter?(node: Node, referenceNode: Node): Node;
  };
  insertContent(content: string): void;
  undoManager?: {
    transact(fn: () => void): void;
  };
}

export const DEFAULT_BENTO_LABELS: BentoGridLabels = {
  buttonTooltip: "Insert Bento Grid",
  menuText: "Bento Grid",
  dialogTitle: "Insert Bento Grid",
  layoutLabel: "Grid Layout",
  layoutCols2: "2 Columns (Balanced)",
  layoutCols3: "3 Columns",
  layoutHero2: "Hero + 2-Column Tiles",
  layoutFeatured: "Featured (1 Large + Side Tiles)",
  tileCountLabel: "Number of Tiles (2–12)",
  variantLabel: "Style",
  variantDefault: "Default",
  variantCompact: "Compact",
  variantElevated: "Elevated (Shadow)",
  insertButton: "Insert Grid",
  cancelButton: "Cancel",
  defaultTileTitle: "Title",
  defaultTileBody: "Enter card description or specification here...",
  ctxAddTile: "+ Tile",
  ctxToggleFull: "Full Width",
  ctxRemoveTile: "Remove Tile",
};

const BENTO_SVG_ICON =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="3" y="3" width="8" height="10" rx="2"/>' +
  '<rect x="13" y="3" width="8" height="5" rx="1.5"/>' +
  '<rect x="13" y="10" width="8" height="11" rx="2"/>' +
  '<rect x="3" y="15" width="8" height="6" rx="1.5"/>' +
  "</svg>";

/** CSS injected into TinyMCE `content_style` so Bento Grids render visually while editing. */
export const BENTO_GRID_CONTENT_CSS = `
.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0;
  padding: 10px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  box-sizing: border-box;
}
.bento-grid.bento-cols-3,
.bento-grid.bento-featured {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.bento-grid.bento-compact {
  gap: 8px;
  padding: 8px;
}
.bento-tile {
  min-width: 0;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  box-sizing: border-box;
}
.bento-grid.bento-elevated .bento-tile {
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}
.bento-grid.bento-hero-2 > .bento-tile:first-child,
.bento-tile.bento-span-full {
  grid-column: 1 / -1;
}
.bento-grid.bento-featured > .bento-tile:first-child {
  grid-column: span 2;
  grid-row: span 2;
}
.bento-tile-title {
  margin: 0 0 6px 0;
  font-size: 0.95em;
  font-weight: 700;
  color: #0f172a;
}
.bento-tile-body {
  margin: 0;
  font-size: 0.9em;
  color: #475569;
}
`;

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const clampTileCount = (count: number | undefined): number => {
  const n = Number.isFinite(count) ? Math.round(count as number) : 4;
  return Math.max(2, Math.min(12, n));
};

const VALID_LAYOUTS = new Set<BentoLayoutPreset>([
  "cols-2",
  "cols-3",
  "hero-2",
  "featured",
]);

const VALID_VARIANTS = new Set<BentoStyleVariant>([
  "default",
  "compact",
  "elevated",
]);

/** Builds semantic HTML for a Bento Grid block ready to insert into TinyMCE. */
export function buildBentoGridHtml(input: BuildBentoGridInput = {}): string {
  const layout: BentoLayoutPreset = VALID_LAYOUTS.has(input.layout as BentoLayoutPreset)
    ? (input.layout as BentoLayoutPreset)
    : "cols-2";
  const variant: BentoStyleVariant = VALID_VARIANTS.has(input.variant as BentoStyleVariant)
    ? (input.variant as BentoStyleVariant)
    : "default";
  const count = clampTileCount(input.count);
  const titlePrefix = escapeHtml(input.titlePrefix ?? DEFAULT_BENTO_LABELS.defaultTileTitle);
  const body = escapeHtml(input.defaultBody ?? DEFAULT_BENTO_LABELS.defaultTileBody);

  const classes = ["bento-grid", `bento-${layout}`];
  if (variant !== "default") classes.push(`bento-${variant}`);

  const tiles = Array.from({ length: count }, (_, idx) => {
    const num = idx + 1;
    return (
      `<div class="bento-tile">` +
      `<h3 class="bento-tile-title">${titlePrefix} ${num}</h3>` +
      `<p class="bento-tile-body">${body}</p>` +
      `</div>`
    );
  }).join("");

  return `<div class="${classes.join(" ")}">${tiles}</div><p><br /></p>`;
}

const buildTileElement = (
  editor: TinyMceEditorLike,
  labels: BentoGridLabels,
): HTMLElement | null => {
  if (!editor.dom.create) return null;
  return editor.dom.create(
    "div",
    { class: "bento-tile" },
    `<h3 class="bento-tile-title">${escapeHtml(labels.defaultTileTitle)}</h3>` +
      `<p class="bento-tile-body">${escapeHtml(labels.defaultTileBody)}</p>`,
  );
};

/**
 * Registers the Bento Grid toolbar button, insert menu item, modal dialog,
 * and tile context toolbar on a TinyMCE 6/7 editor instance.
 */
export function registerBentoGridPlugin(
  editor: TinyMceEditorLike,
  options: BentoGridOptions = {},
): void {
  const labels: BentoGridLabels = {
    ...DEFAULT_BENTO_LABELS,
    ...options.labels,
  };
  const defaultLayout = options.defaultLayout ?? "cols-2";
  const defaultCount = String(clampTileCount(options.defaultCount ?? 4));
  const defaultVariant = options.defaultVariant ?? "default";

  editor.ui.registry.addIcon("bento-grid", BENTO_SVG_ICON);

  const openDialog = () => {
    editor.windowManager.open({
      title: labels.dialogTitle,
      body: {
        type: "panel",
        items: [
          {
            type: "selectbox",
            name: "layout",
            label: labels.layoutLabel,
            items: [
              { text: labels.layoutCols2, value: "cols-2" },
              { text: labels.layoutHero2, value: "hero-2" },
              { text: labels.layoutCols3, value: "cols-3" },
              { text: labels.layoutFeatured, value: "featured" },
            ],
          },
          {
            type: "input",
            name: "count",
            label: labels.tileCountLabel,
            inputMode: "numeric",
          },
          {
            type: "selectbox",
            name: "variant",
            label: labels.variantLabel,
            items: [
              { text: labels.variantDefault, value: "default" },
              { text: labels.variantCompact, value: "compact" },
              { text: labels.variantElevated, value: "elevated" },
            ],
          },
        ],
      },
      initialData: {
        layout: defaultLayout,
        count: defaultCount,
        variant: defaultVariant,
      },
      buttons: [
        { type: "cancel", text: labels.cancelButton },
        { type: "submit", text: labels.insertButton, buttonType: "primary" },
      ],
      onSubmit: (api: { getData: () => { layout: string; count: string; variant: string }; close: () => void }) => {
        const data = api.getData();
        const html = buildBentoGridHtml({
          layout: data.layout as BentoLayoutPreset,
          count: Number.parseInt(data.count, 10),
          variant: data.variant as BentoStyleVariant,
          titlePrefix: labels.defaultTileTitle,
          defaultBody: labels.defaultTileBody,
        });
        editor.insertContent(html);
        api.close();
      },
    });
  };

  editor.ui.registry.addButton("bentoGrid", {
    icon: "bento-grid",
    tooltip: labels.buttonTooltip,
    onAction: openDialog,
  });

  editor.ui.registry.addMenuItem?.("bentoGrid", {
    icon: "bento-grid",
    text: labels.menuText,
    onAction: openDialog,
  });

  // Contextual controls when cursor is inside a .bento-tile
  editor.ui.registry.addButton("bentoAddTile", {
    text: labels.ctxAddTile,
    onAction: () => {
      const tile = editor.dom.getParent(editor.selection.getNode(), ".bento-tile");
      const newTile = buildTileElement(editor, labels);
      if (!tile || !newTile || !editor.dom.insertAfter) return;
      const run = () => {
        editor.dom.insertAfter?.(newTile, tile);
      };
      if (editor.undoManager) editor.undoManager.transact(run);
      else run();
    },
  });

  editor.ui.registry.addButton("bentoToggleFull", {
    text: labels.ctxToggleFull,
    onAction: () => {
      const tile = editor.dom.getParent(editor.selection.getNode(), ".bento-tile");
      if (!tile || !editor.dom.toggleClass) return;
      const run = () => {
        editor.dom.toggleClass?.(tile, "bento-span-full");
      };
      if (editor.undoManager) editor.undoManager.transact(run);
      else run();
    },
  });

  editor.ui.registry.addButton("bentoRemoveTile", {
    text: labels.ctxRemoveTile,
    onAction: () => {
      const tile = editor.dom.getParent(editor.selection.getNode(), ".bento-tile");
      const grid = editor.dom.getParent(editor.selection.getNode(), ".bento-grid");
      if (!tile || !editor.dom.remove) return;
      const run = () => {
        if (grid && grid.querySelectorAll(".bento-tile").length <= 1) {
          editor.dom.remove?.(grid);
        } else {
          editor.dom.remove?.(tile);
        }
      };
      if (editor.undoManager) editor.undoManager.transact(run);
      else run();
    },
  });

  editor.ui.registry.addContextToolbar?.("bentoTileToolbar", {
    predicate: (node: Node) => Boolean(editor.dom.getParent(node, ".bento-tile")),
    items: "bentoAddTile bentoToggleFull bentoRemoveTile",
    position: "node",
    scope: "node",
  });
}
