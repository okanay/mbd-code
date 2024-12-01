document.addEventListener('DOMContentLoaded', () => {
  const dateContainers = document.querySelectorAll(
    '#departure-container, #return-container',
  )

  dateContainers.forEach(container => {
    container.addEventListener('click', () => {
      const input = container.querySelector(
        'input[type="date"]',
      ) as HTMLInputElement | null
      if (input) {
        input.showPicker()
      }
    })
  })
})
