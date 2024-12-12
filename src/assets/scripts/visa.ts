document.addEventListener('DOMContentLoaded', () => {
  const personContainer = document.getElementById('persons')
  if (personContainer) {
    personContainer.addEventListener('change', e => {
      const target = e.target as HTMLInputElement

      // Sadece file input'ları için işlem yap
      if (target.type === 'file') {
        // Input'un parent elementinin içindeki preview div'ini bul
        const inputContainer = target.closest('.image-input')
        const preview = inputContainer?.querySelector('div')

        const file = target.files?.[0]
        if (file && preview) {
          const reader = new FileReader()
          reader.onload = e => {
            if (e.target) {
              preview.innerHTML = `<img src="${e.target.result}" class="h-full w-full object-cover rounded" />`
            }
          }
          reader.readAsDataURL(file)
        }
      }
    })
  }
})
