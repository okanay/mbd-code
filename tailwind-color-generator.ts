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
  "50": "#f0fdfb",
  "100": "#cbfcf7",
  "200": "#96f9f1",
  "300": "#5aeee7",
  "400": "#38dcd9",
  "500": "#0fbdbd",
  "600": "#099698",
  "700": "#0c7579",
  "800": "#0f5c60",
  "900": "#114d50",
  "950": "#032c30",
};

console.log(convertHexToTailwindRgb(colorObject, "primary", "light"));
