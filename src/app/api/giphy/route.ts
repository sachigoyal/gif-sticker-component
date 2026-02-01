import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "gifs";
  const query = searchParams.get("q") || "";
  const limit = searchParams.get("limit") || "20";

  const apiKey = process.env.GIPHY_API_KEY; // NOT NEXT_PUBLIC_
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const endpoint = type === "stickers" ? "stickers" : "gifs";
  const url = query.trim()
    ? `https://api.giphy.com/v1/${endpoint}/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`
    : `https://api.giphy.com/v1/${endpoint}/trending?api_key=${apiKey}&limit=${limit}&rating=g`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);
}
