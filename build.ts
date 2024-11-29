import { build } from 'bun'
import {
  existsSync,
  readdirSync,
  mkdirSync,
  copyFileSync,
  statSync,
  watch as fsWatch,
} from 'fs'
import path from 'path'

const srcDir = './src'
const distDir = './dist'
const assetsDir = path.join(srcDir, 'assets')
const scriptsDir = path.join(assetsDir, 'scripts')
const packagesDir = path.join(scriptsDir, 'packages')

// Ana sayfa script listesi
const scripts = ['layout', 'main', 'product', 'login', 'register']
const directories = ['main', 'product', 'login', 'register']

// Dosya işlem takibi için cache
const fileCache = new Map<string, number>()

function isFileChanged(filePath: string): boolean {
  if (!existsSync(filePath)) return false

  const currentMtime = statSync(filePath).mtimeMs
  const previousMtime = fileCache.get(filePath)

  if (previousMtime !== currentMtime) {
    fileCache.set(filePath, currentMtime)
    return true
  }

  return false
}

function copyFileIfChanged(src: string, dest: string): boolean {
  if (!existsSync(src)) return false

  if (isFileChanged(src)) {
    if (!existsSync(path.dirname(dest))) {
      mkdirSync(path.dirname(dest), { recursive: true })
    }
    copyFileSync(src, dest)
    return true
  }
  return false
}

function copyFileRecursive(src: string, dest: string, onlyCopyChanged = true) {
  if (statSync(src).isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true })
    }
    readdirSync(src).forEach(childItemName => {
      const srcChildPath = path.join(src, childItemName)
      const destChildPath = path.join(dest, childItemName)
      copyFileRecursive(srcChildPath, destChildPath, onlyCopyChanged)
    })
  } else {
    if (!onlyCopyChanged || isFileChanged(src)) {
      copyFileSync(src, dest)
      console.log(`Dosya kopyalandı: ${dest}`)
    }
  }
}

function copyAssets(specificFile?: string) {
  const distAssetsDir = path.join(distDir, 'assets')
  if (existsSync(assetsDir)) {
    if (!existsSync(distAssetsDir)) {
      mkdirSync(distAssetsDir, { recursive: true })
    }

    if (specificFile) {
      const srcPath = path.join(assetsDir, specificFile)
      const destPath = path.join(distAssetsDir, specificFile)
      if (copyFileIfChanged(srcPath, destPath)) {
        console.log(`Asset güncellendi: ${specificFile}`)
      }
    } else {
      copyFileRecursive(assetsDir, distAssetsDir)
    }
  }
}

function copyHTML(specificFile?: string) {
  directories.forEach(dir => {
    const srcDirPath = path.join(srcDir, dir)
    if (!existsSync(srcDirPath)) return

    const destDirPath = path.join(distDir, dir)
    if (!existsSync(destDirPath)) {
      mkdirSync(destDirPath, { recursive: true })
    }

    if (specificFile) {
      const srcPath = path.join(srcDirPath, specificFile)
      const destPath = path.join(destDirPath, specificFile)
      if (copyFileIfChanged(srcPath, destPath)) {
        console.log(`HTML güncellendi: ${specificFile}`)
      }
    } else {
      readdirSync(srcDirPath)
        .filter(file => file.endsWith('.html'))
        .forEach(file => {
          const srcPath = path.join(srcDirPath, file)
          const destPath = path.join(destDirPath, file)
          if (copyFileIfChanged(srcPath, destPath)) {
            console.log(`HTML güncellendi: ${file}`)
          }
        })
    }
  })
}

function copyStyles(specificFile?: string) {
  const stylesDir = path.join(assetsDir, 'styles')
  const distStylesDir = path.join(distDir, 'assets', 'styles')

  if (!existsSync(stylesDir)) return

  if (!existsSync(distStylesDir)) {
    mkdirSync(distStylesDir, { recursive: true })
  }

  if (specificFile) {
    const srcPath = path.join(stylesDir, specificFile)
    const destPath = path.join(distStylesDir, specificFile)
    if (copyFileIfChanged(srcPath, destPath)) {
      console.log(`CSS güncellendi: ${specificFile}`)
    }
  } else {
    readdirSync(stylesDir)
      .filter(file => file.endsWith('.css'))
      .forEach(file => {
        const srcPath = path.join(stylesDir, file)
        const destPath = path.join(distStylesDir, file)
        if (copyFileIfChanged(srcPath, destPath)) {
          console.log(`CSS güncellendi: ${file}`)
        }
      })
  }
}

async function buildPageSpecificTS(script: string) {
  const entrypoint = path.join(scriptsDir, `${script}.ts`)

  if (!isFileChanged(entrypoint)) {
    return // Dosya değişmediyse build alma
  }

  const isMinify = false
  const outdir = path.join(distDir, 'assets', 'scripts')
  const filename = isMinify ? `${script}.min.js` : `${script}.js`

  if (!existsSync(outdir)) {
    mkdirSync(outdir, { recursive: true })
  }

  await build({
    entrypoints: [entrypoint],
    outdir,
    minify: isMinify,
    naming: filename,
    format: 'esm',
    external: ['./packages/*', '../constants/*'],
  })

  console.log(`${filename} güncellendi`)
}

async function buildSharedPackages(specificFile?: string) {
  if (!existsSync(packagesDir)) return

  const outdir = path.join(distDir, 'assets', 'scripts', 'packages')
  if (!existsSync(outdir)) {
    mkdirSync(outdir, { recursive: true })
  }

  if (specificFile) {
    const entrypoint = path.join(packagesDir, specificFile)
    if (isFileChanged(entrypoint)) {
      const basename = path.basename(specificFile, '.ts')
      await build({
        entrypoints: [entrypoint],
        outdir,
        minify: true,
        naming: `${basename}.js`,
      })
      console.log(`Package güncellendi: ${basename}.js`)
    }
  } else {
    const packages = readdirSync(packagesDir).filter(file =>
      file.endsWith('.ts'),
    )
    for (const packageFile of packages) {
      const entrypoint = path.join(packagesDir, packageFile)
      if (isFileChanged(entrypoint)) {
        const basename = path.basename(packageFile, '.ts')
        await build({
          entrypoints: [entrypoint],
          outdir,
          minify: true,
          naming: `${basename}.js`,
        })
        console.log(`Package güncellendi: ${basename}.js`)
      }
    }
  }
}

async function buildAll() {
  // İlk build'de tüm dosyaları işle
  fileCache.clear() // Cache'i temizle ki her şey yeniden build alsın
  for (const script of scripts) {
    await buildPageSpecificTS(script)
  }
  await buildSharedPackages()
  copyHTML()
  copyStyles()
  copyAssets()
}

function watchFiles() {
  console.log('Watch modu başlatıldı...')

  fsWatch(srcDir, { recursive: true }, async (event, filename) => {
    if (!filename) return

    const relativePath = filename.replace(/\\/g, '/')
    console.log(`Değişiklik algılandı: ${relativePath}`)

    if (relativePath.endsWith('.ts')) {
      if (relativePath.includes('packages/')) {
        const packageFile = path.basename(relativePath)
        await buildSharedPackages(packageFile)
      } else {
        const script = scripts.find(s => relativePath.includes(`${s}.ts`))
        if (script) await buildPageSpecificTS(script)
      }
    } else if (relativePath.endsWith('.html')) {
      copyHTML(path.basename(relativePath))
    } else if (relativePath.endsWith('.css')) {
      copyStyles(path.basename(relativePath))
    } else if (relativePath.startsWith('assets/')) {
      copyAssets(relativePath.replace('assets/', ''))
    }
  })
}

async function main() {
  if (process.argv.includes('--watch')) {
    await buildAll()
    watchFiles()
  } else {
    await buildAll()
  }
}

main()
