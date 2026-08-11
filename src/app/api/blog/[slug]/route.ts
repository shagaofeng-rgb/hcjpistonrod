import { NextResponse } from "next/server";
import { getPublishedBlogArticle } from "@/lib/news-content";

export const revalidate = 1800;

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedBlogArticle(slug);
  return article ? NextResponse.json({ item: article }) : NextResponse.json({ error: "Blog article not found" }, { status: 404 });
}
