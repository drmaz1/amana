import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep authenticated/transactional areas out of the index.
      disallow: ["/admin", "/driver", "/booking/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
