import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أمانة — حجز مقاعد ونقل بريد بين المحافظات",
    short_name: "أمانة",
    description:
      "منصة عراقية لحجز مقاعد السفر بين المحافظات وإرسال الأمانات والبريد.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F2EC",
    theme_color: "#0B5D51",
    lang: "ar",
    dir: "rtl",
    orientation: "portrait",
    icons: [
      { src: "/icon-512.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/icon-512.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
