import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const baseUrl = "https://www.superchain-token-explorer.xyz";

function discoverAppRoutes(): string[] {
  const appDir = path.join(process.cwd(), "app");
  const routes: string[] = ["/"]; // always include root

  const exclude = new Set(["api", "components", "providers", "styles", "_not-found"]);

  const walk = (dir: string, rel = "") => {
    let entries: string[] = [];
    try {
      entries = fs.readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (exclude.has(entry)) continue;
      const full = path.join(dir, entry);
      const relPath = path.join(rel, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        const pageTsx = path.join(full, "page.tsx");
        const pageJsx = path.join(full, "page.jsx");
        if (fs.existsSync(pageTsx) || fs.existsSync(pageJsx)) {
          const route = "/" + relPath.replace(/\\+/g, "/");
          if (route !== "/") routes.push(route);
        }
        walk(full, relPath);
      }
    }
  };

  walk(appDir);

  // De-duplicate and sort for stability
  return Array.from(new Set(routes)).sort();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const discovered = discoverAppRoutes();
  return discovered.map((p) => ({
    url: `${baseUrl}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : 0.6,
  }));
}
