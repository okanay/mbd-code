import { countries } from '../constants/phone-code.js'

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

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', setupCountrySelect)
