type HexColorObject = {
  [key: string]: string
}

type ColorMode = 'light' | 'dark'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function convertHexToTailwindRgb(
  hexObject: HexColorObject,
  prefix: string = 'primary',
  mode: ColorMode = 'light',
): string {
  let output = ''

  const sortedKeys = Object.keys(hexObject).sort(
    (a, b) => Number(a) - Number(b),
  )

  sortedKeys.forEach((key, index) => {
    const hexValue = hexObject[key]
    const rgb = hexToRgb(hexValue)
    if (rgb) {
      const colorKey =
        mode === 'dark' ? sortedKeys[sortedKeys.length - 1 - index] : key
      output += `--${prefix}-${colorKey}: ${rgb.r} ${rgb.g} ${rgb.b};\n`
    }
  })

  return output
}

// Örnek kullanım
const colorObject: HexColorObject = {
  '50': '#fef2f2',
  '100': '#fee2e2',
  '200': '#ffc9c9',
  '300': '#fda4a4',
  '400': '#fa6f6f',
  '500': '#f14242',
  '600': '#de2121',
  '700': '#bb1a1a',
  '800': '#9b1919',
  '900': '#801c1c',
  '950': '#460909',
}

console.log(convertHexToTailwindRgb(colorObject, 'primary', 'light'))
