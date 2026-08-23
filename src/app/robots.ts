import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/ggss-nishtar-road/admin",
          "/ggss-nishtar-road/admin/",
          "/ggss-nishtar-road/staff-portal",
          "/ggss-nishtar-road/staff-portal/",
          "/ggss-nishtar-road/stipend",
          "/ggss-nishtar-road/stipend/",
          "/staff-data",
          "/teachers-data",
          "/my-presentations",
          "/audience/",
        ],
      },
    ],
    sitemap: "https://themastersahib.com/sitemap.xml",
  };
}
