import { NextResponse } from "next/server";
import { getPublishedBlogArticles } from "@/lib/news-content";

export const revalidate = 1800;

export async function GET(request: Request) {
  const articles = await getPublishedBlogArticles();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(24, Math.max(1, Number(searchParams.get("pageSize") || 12)));
  const start = (page - 1) * pageSize;
  return NextResponse.json({ items: articles.slice(start, start + pageSize), pagination: { page, pageSize, total: articles.length, totalPages: Math.max(1, Math.ceil(articles.length / pageSize)) } });
}
