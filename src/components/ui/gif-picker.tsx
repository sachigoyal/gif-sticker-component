"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

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
  apiKey: string;
  onSelect?: (gif: GifResult) => void;
  columns?: number;
  limit?: number;
  className?: string;
  placeholder?: string;
  defaultTab?: ContentType;
}

interface CachedData {
  trending: GifResult[];
  search: { [query: string]: GifResult[] };
}

export function GifPicker({
  apiKey,
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
  const [displayItems, setDisplayItems] = useState<GifResult[]>([]);

  const cache = useRef<{ gifs: CachedData; stickers: CachedData }>({
    gifs: { trending: [], search: {} },
    stickers: { trending: [], search: {} },
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

  const fetchTrending = useCallback(
    async (tab: ContentType, forceRefresh = false) => {
      if (!forceRefresh && cache.current[tab].trending.length > 0) {
        setDisplayItems(cache.current[tab].trending);
        return;
      }

      try {
        const endpoint = tab === "gifs" ? "gifs" : "stickers";
        const res = await fetch(
          `https://api.giphy.com/v1/${endpoint}/trending?api_key=${apiKey}&limit=${limit}&rating=g`
        );
        const data = await res.json();
        const items = data.data || [];

        cache.current[tab].trending = items;
        setDisplayItems(items);
      } catch (error) {
        console.error(`Failed to fetch trending ${tab}:`, error);
      }
    },
    [apiKey, limit]
  );

  const searchItems = useCallback(
    async (searchQuery: string, tab: ContentType) => {
      if (!searchQuery.trim()) {
        fetchTrending(tab); 
        return;
      }

      const cachedResults = cache.current[tab].search[searchQuery];
      if (cachedResults) {
        setDisplayItems(cachedResults);
        return;
      }

      try {
        const endpoint = tab === "gifs" ? "gifs" : "stickers";
        const res = await fetch(
          `https://api.giphy.com/v1/${endpoint}/search?api_key=${apiKey}&q=${encodeURIComponent(
            searchQuery
          )}&limit=${limit}&rating=g`
        );
        const data = await res.json();
        const items = data.data || [];

        cache.current[tab].search[searchQuery] = items;
        setDisplayItems(items);
      } catch (error) {
        console.error(`Failed to search ${tab}:`, error);
      }
    },
    [apiKey, limit, fetchTrending]
  );

  useEffect(() => {
    const currentQuery = query.trim();
    if (currentQuery) {
      const cachedResults = cache.current[activeTab].search[currentQuery];
      if (cachedResults) {
        setDisplayItems(cachedResults);
      } else {
        searchItems(currentQuery, activeTab);
      }
    } else {
      const cachedTrending = cache.current[activeTab].trending;
      if (cachedTrending.length > 0) {
        setDisplayItems(cachedTrending);
      } else {
        fetchTrending(activeTab);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchItems(query, activeTab);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, searchItems, activeTab]);

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
          <TabsTrigger
            value="gifs"
            className="text-sm font-medium"
          >
            GIFs
          </TabsTrigger>
          <TabsTrigger
            value="stickers"
            className="text-sm font-medium"
          >
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
          {displayItems.length === 0 ? (
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
                  selectedItem?.id === item.id && "ring-2 ring-primary ring-offset-2"
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

      <div className="flex justify-end">
        <a
          href="https://giphy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Powered by GIPHY
        </a>
      </div>
    </div>
  );
}

export type { GifResult, GifPickerProps, ContentType };
