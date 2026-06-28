import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

function getAllArticleIds(): string[] {
  try {
    const jsonPath = path.join(process.cwd(), "app", "data", "content.json");
    if (!fs.existsSync(jsonPath)) return [];

    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    const topStories = data.topStories || [];
    const latestNews = data.latestNews || [];

    const allArticles = [...topStories, ...latestNews];
    return allArticles.map((item: any) => item.id).filter(Boolean);
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://unsung.vercel.app";
  const articleIds = getAllArticleIds();

  return [
    // Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    // News Articles (dynamic - reads from content.json)
    ...articleIds.map((id) => ({
      url: `${baseUrl}/news/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),

    // Main Categories
    { url: `${baseUrl}/category/latest`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/category/india`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/category/politics`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/category/business`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/category/sports`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/category/entertainment`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/category/tech`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/category/lifestyle`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },

    // Secondary Categories
    { url: `${baseUrl}/category/web-stories`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${baseUrl}/category/opinion`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${baseUrl}/category/science`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${baseUrl}/category/trends`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${baseUrl}/category/people`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${baseUrl}/category/education`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${baseUrl}/category/health`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${baseUrl}/category/food`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },

    // Info Pages
    { url: `${baseUrl}/info/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/info/advertise`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/info/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/info/privacy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/info/terms`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/info/disclaimer`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];
}