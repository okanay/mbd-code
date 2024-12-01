import { Hono } from 'hono'
import { serveStatic } from 'hono/serve-static'
import fs from 'fs'
import crypto from 'crypto'
import { exec } from 'child_process'

const app = new Hono()

app.use(
  '/*',
  serveStatic({
    root: './dist/',
    getContent: path => {
      // Debug için path bilgisini yazdıralım
      console.log('Requested path:', path)
      try {
        // Dosyanın var olup olmadığını kontrol edelim
        const exists = fs.existsSync(path)
        console.log('File exists:', exists)

        if (exists) {
          // Dosya izinlerini kontrol edelim
          const stats = fs.statSync(path)
          console.log('File permissions:', stats.mode)
        }

        const file = fs.readFileSync(path)
        if (!file) {
          console.log('File is empty or null')
          return null
        }
        console.log('File successfully read')
        return file as any
      } catch (error) {
        if (path === 'dist/main/index.html' || path === 'dist/') {
          return null
        }
        console.error(`Error reading file at ${path}:`, error)
        return null
      }
    },
    onFound: (path, c) => {
      console.log('onFound path:', path)
      if (path.endsWith('.js') || path.endsWith('.css')) {
        c.header(
          'Cache-Control',
          'no-store, no-cache, must-revalidate, max-age=0',
        )
      }
    },
  }),
)

app.use('*', async (c, next) => {
  c.header('Cache-Control', 'no-store, no-cache')
  await next()
})

app.get('/', c => {
  const html = Bun.file('./dist/main/index.html')
  return c.html(html.text())
})

app.get('/product', c => {
  const html = Bun.file('./dist/product/index.html')
  return c.html(html.text())
})

app.get('/login', c => {
  const html = Bun.file('./dist/login/index.html')
  return c.html(html.text())
})

app.get('/register', c => {
  const html = Bun.file('./dist/register/index.html')
  return c.html(html.text())
})

app.get('/profile', c => {
  const html = Bun.file('./dist/profile/index.html')
  return c.html(html.text())
})

const secret = 'LHOUwjBFGyori7tltMnRQ2YtanvObPZOenCowk/Cq8c='

app.post('/github-push-event', async c => {
  const githubEvent = c.req.header('X-GitHub-Event')
  const signature = c.req.header('X-Hub-Signature-256')

  if (githubEvent !== 'push' || !signature) {
    return c.json({ error: 'Invalid event or missing signature' }, 400)
  }

  const payload = await c.req.text()
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = `sha256=${hmac.digest('hex')}`

  if (signature !== expectedSignature) {
    return c.json({ error: 'Invalid signature' }, 401)
  }

  c.status(200)
  setImmediate(() => {
    runBuildProcess()
  })
  return c.body(null)
})

function runBuildProcess(): void {
  exec(
    'git pull && bun run build && sudo systemctl restart mdb-menuarts.service',
    { cwd: '/root/mdb-code' },
    (error: Error | null, stdout: string, stderr: string) => {
      if (error) {
        console.error(`Exec error: ${error}`)
        console.error(`stderr: ${stderr}`)
        return
      }
      console.log(`Command output: ${stdout}`)
    },
  )
}

const port = 3080
console.log(`Server is running on port ${port}`)

export default { fetch: app.fetch, port }
