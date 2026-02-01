# GIF Picker

React component for searching GIFs/Stickers via Giphy API.

## Setup

```bash
bun install
```

Add `GIPHY_API_KEY` to `.env.local` ([get one here](https://developers.giphy.com/))

## Usage

```tsx
import { GifPicker } from "@/components/ui/gif-picker";

<GifPicker
  onSelect={(gif) => console.log(gif)}
  columns={3}              // 2 | 3 | 4
  limit={20}               // results count
  defaultTab="gifs"        // "gifs" | "stickers"
  placeholder="Search..."
  className=""
/>
```

## Run

```bash
bun dev
```
