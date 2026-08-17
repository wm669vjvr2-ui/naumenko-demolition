import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const origin = "https://wm669vjvr2-ui.github.io/naumenko-demolition";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/legal", "/privacy", "/consent", "/terms", "/cookies"].map((path) => ({
    url: `${origin}${path}`,
    lastModified: new Date("2026-08-17"),
    changeFrequency: path ? "yearly" : "monthly",
    priority: path ? 0.4 : 1,
  }));
}
