"use client";

import { Github } from "lucide-react";
import { GifPicker, type GifResult } from "@/components/ui/gif-picker";
import ModeToggle from "@/components/theme/toggler";

export default function Home() {
  const handleSelect = (gif: GifResult) => {
    console.log("Selected:", gif);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <a
          href="https://github.com/sachigoyal/gif-sticker-component"
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-10 items-center justify-center rounded-md hover:bg-accent"
        >
          <Github className="size-4" />
          <span className="sr-only">GitHub</span>
        </a>
        <ModeToggle />
      </div>
      <main className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">GIF Picker</h1>
          <p className="text-sm text-muted-foreground">
            Search and select GIFs or Stickers
          </p>
        </div>

        <GifPicker
          onSelect={handleSelect}
          columns={3}
          limit={15}
        />
      </main>
    </div>
  );
}
