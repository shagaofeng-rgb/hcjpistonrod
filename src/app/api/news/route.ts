import { NextResponse } from "next/server";
import { getPublishedNewsArticles } from "@/lib/news-content";

export const revalidate = 1800;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // API consumers must see the same visibility state as the public News list.
  const newsArticles = await getPublishedNewsArticles({ fresh: true });
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(24, Math.max(1, Number(searchParams.get("pageSize") || 12)));
  const category = searchParams.get("category")?.toLowerCase();
  const query = searchParams.get("q")?.toLowerCase();

  const filtered = newsArticles.filter((article) => {
    const categoryMatch = !category || category === "all" || article.category.toLowerCase() === category;
    const queryMatch =
      !query ||
      [article.title, article.excerpt, article.geoSummary, article.category, ...article.keyTakeaways]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return categoryMatch && queryMatch;
  });

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    items,
    pagination: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    },
  });
}
