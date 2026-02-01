"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/lib/use-debounce";

type ContentType = "gifs" | "stickers";

interface GifResult {
  id: string;
  title: string;
  type: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
    fixed_width_small: {
      url: string;
      width: string;
      height: string;
    };
  };
}

interface GifPickerProps {
  onSelect?: (gif: GifResult) => void;
  columns?: number;
  limit?: number;
  className?: string;
  placeholder?: string;
  defaultTab?: ContentType;
}

async function fetchGiphy(
  type: ContentType,
  query: string,
  limit: number
): Promise<GifResult[]> {
  const params = new URLSearchParams({
    type,
    limit: String(limit),
    ...(query.trim() && { q: query }),
  });

  const res = await fetch(`/api/giphy?${params}`);
  const data = await res.json();
  return data.data || [];
}

function GifPickerContent({
  onSelect,
  columns = 3,
  limit = 20,
  className,
  placeholder,
  defaultTab = "gifs",
}: GifPickerProps) {
  const [activeTab, setActiveTab] = useState<ContentType>(defaultTab);
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<GifResult | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  const { data: displayItems = [], isLoading } = useQuery({
    queryKey: ["giphy", activeTab, debouncedQuery, limit],
    queryFn: () => fetchGiphy(activeTab, debouncedQuery, limit),
    staleTime: 5 * 60 * 1000, 
    gcTime: 30 * 60 * 1000, 
  });

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return activeTab === "gifs" ? "Search GIFs..." : "Search stickers...";
  };

  const getEmptyMessage = () => {
    return activeTab === "gifs" ? "No GIFs found" : "No stickers found";
  };

  const getSelectedLabel = () => {
    if (selectedItem?.title) return selectedItem.title;
    return selectedItem?.type === "sticker" ? "Selected Sticker" : "Selected GIF";
  };

  const handleSelect = (item: GifResult) => {
    setSelectedItem(item);
    onSelect?.(item);
  };

  const clearSelection = () => {
    setSelectedItem(null);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ContentType);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {selectedItem && (
        <div className="relative rounded-lg border bg-muted/50 p-2">
          <button
            onClick={clearSelection}
            className="absolute -right-2 -top-2 rounded-full bg-muted p-1"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="flex items-center gap-3">
            <img
              src={selectedItem.images.fixed_width_small.url}
              alt={selectedItem.title}
              className="h-16 w-16 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getSelectedLabel()}</p>
              <p className="text-xs text-muted-foreground">Click to change</p>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 gap-1 bg-muted ">
          <TabsTrigger value="gifs" className="text-sm font-medium">
            GIFs
          </TabsTrigger>
          <TabsTrigger value="stickers" className="text-sm font-medium">
            Stickers
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={getPlaceholder()}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="relative overflow-hidden rounded-lg border bg-background">
        <div
          className={cn(
            "grid gap-2 max-h-[400px] min-h-[200px] overflow-y-auto p-2",
            columns === 2 && "grid-cols-2",
            columns === 3 && "grid-cols-3",
            columns === 4 && "grid-cols-4"
          )}
        >
          {isLoading ? (
            Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))
          ) : displayItems.length === 0 ? (
            <div
              className={cn(
                "flex items-center justify-center py-12 text-sm text-muted-foreground",
                columns === 2 && "col-span-2",
                columns === 3 && "col-span-3",
                columns === 4 && "col-span-4"
              )}
            >
              {getEmptyMessage()}
            </div>
          ) : (
            displayItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-md bg-muted transition-all duration-150 hover:ring-2 hover:ring-primary hover:ring-offset-2",
                  selectedItem?.id === item.id &&
                    "ring-2 ring-primary ring-offset-2"
                )}
              >
                <img
                  src={item.images.fixed_height.url}
                  alt={item.title}
                  className="h-full w-full object-cover transition-opacity duration-150"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export { GifPickerContent as GifPicker };
export type { GifResult, GifPickerProps, ContentType };
