import { Hono } from "hono";
import { serveStatic } from "hono/serve-static";
import fs from "fs";
import crypto from "crypto";
import { exec } from "child_process";

const app = new Hono();
app.use(
  "/*",
  serveStatic({
    root: "./dist",
    getContent: (path) => {
      try {
        const file = fs.readFileSync(path);
        if (!file) return null;
        return file as any;
      } catch (error) {
        if (path === "dist/index.html" || path === "dist/") {
          return null;
        }
        console.error(`Error reading file at ${path}:`);
        return null;
      }
    },
  }),
);

app.get("/", (c) => {
  const html = Bun.file("./dist/main/index.html");
  return c.html(html.text());
});

const secret = "LHOUwjBFGyori7tltMnRQ2YtanvObPZOenCowk/Cq8c=";
app.post("/github-push-event", async (c) => {
  const githubEvent = c.req.header("X-GitHub-Event");
  const signature = c.req.header("X-Hub-Signature-256");

  if (githubEvent !== "push" || !signature) {
    return c.json({ error: "Invalid event or missing signature" }, 400);
  }

  const payload = await c.req.text();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = `sha256=${hmac.digest("hex")}`;

  if (signature !== expectedSignature) {
    return c.json({ error: "Invalid signature" }, 401);
  }

  // Hemen response gönder
  c.status(200);

  // Sonraki işlemleri background'da çalıştır
  setImmediate(() => {
    runBuildProcess();
  });

  return c.body(null);
});

function runBuildProcess(): void {
  exec(
    "git pull && rm -rf dist && sudo systemctl restart mdb-menuarts.service",
    { cwd: "/root/mdb-code" },
    (error: Error | null, stdout: string, stderr: string) => {
      if (error) {
        console.error(`Exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`Command output: ${stdout}`);
    },
  );
}

const port = 3080;
console.log(`Server is running on port ${port}`);
export default { fetch: app.fetch, port };
