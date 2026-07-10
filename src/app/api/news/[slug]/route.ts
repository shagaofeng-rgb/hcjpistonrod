import { NextResponse } from "next/server";
import { getPublishedNewsArticle } from "@/lib/news-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 1800;

export async function GET(_: Request, { params }: Props) {
  const { slug } = await params;
  const article = await getPublishedNewsArticle(slug);

  if (!article) {
    return NextResponse.json({ error: "News article not found" }, { status: 404 });
  }

  return NextResponse.json({ item: article });
}
