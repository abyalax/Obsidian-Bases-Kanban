/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { App, BasesEntry, QueryController } from "obsidian";
import { MarkdownRenderer } from "obsidian";
import { CSS_CLASSES } from "./constants.ts";

/**
 * CardDetailPanel - Asana/GitHub style slide-in panel for viewing/editing card details
 */
export class CardDetailPanel {
  private readonly getApp: () => App;
  private readonly controller: QueryController;
  private readonly containerEl: HTMLElement;
  private panelEl: HTMLElement | null = null;
  private backdropEl: HTMLElement | null = null;
  private currentEntry: BasesEntry | null = null;
  private _isOpen = false;

  constructor(getApp: () => App, controller: QueryController) {
    this.getApp = getApp;
    this.controller = controller;
    this.containerEl = getApp().workspace.containerEl;
    this.createPanel();
  }

  private createPanel(): void {
    this.panelEl = this.containerEl.createDiv({
      cls: `${CSS_CLASSES.CARD_DETAIL_PANEL} ${CSS_CLASSES.CARD_DETAIL_PANEL_CLOSED}`,
    });

    // Overlay backdrop - separate element covering entire screen
    this.backdropEl = document.createElement("div");
    this.backdropEl.className = CSS_CLASSES.CARD_DETAIL_BACKDROP;
    this.backdropEl.addEventListener("click", () => this.close());
    document.body.appendChild(this.backdropEl);

    // Panel content
    const content = this.panelEl.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_CONTENT,
    });

    // Header with close button
    const header = content.createDiv({ cls: CSS_CLASSES.CARD_DETAIL_HEADER });
    const title = header.createDiv({ cls: CSS_CLASSES.CARD_DETAIL_TITLE });
    title.textContent = "Card details";

    const closeBtn = header.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_CLOSE_BTN,
      text: "×",
    });
    closeBtn.addEventListener("click", () => this.close());

    // Body for dynamic content
    const body = content.createDiv({ cls: CSS_CLASSES.CARD_DETAIL_BODY });
    body.createDiv({
      cls: CSS_CLASSES.EMPTY_STATE,
      text: "Select a card to view details",
    });
  }

  open(entry: BasesEntry): void {
    if (!this.panelEl) return;

    this.currentEntry = entry;
    this._isOpen = true;
    this.panelEl.classList.remove(CSS_CLASSES.CARD_DETAIL_PANEL_CLOSED);
    this.panelEl.classList.add(CSS_CLASSES.CARD_DETAIL_PANEL_OPEN);

    this.renderContent(entry);
  }

  close(): void {
    if (!this.panelEl) return;

    this._isOpen = false;
    this.currentEntry = null;
    this.panelEl.classList.remove(CSS_CLASSES.CARD_DETAIL_PANEL_OPEN);
    this.panelEl.classList.add(CSS_CLASSES.CARD_DETAIL_PANEL_CLOSED);

    // Clear content
    const body = this.panelEl.querySelector(`.${CSS_CLASSES.CARD_DETAIL_BODY}`);
    if (body) {
      body.empty();
      body.createDiv({
        cls: CSS_CLASSES.EMPTY_STATE,
        text: "Select a card to view details",
      });
    }
  }

  destroy(): void {
    if (this.backdropEl) {
      this.backdropEl.remove();
      this.backdropEl = null;
    }
    if (this.panelEl) {
      this.panelEl.remove();
      this.panelEl = null;
    }
    this.currentEntry = null;
    this._isOpen = false;
  }

  getCurrentEntryPath(): string | null {
    return this.currentEntry?.file.path ?? null;
  }

  isOpen(): boolean {
    return this._isOpen;
  }

  private renderContent(entry: BasesEntry): void {
    const body = this.panelEl?.querySelector(
      `.${CSS_CLASSES.CARD_DETAIL_BODY}`,
    );
    if (!body) return;

    body.empty();

    // File title
    const titleSection = body.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_SECTION,
    });
    const titleEl = titleSection.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_FILE_TITLE,
    });
    titleEl.textContent = entry.file.basename;

    // File path
    const pathSection = body.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_SECTION,
    });
    const pathEl = pathSection.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_FILE_PATH,
    });
    pathEl.textContent = entry.file.path;

    // Properties
    const propsSection = body.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_SECTION,
    });
    const propsTitle = propsSection.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_SECTION_TITLE,
    });
    propsTitle.textContent = "Properties";

    const propsList = propsSection.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_PROPERTIES,
    });

    // Get view config from controller's parent view
    const controllerWithView = this.controller as QueryController & {
      view: {
        config: {
          getOrder(): string[];
          getDisplayName(id: string): string;
        };
      };
    };
    const view = controllerWithView.view;
    const order = view?.config?.getOrder() ?? [];
    for (const propertyId of order) {
      const value = entry.getValue(
        propertyId as `note.${string}` | `formula.${string}` | `file.${string}`,
      );
      if (value === null) continue;

      const valueStr = value.toString().trim();
      if (!valueStr || valueStr === "null") continue;

      // Extract property name from propertyId (e.g., "note.status" -> "status")
      const propertyName = propertyId.includes(".")
        ? propertyId.split(".")[1]
        : propertyId;
      const label = view?.config?.getDisplayName(propertyId) ?? propertyName;

      const propItem = propsList.createDiv({
        cls: CSS_CLASSES.CARD_DETAIL_PROPERTY,
      });
      propItem.createSpan({
        cls: CSS_CLASSES.CARD_DETAIL_PROPERTY_LABEL,
        text: label,
      });

      const valueEl = propItem.createDiv({
        cls: CSS_CLASSES.CARD_DETAIL_PROPERTY_VALUE,
      });

      // Handle markdown content
      if (valueStr.includes("[[")) {
        void MarkdownRenderer.render(
          this.getApp(),
          valueStr,
          valueEl,
          entry.file.path,
          null,
        );
      } else {
        valueEl.textContent = valueStr;
      }
    }

    // Actions
    const actionsSection = body.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_SECTION,
    });
    const openFileBtn = actionsSection.createDiv({
      cls: CSS_CLASSES.CARD_DETAIL_BUTTON,
      text: "Open file",
    });
    openFileBtn.addEventListener("click", () => {
      if (this.getApp().workspace) {
        void this.getApp().workspace.openLinkText(entry.file.path, "", false);
      }
    });
  }
}
