import { phoneCodes } from '../../constants/phone-code.js'

function setupCountrySelect() {
  const select = document.getElementById('country-code')
  const flag = document.getElementById('country-flag')
  const prefix = document.getElementById('country-prefix')

  if (!select || !flag || !prefix) return

  // Populate options
  select.innerHTML = phoneCodes
    .map(
      country => `
    <option value="${country.code}">
      ${country.name} (${country.dial_code})
    </option>
  `,
    )
    .join('')

  // Update flag and prefix on change
  select.addEventListener('change', e => {
    const selectedCountry = phoneCodes.find(
      country => country.code === (e.target as HTMLSelectElement).value,
    )

    if (selectedCountry) {
      ;(flag as HTMLImageElement).src =
        `https://flagcdn.com/${selectedCountry.code.toLowerCase()}.svg`
      prefix.textContent = `${selectedCountry.dial_code}`
    }
  })
}

document.addEventListener('DOMContentLoaded', setupCountrySelect)
