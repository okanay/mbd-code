type HexColorObject = {
  [key: string]: string;
};

type ColorMode = "light" | "dark";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function convertHexToTailwindRgb(
  hexObject: HexColorObject,
  prefix: string = "primary",
  mode: ColorMode = "light",
): string {
  let output = "";

  const sortedKeys = Object.keys(hexObject).sort(
    (a, b) => Number(a) - Number(b),
  );

  sortedKeys.forEach((key, index) => {
    const hexValue = hexObject[key];
    const rgb = hexToRgb(hexValue);
    if (rgb) {
      const colorKey =
        mode === "dark" ? sortedKeys[sortedKeys.length - 1 - index] : key;
      output += `--${prefix}-${colorKey}: ${rgb.r} ${rgb.g} ${rgb.b};\n`;
    }
  });

  return output;
}

// Örnek kullanım
const colorObject: HexColorObject = {
  "50": "#f3faf8",
  "100": "#d6f1e9",
  "200": "#aee1d4",
  "300": "#7dcbba",
  "400": "#52af9d",
  "500": "#3ea391",
  "600": "#2b766a",
  "700": "#265f57",
  "800": "#224d47",
  "900": "#20413d",
  "950": "#0d2623",
};

console.log(convertHexToTailwindRgb(colorObject, "primary", "light"));
