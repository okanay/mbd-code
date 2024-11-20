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
const packagesDir = path.join(srcDir, "app", "packages");

// Sayfa listesini burada tanımla
const scripts = ["main", "product", "navigation", "carousel"]; // Sayfa listesini genişletebilirsiniz

// Eski versiyondaki izleme fonksiyonunu geri ekledim
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
  const assetsDir = path.join(srcDir, "public");
  const distAssetsDir = path.join(distDir, "public");
  if (existsSync(assetsDir)) {
    if (!existsSync(distAssetsDir)) {
      mkdirSync(distAssetsDir, { recursive: true });
    }
    copyFileRecursive(assetsDir, distAssetsDir);
    console.log("Assets kopyalandı.");
  }
}

function copyHTML() {
  const distDir = "./dist";
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }
  const copyHtmlRecursive = (dir: string) => {
    const items = readdirSync(dir, { withFileTypes: true });
    items.forEach((item) => {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        copyHtmlRecursive(fullPath);
      } else if (item.isFile() && item.name.endsWith(".html")) {
        const relativePath = path.relative(srcDir, fullPath);
        const destPath = path.join(distDir, relativePath);
        const destDir = path.dirname(destPath);
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        copyFileSync(fullPath, destPath);
        console.log(`HTML dosyası kopyalandı: ${destPath}`);
      }
    });
  };
  copyHtmlRecursive(srcDir);
}

async function buildPageSpecificTS(script: string) {
  const isMinify: boolean = false;

  const entrypoint = path.join(srcDir, "app", `${script}.ts`);
  const filename = isMinify ? `${script}.min.js` : `${script}.js`;

  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  await build({
    entrypoints: [entrypoint],
    outdir: distDir,
    minify: isMinify,
    naming: filename,
    format: "esm", // veya 'cjs'
    external: ["./packages/*"], // Shared paketleri external olarak işaretle
  });

  console.log(
    isMinify
      ? `Minify edilmiş dosya: dist/${filename} oluşturuldu`
      : `Normal dosya: dist/${filename} oluşturuldu`,
  );
}

async function buildSharedPackages() {
  if (!existsSync(packagesDir)) return;

  const packages = readdirSync(packagesDir).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js"),
  );

  if (!existsSync(path.join(distDir, "packages"))) {
    mkdirSync(path.join(distDir, "packages"), { recursive: true });
  }

  for (const packageFile of packages) {
    const entrypoint = path.join(packagesDir, packageFile);
    const basename = path.basename(packageFile, path.extname(packageFile));

    await build({
      entrypoints: [entrypoint],
      outdir: path.join(distDir, "packages"),
      minify: true,
      naming: `${basename}.js`,
    });

    console.log(`Shared paket minify edildi: dist/packages/${basename}.js`);
  }
}

async function buildAll() {
  // Sayfaya özgü derlemeler
  for (const script of scripts) {
    await buildPageSpecificTS(script);
    // await buildPageSpecificTS(script, true);
  }

  // Shared paketleri derle
  await buildSharedPackages();

  copyHTML();
  copyAssets();
}

function watchFiles() {
  const srcWatchPaths = [
    path.resolve(srcDir), // Tüm src dizinini izle
  ];

  srcWatchPaths.forEach((watchPath) => {
    fsWatch(watchPath, { recursive: true }, async (event, filename) => {
      if (!filename) return;
      console.log(`Değişiklik tespit edildi: ${filename}`);

      if (filename.endsWith(".ts")) {
        // Hangi dosyada değişiklik olduğuna göre ilgili derlemeyi yap
        const script = scripts.find((p) => filename.includes(`${p}.ts`));
        if (script) {
          await buildPageSpecificTS(script);
        }

        if (filename.includes("packages/")) {
          await buildSharedPackages();
        }
      }

      if (filename.endsWith(".html")) {
        copyHTML();
      }

      if (filename.includes("assets")) {
        copyAssets();
      }
    });
  });
}

async function main() {
  if (process.argv.includes("--watch")) {
    console.log("Watch modunda çalışıyor...");
    await buildAll(); // İlk başta her şeyi derle
    watchFiles(); // Değişiklikleri izlemeye başla
  } else {
    await buildAll(); // Normal build işlemi
  }
}

main();
