import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/crm", "/parser", "/api/", "/naumenko-demolition/crm", "/naumenko-demolition/parser", "/naumenko-demolition/api/"],
    },
    sitemap: "https://wm669vjvr2-ui.github.io/naumenko-demolition/sitemap.xml",
  };
}
