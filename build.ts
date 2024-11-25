import { build } from "bun";
import {
  existsSync,
  readdirSync,
  mkdirSync,
  copyFileSync,
  statSync,
  watch as fsWatch,
} from "fs";
import path from "path";

const srcDir = "./src";
const distDir = "./dist";
const assetsDir = path.join(srcDir, "assets");
const scriptsDir = path.join(assetsDir, "scripts");
const packagesDir = path.join(scriptsDir, "packages");

// Ana sayfa script listesi
const scripts = ["layout", "main", "product", "product-form"];

function copyFileRecursive(src: string, dest: string) {
  if (statSync(src).isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    readdirSync(src).forEach((childItemName) => {
      const srcChildPath = path.join(src, childItemName);
      const destChildPath = path.join(dest, childItemName);
      copyFileRecursive(srcChildPath, destChildPath);
    });
  } else {
    copyFileSync(src, dest);
  }
}

function copyAssets() {
  const distAssetsDir = path.join(distDir, "assets");
  if (existsSync(assetsDir)) {
    if (!existsSync(distAssetsDir)) {
      mkdirSync(distAssetsDir, { recursive: true });
    }
    copyFileRecursive(assetsDir, distAssetsDir);
    console.log("Assets kopyalandı.");
  }
}

function copyHTML() {
  const mainDir = path.join(srcDir, "main");
  const productDir = path.join(srcDir, "product");

  [mainDir, productDir].forEach((dir) => {
    if (existsSync(dir)) {
      const relativePath = path.relative(srcDir, dir);
      const destDir = path.join(distDir, relativePath);

      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }

      readdirSync(dir).forEach((file) => {
        if (file.endsWith(".html")) {
          copyFileSync(path.join(dir, file), path.join(destDir, file));
          console.log(`HTML dosyası kopyalandı: ${path.join(destDir, file)}`);
        }
      });
    }
  });
}

function copyStyles() {
  const stylesDir = path.join(assetsDir, "styles");
  const distStylesDir = path.join(distDir, "assets", "styles");

  if (existsSync(stylesDir)) {
    if (!existsSync(distStylesDir)) {
      mkdirSync(distStylesDir, { recursive: true });
    }
    readdirSync(stylesDir).forEach((file) => {
      if (file.endsWith(".css")) {
        copyFileSync(
          path.join(stylesDir, file),
          path.join(distStylesDir, file),
        );
        console.log(
          `CSS dosyası kopyalandı: ${path.join(distStylesDir, file)}`,
        );
      }
    });
  }
}

async function buildPageSpecificTS(script: string) {
  const isMinify: boolean = false;
  const entrypoint = path.join(scriptsDir, `${script}.ts`);
  const outdir = path.join(distDir, "assets", "scripts");
  const filename = isMinify ? `${script}.min.js` : `${script}.js`;

  if (!existsSync(outdir)) {
    mkdirSync(outdir, { recursive: true });
  }

  await build({
    entrypoints: [entrypoint],
    outdir,
    minify: isMinify,
    naming: filename,
    format: "esm",
    external: ["./packages/*"],
  });

  console.log(`${filename} oluşturuldu`);
}

async function buildSharedPackages() {
  if (!existsSync(packagesDir)) return;

  const packages = readdirSync(packagesDir).filter((file) =>
    file.endsWith(".ts"),
  );

  const outdir = path.join(distDir, "assets", "scripts", "packages");
  if (!existsSync(outdir)) {
    mkdirSync(outdir, { recursive: true });
  }

  for (const packageFile of packages) {
    const entrypoint = path.join(packagesDir, packageFile);
    const basename = path.basename(packageFile, ".ts");

    await build({
      entrypoints: [entrypoint],
      outdir,
      minify: true,
      naming: `${basename}.js`,
    });

    console.log(`Package derlendi: ${basename}.js`);
  }
}

async function buildAll() {
  for (const script of scripts) {
    await buildPageSpecificTS(script);
  }
  await buildSharedPackages();
  copyHTML();
  copyStyles();
  copyAssets();
}

function watchFiles() {
  const watchPaths = [srcDir];

  watchPaths.forEach((watchPath) => {
    fsWatch(watchPath, { recursive: true }, async (event, filename) => {
      if (!filename) return;
      console.log(`Değişiklik: ${filename}`);

      if (filename.endsWith(".ts")) {
        if (filename.includes("packages/")) {
          await buildSharedPackages();
        } else {
          const script = scripts.find((s) => filename.includes(`${s}.ts`));
          if (script) await buildPageSpecificTS(script);
        }
      }

      if (filename.endsWith(".html")) {
        copyHTML();
      }

      if (filename.endsWith(".css")) {
        copyStyles();
      }

      if (filename.startsWith("assets/")) {
        copyAssets();
      }
    });
  });
}

async function main() {
  if (process.argv.includes("--watch")) {
    console.log("Watch modu başlatıldı...");
    await buildAll();
    watchFiles();
  } else {
    await buildAll();
  }
}

main();
