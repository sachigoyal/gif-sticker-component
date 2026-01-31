"use client";

import { GifPicker, type GifResult } from "@/components/ui/gif-picker";

export default function Home() {
  const handleSelect = (gif: GifResult) => {
    console.log("Selected:", gif);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <main className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">GIF Picker</h1>
          <p className="text-sm text-muted-foreground">
            Search and select GIFs or Stickers
          </p>
        </div>

        <GifPicker
          apiKey={process.env.NEXT_PUBLIC_GIPHY_API_KEY!}
          onSelect={handleSelect}
          columns={3}
          limit={15}
        />
      </main>
    </div>
  );
}
