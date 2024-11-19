import { Hono } from "hono";
import { serveStatic } from "hono/serve-static";
import fs from "fs";

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

const port = 3000;
console.log(`Server is running on port ${port}`);
export default { fetch: app.fetch, port };
