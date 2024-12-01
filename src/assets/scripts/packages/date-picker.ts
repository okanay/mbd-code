export class DatePickerManager {
  private containers: NodeListOf<Element>

  constructor(config: { containerSelector: string; inputSelector?: string }) {
    this.containers = document.querySelectorAll(config.containerSelector)
    this.initialize(config.inputSelector || 'input[type="date"]')
  }

  private initialize(inputSelector: string): void {
    this.containers.forEach(container => {
      container.addEventListener('click', () => {
        const input = container.querySelector(
          inputSelector,
        ) as HTMLInputElement | null
        if (input) {
          input.showPicker()
        }
      })
    })
  }
}
