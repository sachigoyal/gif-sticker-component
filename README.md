# GIF Picker Component

React component for searching GIFs/Stickers via Giphy API.

## Setup

```bash
bun install
```

Add to `.env`:
```
NEXT_PUBLIC_GIPHY_API_KEY=your_api_key
```

## Usage

```tsx
<GifPicker
  apiKey={process.env.NEXT_PUBLIC_GIPHY_API_KEY!}
  onSelect={(gif) => console.log(gif)}
  columns={3}        // 2 | 3 | 4
  limit={15}         // results count
  defaultTab="gifs"  // "gifs" | "stickers"
/>
```

## Run

```bash
bun dev
```
