interface ModalConfig {
  scrollLock?: {
    enabled: boolean;
    styles?: {
      hidden: Partial<CSSStyleDeclaration>;
      visible: Partial<CSSStyleDeclaration>;
    };
  };
  outsideClickClose?: boolean;
  escapeClose?: boolean;
  closeOthersOnOpen?: boolean;
  onToggle?: (menuId: string, isOpen: boolean) => void;
  attributes?: {
    stateAttribute?: string;
  };
}

interface ModalDefinition {
  id: string;
  triggerElements: string[];
  contentElement: string;
  closeElements: string[];
  containers: string[];
}

class ModalController {
  private menus: Map<
    string,
    {
      content: HTMLElement | null;
      triggers: HTMLElement[];
      closeButtons: HTMLElement[];
      containers: HTMLElement[];
    }
  > = new Map();

  private activeModalId: string | null = null;
  private config: Required<ModalConfig>;

  constructor(menuDefinitions: ModalDefinition[], config: ModalConfig = {}) {
    // Default config değerlerini ayarla
    this.config = {
      scrollLock: {
        enabled: config.scrollLock?.enabled ?? true,
        styles: {
          hidden: {
            overflow: "hidden",
            position: "fixed",
            width: "100%",
            ...config.scrollLock?.styles?.hidden,
          },
          visible: {
            overflow: "auto",
            position: "static",
            width: "auto",
            ...config.scrollLock?.styles?.visible,
          },
        },
      },
      outsideClickClose: config.outsideClickClose ?? true,
      escapeClose: config.escapeClose ?? true,
      closeOthersOnOpen: config.closeOthersOnOpen ?? true,
      onToggle: config.onToggle || (() => {}),
      attributes: {
        stateAttribute: config.attributes?.stateAttribute ?? "data-state",
      },
    };

    this.initializeModals(menuDefinitions);
    this.setupEventListeners();
  }

  private initializeModals(menuDefinitions: ModalDefinition[]): void {
    menuDefinitions.forEach((menu) => {
      const content = document.querySelector(menu.contentElement);
      if (!content) {
        console.warn(`Modal content element not found: ${menu.contentElement}`);
        return;
      }

      const triggers = menu.triggerElements
        .map((selector) => document.querySelector(selector))
        .filter((el): el is HTMLElement => el !== null);

      const closeButtons = (menu.closeElements || [])
        .map((selector) => document.querySelector(selector))
        .filter((el): el is HTMLElement => el !== null);

      const container = (menu.containers || [])
        .map((selector) => document.querySelector(selector))
        .filter((el): el is HTMLElement => el !== null);

      this.menus.set(menu.id, {
        content: content as HTMLElement,
        triggers,
        closeButtons,
        containers: container,
      });

      // Her menü için event listener'ları ekle
      triggers.forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleModal(menu.id);
        });
      });

      closeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          this.closeModal(menu.id);
        });
      });
    });
  }

  private setupEventListeners(): void {
    if (this.config.outsideClickClose) {
      document.addEventListener("click", (e) => this.handleOutsideClick(e));
    }

    if (this.config.escapeClose) {
      document.addEventListener("keydown", (e) => this.handleEscapeKey(e));
    }
  }

  private handleOutsideClick(e: MouseEvent): void {
    if (!this.activeModalId) return;

    const activeModal = this.menus.get(this.activeModalId);
    if (!activeModal) return;

    const target = e.target as Node;
    const isClickInsideContainer = activeModal.containers.some((container) =>
      container.contains(target),
    );

    if (!isClickInsideContainer) {
      this.closeModal(this.activeModalId);
    }
  }

  private handleEscapeKey(e: KeyboardEvent): void {
    if (e.key === "Escape" && this.activeModalId) {
      this.closeModal(this.activeModalId);
    }
  }

  private toggleModal(menuId: string): void {
    const menu = this.menus.get(menuId);
    if (!menu) return;

    const isOpen =
      menu.content?.getAttribute(this.config.attributes.stateAttribute!) ===
      "open";

    if (isOpen) {
      this.closeModal(menuId);
    } else {
      this.openModal(menuId);
    }
  }

  private openModal(menuId: string): void {
    if (
      this.config.closeOthersOnOpen &&
      this.activeModalId &&
      this.activeModalId !== menuId
    ) {
      this.closeModal(this.activeModalId);
    }

    const menu = this.menus.get(menuId);
    if (!menu) return;

    menu.content?.setAttribute(this.config.attributes.stateAttribute!, "open");
    this.activeModalId = menuId;
    this.config.onToggle(menuId, true);

    if (this.config.scrollLock.enabled) {
      this.applyStyles(document.body, this.config.scrollLock.styles!.hidden);
    }
  }

  private closeModal(menuId: string): void {
    const menu = this.menus.get(menuId);
    if (!menu) return;

    menu.content?.setAttribute(
      this.config.attributes.stateAttribute!,
      "closed",
    );
    if (this.activeModalId === menuId) {
      this.activeModalId = null;
    }
    this.config.onToggle(menuId, false);

    if (this.config.scrollLock.enabled) {
      this.applyStyles(document.body, this.config.scrollLock.styles!.visible);
    }
  }

  private applyStyles(
    element: HTMLElement,
    styles: Partial<CSSStyleDeclaration>,
  ): void {
    Object.assign(element.style, styles);
  }

  // Public API
  public isModalOpen(menuId: string): boolean {
    const menu = this.menus.get(menuId);
    return (
      menu?.content?.getAttribute(this.config.attributes.stateAttribute!) ===
        "open" || false
    );
  }

  public getActiveModalId(): string | null {
    return this.activeModalId;
  }

  public closeAllModals(): void {
    this.menus.forEach((_, menuId) => this.closeModal(menuId));
  }
}

export type { ModalConfig, ModalDefinition };
export { ModalController };
