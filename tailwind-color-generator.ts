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
  '50': '#f0fdf9',
  '100': '#cdfaef',
  '200': '#9bf4df',
  '300': '#60e8cc',
  '400': '#30d1b6',
  '500': '#17b59d',
  '600': '#0f9280',
  '700': '#127d70',
  '800': '#125d55',
  '900': '#144d47',
  '950': '#052e2b',
}

console.log(convertHexToTailwindRgb(colorObject, 'primary', 'light'))
