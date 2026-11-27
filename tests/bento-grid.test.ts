import { describe, expect, it, vi } from "vitest";
import {
  BENTO_GRID_CONTENT_CSS,
  buildBentoGridHtml,
  registerBentoGridPlugin,
  type TinyMceEditorLike,
} from "../src/index";

describe("buildBentoGridHtml", () => {
  it("builds default 2-column 4-tile grid with trailing paragraph", () => {
    const html = buildBentoGridHtml();
    expect(html).toContain('class="bento-grid bento-cols-2"');
    expect(html.match(/class="bento-tile"/g)?.length).toBe(4);
    expect(html.endsWith("<p><br /></p>")).toBe(true);
  });

  it("clamps tile count between 2 and 12 and escapes HTML in labels", () => {
    const low = buildBentoGridHtml({ count: 0 });
    expect(low.match(/class="bento-tile"/g)?.length).toBe(2);

    const high = buildBentoGridHtml({
      count: 99,
      layout: "featured",
      variant: "elevated",
      titlePrefix: '<script>x</script>',
    });
    expect(high.match(/class="bento-tile"/g)?.length).toBe(12);
    expect(high).toContain('class="bento-grid bento-featured bento-elevated"');
    expect(high).not.toContain("<script>");
    expect(high).toContain("&lt;script&gt;x&lt;/script&gt;");
  });
});

describe("registerBentoGridPlugin", () => {
  it("registers icon, button, menu item, context toolbar and inserts HTML on submit", () => {
    const buttons: Record<string, Record<string, unknown>> = {};
    const menus: Record<string, Record<string, unknown>> = {};
    const toolbars: Record<string, Record<string, unknown>> = {};
    const icons: Record<string, string> = {};
    let openedDialog: Record<string, unknown> | null = null;
    const inserted: string[] = [];

    const editor: TinyMceEditorLike = {
      ui: {
        registry: {
          addIcon: (name, svg) => {
            icons[name] = svg;
          },
          addButton: (name, spec) => {
            buttons[name] = spec;
          },
          addMenuItem: (name, spec) => {
            menus[name] = spec;
          },
          addContextToolbar: (name, spec) => {
            toolbars[name] = spec;
          },
        },
      },
      windowManager: {
        open: (spec) => {
          openedDialog = spec;
        },
      },
      selection: {
        getNode: () => ({}) as HTMLElement,
      },
      dom: {
        getParent: () => null,
      },
      insertContent: (html) => {
        inserted.push(html);
      },
    };

    registerBentoGridPlugin(editor, {
      defaultLayout: "hero-2",
      defaultCount: 3,
      labels: { buttonTooltip: "Bento" },
    });

    expect(icons["bento-grid"]).toContain("<svg");
    expect(buttons["bentoGrid"].tooltip).toBe("Bento");
    expect(menus["bentoGrid"]).toBeDefined();
    expect(toolbars["bentoTileToolbar"]).toBeDefined();

    // Trigger toolbar button -> opens dialog -> submit
    (buttons["bentoGrid"].onAction as () => void)();
    expect(openedDialog).not.toBeNull();
    const close = vi.fn();
    (
      openedDialog!.onSubmit as (api: {
        getData: () => { layout: string; count: string; variant: string };
        close: () => void;
      }) => void
    )({
      getData: () => ({ layout: "hero-2", count: "3", variant: "compact" }),
      close,
    });

    expect(close).toHaveBeenCalledTimes(1);
    expect(inserted[0]).toContain('class="bento-grid bento-hero-2 bento-compact"');
    expect(inserted[0].match(/class="bento-tile"/g)?.length).toBe(3);
    expect(BENTO_GRID_CONTENT_CSS).toContain(".bento-grid");
  });
});
