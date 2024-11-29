import { countries } from '../../constants/phone-code.js'

interface Country {
  code: string
  name: string
  phone: string
}

function setupCountrySelect() {
  const elements = {
    select: document.getElementById('country-code') as HTMLSelectElement,
    prefix: document.getElementById('country-prefix') as HTMLElement,
    flag: document.getElementById('country-flag') as HTMLImageElement,
  }

  // Elementlerden herhangi biri bulunamadıysa çık
  if (!elements.select || !elements.prefix || !elements.flag) {
    console.error('Required elements not found')
    return
  }

  // Ülke seçeneklerini oluştur
  populateCountryOptions(elements.select)

  // Değişiklik olayını dinle
  elements.select.addEventListener('change', event => {
    updateCountryDisplay(event, elements)
  })
}

function populateCountryOptions(select: HTMLSelectElement) {
  countries.forEach((country: Country) => {
    const option = document.createElement('option')
    option.value = `${country.code.toLowerCase()}|${country.phone}`
    option.textContent = `${country.name} (+${country.phone})`
    select.appendChild(option)
  })
}

function updateCountryDisplay(
  event: Event,
  elements: {
    flag: HTMLImageElement
    prefix: HTMLElement
  },
) {
  const target = event.target as HTMLSelectElement
  const [countryCode, prefix] = target.value.split('|')

  // Bayrak ve telefon kodunu güncelle
  elements.flag.src = `https://flagcdn.com/${countryCode}.svg`
  elements.flag.alt = `${countryCode} flag`
  elements.prefix.textContent = `+${prefix}`
}

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

function setupCustomCheckbox() {
  const checkboxContainers =
    document.querySelectorAll<HTMLLabelElement>('label[data-check]')

  checkboxContainers.forEach(container => {
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    )

    if (!input) return

    input.addEventListener('change', () => {
      container.dataset.check = input.checked ? 'true' : 'false'
    })
  })
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
  setupCountrySelect()
  setupPasswordVisibility()
  setupCountrySelect()
  setupCustomCheckbox()
})
