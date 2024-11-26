interface ModalConfig {
  scrollLock?: {
    enabled: boolean
    styles?: {
      hidden: Partial<CSSStyleDeclaration>
      visible: Partial<CSSStyleDeclaration>
    }
  }
  outsideClickClose?: boolean
  escapeClose?: boolean
  preserveModalHistory?: boolean
  initialActiveModal?: string | null
  onToggle?: (
    menuId: string,
    isOpen: boolean,
    trigger: HTMLElement | null,
  ) => void
  attributes?: {
    stateAttribute?: string
    values: {
      open: string
      hidden: string
      preserved: string
    }
  }
}

interface ModalDefinition {
  id: string
  toggleElements: string[]
  openElements?: string[]
  contentElement: string
  containers: string[]
  closeElements?: string[]
}

class ModalController {
  private menus: Map<
    string,
    {
      content: HTMLElement | null
      triggers: HTMLElement[]
      closeButtons: HTMLElement[]
      openButtons: HTMLElement[]
      containers: HTMLElement[]
    }
  > = new Map()

  private activeModalId: string | null = null
  private modalHistory: string[] = []
  private config: Required<ModalConfig>
  private initialized: boolean = false

  constructor(menuDefinitions: ModalDefinition[], config: ModalConfig = {}) {
    this.config = {
      scrollLock: {
        enabled: config.scrollLock?.enabled ?? true,
        styles: {
          hidden: {
            overflow: 'hidden',
            position: 'fixed',
            width: '100%',
            ...config.scrollLock?.styles?.hidden,
          },
          visible: {
            overflow: 'auto',
            position: 'static',
            width: 'auto',
            ...config.scrollLock?.styles?.visible,
          },
        },
      },
      outsideClickClose: config.outsideClickClose ?? true,
      escapeClose: config.escapeClose ?? true,
      preserveModalHistory: config.preserveModalHistory ?? false,
      initialActiveModal: config.initialActiveModal ?? null,
      onToggle: config.onToggle || (() => {}),
      attributes: {
        stateAttribute: config.attributes?.stateAttribute ?? 'data-state',
        values: {
          open: config.attributes?.values?.open ?? 'open',
          hidden: config.attributes?.values?.hidden ?? 'closed',
          preserved: config.attributes?.values?.preserved ?? 'open',
        },
      },
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeModals(menuDefinitions)
        this.setupEventListeners()
        this.handleInitialState()
      })
    } else {
      this.initializeModals(menuDefinitions)
      this.setupEventListeners()
      this.handleInitialState()
    }
  }

  private handleInitialState(): void {
    if (!this.initialized && this.config.initialActiveModal) {
      const initialModal = this.menus.get(this.config.initialActiveModal)
      if (initialModal) {
        this.openModal(this.config.initialActiveModal, null)

        const modalButtons = [
          ...initialModal.triggers,
          ...initialModal.openButtons,
        ]

        modalButtons.forEach(button => {
          button.setAttribute(
            this.config.attributes.stateAttribute!,
            this.config.attributes.values.open,
          )
        })
      }
    }
    this.initialized = true
  }

  private initializeModals(menuDefinitions: ModalDefinition[]): void {
    menuDefinitions.forEach(menu => {
      const content = document.querySelector(menu.contentElement)
      if (!content) {
        console.warn(`Modal content element not found: ${menu.contentElement}`)
        return
      }

      const triggers = menu.toggleElements
        .flatMap(selector => Array.from(document.querySelectorAll(selector)))
        .filter((el): el is HTMLElement => el instanceof HTMLElement)

      const closeButtons = (menu.closeElements || [])
        .flatMap(selector => Array.from(document.querySelectorAll(selector)))
        .filter((el): el is HTMLElement => el instanceof HTMLElement)

      const openButtons = (menu.openElements || [])
        .flatMap(selector => Array.from(document.querySelectorAll(selector)))
        .filter((el): el is HTMLElement => el instanceof HTMLElement)

      const containers = (menu.containers || [])
        .flatMap(selector => Array.from(document.querySelectorAll(selector)))
        .filter((el): el is HTMLElement => el instanceof HTMLElement)

      this.menus.set(menu.id, {
        content: content as HTMLElement,
        triggers,
        closeButtons,
        openButtons,
        containers,
      })

      content.setAttribute(
        this.config.attributes.stateAttribute!,
        this.config.attributes.values.hidden,
      )

      triggers.forEach(trigger => {
        trigger.addEventListener('click', e => {
          e.stopPropagation()
          this.toggleModal(menu.id, trigger)
        })
      })

      closeButtons.forEach(button => {
        button.addEventListener('click', e => {
          e.stopPropagation()
          this.closeModal(menu.id)
        })
      })

      openButtons.forEach(button => {
        button.addEventListener('click', e => {
          e.stopPropagation()
          this.openModal(menu.id, button)
        })
      })
    })
  }

  private setupEventListeners(): void {
    if (this.config.outsideClickClose) {
      document.addEventListener('click', e => this.handleOutsideClick(e))
    }

    if (this.config.escapeClose) {
      document.addEventListener('keydown', e => this.handleEscapeKey(e))
    }
  }

  private handleOutsideClick(e: MouseEvent): void {
    if (!this.activeModalId) return

    const activeModal = this.menus.get(this.activeModalId)
    if (!activeModal) return

    const target = e.target as Node
    const isClickInsideContainer = activeModal.containers.some(container =>
      container.contains(target),
    )

    if (!isClickInsideContainer) {
      this.closeModal(this.activeModalId)
    }
  }

  private handleEscapeKey(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.activeModalId) {
      this.closeModal(this.activeModalId)
    }
  }

  private toggleModal(menuId: string, trigger: HTMLElement): void {
    const menu = this.menus.get(menuId)
    if (!menu) return

    const isOpen =
      menu.content?.getAttribute(this.config.attributes.stateAttribute!) ===
      this.config.attributes.values.open

    if (isOpen) {
      this.closeModal(menuId)
    } else {
      this.openModal(menuId, trigger)
    }
  }

  private openModal(menuId: string, trigger: HTMLElement | null): void {
    const menu = this.menus.get(menuId)
    if (!menu) return

    if (this.config.preserveModalHistory) {
      if (this.activeModalId && this.activeModalId !== menuId) {
        this.modalHistory.push(this.activeModalId)
        const activeMenu = this.menus.get(this.activeModalId)
        activeMenu?.content?.setAttribute(
          this.config?.attributes?.stateAttribute!,
          this.config.attributes.values.preserved,
        )
      }
    } else if (this.activeModalId && this.activeModalId !== menuId) {
      this.closeModal(this.activeModalId)
    }

    menu.content?.setAttribute(
      this.config.attributes.stateAttribute!,
      this.config.attributes.values.open,
    )

    this.activeModalId = menuId
    this.config.onToggle(menuId, true, trigger)

    if (this.config.scrollLock.enabled) {
      this.applyStyles(document.body, this.config.scrollLock.styles!.hidden)
    }
  }

  private closeModal(menuId: string): void {
    const menu = this.menus.get(menuId)
    if (!menu) return

    menu.content?.setAttribute(
      this.config.attributes.stateAttribute!,
      this.config.attributes.values.hidden,
    )

    if (this.activeModalId === menuId) {
      if (this.config.preserveModalHistory && this.modalHistory.length > 0) {
        const previousModalId = this.modalHistory.pop()!
        const previousMenu = this.menus.get(previousModalId)
        if (previousMenu) {
          previousMenu.content?.setAttribute(
            this.config.attributes.stateAttribute!,
            this.config.attributes.values.open,
          )
          this.activeModalId = previousModalId
          this.config.onToggle(previousModalId, true, null)
          return
        }
      }

      this.activeModalId = null
      if (this.config.scrollLock.enabled) {
        this.applyStyles(document.body, this.config.scrollLock.styles!.visible)
      }
    }

    this.config.onToggle(menuId, false, null)
  }

  private applyStyles(
    element: HTMLElement,
    styles: Partial<CSSStyleDeclaration>,
  ): void {
    Object.assign(element.style, styles)
  }

  // Public API
  public isModalOpen(menuId: string): boolean {
    const menu = this.menus.get(menuId)
    return (
      menu?.content?.getAttribute(this.config.attributes.stateAttribute!) ===
        this.config.attributes.values.open || false
    )
  }

  public getActiveModalId(): string | null {
    return this.activeModalId
  }

  public getModalHistory(): string[] {
    return [...this.modalHistory]
  }

  public closeAllModals(): void {
    this.modalHistory = []
    this.menus.forEach((_, menuId) => this.closeModal(menuId))
  }

  public setActiveModal(menuId: string): void {
    if (this.menus.has(menuId)) {
      this.openModal(menuId, null)
    }
  }

  public getInitializedStatus(): boolean {
    return this.initialized
  }
}

export type { ModalConfig, ModalDefinition }
export { ModalController }
