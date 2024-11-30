interface PasswordElements {
  passwordInput: HTMLInputElement
  passwordConfirmInput: HTMLInputElement
  passwordContainer: HTMLDivElement
  passwordConfirmContainer: HTMLDivElement
}

function setupPasswordVisibility() {
  const elements: PasswordElements = {
    passwordInput: document.getElementById('password') as HTMLInputElement,
    passwordConfirmInput: document.getElementById(
      'password-confirm',
    ) as HTMLInputElement,
    passwordContainer: document
      .getElementById('password')
      ?.closest('.group') as HTMLDivElement,
    passwordConfirmContainer: document
      .getElementById('password-confirm')
      ?.closest('.group') as HTMLDivElement,
  }

  // Elementlerden herhangi biri bulunamadıysa çık
  if (!Object.values(elements).every(element => element)) {
    console.error('Required password elements not found')
    return
  }

  // Şifre göster/gizle olaylarını ekle
  elements.passwordContainer
    .querySelector('button')
    ?.addEventListener('click', e => {
      e.stopPropagation() // Event'in document click'e ulaşmasını engelle
      togglePasswordVisibility(
        elements.passwordInput,
        elements.passwordContainer,
      )
    })

  elements.passwordConfirmContainer
    .querySelector('button')
    ?.addEventListener('click', e => {
      e.stopPropagation() // Event'in document click'e ulaşmasını engelle
      togglePasswordVisibility(
        elements.passwordConfirmInput,
        elements.passwordConfirmContainer,
      )
    })

  // Input'lara tıklandığında event'in document'a ulaşmasını engelle
  elements.passwordInput.addEventListener('click', e => e.stopPropagation())
  elements.passwordConfirmInput.addEventListener('click', e =>
    e.stopPropagation(),
  )

  // Sayfa herhangi bir yerine tıklandığında şifreleri gizle
  document.addEventListener('click', () => {
    if (elements.passwordContainer.dataset.visible === 'true') {
      hidePassword(elements.passwordInput, elements.passwordContainer)
    }
    if (elements.passwordConfirmContainer.dataset.visible === 'true') {
      hidePassword(
        elements.passwordConfirmInput,
        elements.passwordConfirmContainer,
      )
    }
  })
}

function togglePasswordVisibility(
  input: HTMLInputElement,
  container: HTMLDivElement,
) {
  const isVisible = container.dataset.visible === 'true'
  input.type = isVisible ? 'password' : 'text'
  container.dataset.visible = isVisible ? 'false' : 'true'
}

function hidePassword(input: HTMLInputElement, container: HTMLDivElement) {
  input.type = 'password'
  container.dataset.visible = 'false'
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
  setupPasswordVisibility()
})
