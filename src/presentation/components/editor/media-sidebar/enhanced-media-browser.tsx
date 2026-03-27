"use client";

import { useEffect, useState, useCallback } from "react";
import { useEditorStore } from "@/presentation/stores/editor-store";
import { usePresignedUrls } from "@/presentation/hooks/use-presigned-urls";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Music, Search, Tag, X } from "lucide-react";
import type { MediaAsset } from "@/domain/media/entities/media-asset";

interface MediaBrowserProps {
  type: "image" | "audio";
}

interface TagFilter {
  id: string;
  name: string;
  count: number;
}

export function EnhancedMediaBrowser({ type }: MediaBrowserProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableTags, setAvailableTags] = useState<TagFilter[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  
  const { slideshow, currentSlideIndex, addObject, selectObject } = useEditorStore();
  const { urls: presignedUrls } = usePresignedUrls(filteredAssets);

  const currentSlide = slideshow?.slides[currentSlideIndex] ?? null;

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);
      try {
        const res = await fetch(`/api/media?type=${type}&limit=100`);
        if (!res.ok) throw new Error("Failed to load media");
        const data = await res.json();
        const items = data.items ?? data;
        setAssets(items);
        setFilteredAssets(items);
        
        // Extract tags from assets (in real implementation, fetch from API)
        const tags = extractTags(items);
        setAvailableTags(tags);
      } catch {
        setAssets([]);
        setFilteredAssets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [type]);

  // Filter assets based on search and tags
  useEffect(() => {
    let filtered = assets;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((asset) =>
        asset.fileName.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((asset) => {
        // In real implementation, check asset.tags
        const assetTags = getAssetTags(asset);
        return selectedTags.some((tag) => assetTags.includes(tag));
      });
    }

    setFilteredAssets(filtered);
  }, [searchQuery, selectedTags, assets]);

  const extractTags = (items: MediaAsset[]): TagFilter[] => {
    const tagCounts = new Map<string, number>();
    
    items.forEach((asset) => {
      const tags = getAssetTags(asset);
      tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([name, count], id) => ({ id: String(id), name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getAssetTags = (asset: MediaAsset): string[] => {
    // Extract tags from filename or use predefined categories
    const tags: string[] = [];
    const name = asset.fileName.toLowerCase();
    
    if (type === "image") {
      if (name.includes("nature") || name.includes("landscape")) tags.push("Nature");
      if (name.includes("portrait") || name.includes("person")) tags.push("Portrait");
      if (name.includes("business") || name.includes("office")) tags.push("Business");
      if (name.includes("abstract") || name.includes("pattern")) tags.push("Abstract");
      if (name.includes("texture") || name.includes("background")) tags.push("Background");
    } else {
      if (name.includes("music") || name.includes("song")) tags.push("Music");
      if (name.includes("sound") || name.includes("effect")) tags.push("Sound Effect");
      if (name.includes("voice") || name.includes("speech")) tags.push("Voice");
      if (name.includes("ambient") || name.includes("atmosphere")) tags.push("Ambient");
    }
    
    // Add file extension as tag
    const ext = asset.fileName.split('.').pop()?.toLowerCase();
    if (ext) tags.push(ext.toUpperCase());
    
    return tags.length > 0 ? tags : ["Uncategorized"];
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  const handleDragStart = useCallback(
    (e: React.DragEvent, asset: MediaAsset) => {
      e.dataTransfer.setData(
        "application/slideforge-media",
        JSON.stringify(asset)
      );
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  const handleAddImage = useCallback(
    (asset: MediaAsset) => {
      if (!currentSlide || type !== "image") return;
      const id = crypto.randomUUID();
      addObject(currentSlide.id, {
        id,
        slideId: currentSlide.id,
        type: "image",
        x: 50,
        y: 50,
        width: asset.width ?? 400,
        height: asset.height ?? 300,
        rotation: 0,
        opacity: 1,
        zIndex: currentSlide.canvasObjects.length + 1,
        properties: {
          mediaAssetId: asset.id,
          objectFit: "contain",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      selectObject(id);
    },
    [currentSlide, type, addObject, selectObject]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            type="text"
            placeholder={`Search ${type}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 pr-8 text-xs bg-white/[0.04] border-white/[0.08]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Tag Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTagFilter(!showTagFilter)}
            className="h-6 text-xs text-slate-400 hover:text-slate-200"
          >
            <Tag className="mr-1 h-3 w-3" />
            Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
          </Button>
          
          {(searchQuery || selectedTags.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Tag Filter Panel */}
        {showTagFilter && availableTags.length > 0 && (
          <div className="flex flex-wrap gap-1 p-2 bg-white/[0.02] rounded-lg">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.name)}
                className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                  selectedTags.includes(tag.name)
                    ? "bg-rose-600 text-white"
                    : "bg-white/[0.06] text-slate-400 hover:bg-white/[0.1]"
                }`}
              >
                {tag.name} ({tag.count})
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <div className="text-[10px] text-slate-500">
          {filteredAssets.length} of {assets.length} {type}s
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredAssets.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-600">
              {assets.length === 0
                ? `No ${type} files yet. Upload some above.`
                : "No results match your filters."}
            </p>
          </div>
        ) : type === "audio" ? (
          <div className="flex flex-col gap-1">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, asset)}
                className="flex cursor-grab items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] active:cursor-grabbing"
              >
                <Music className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <div className="flex-1 min-w-0">
                  <span className="truncate block">{asset.fileName}</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {getAssetTags(asset).slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[9px] text-slate-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, asset)}
                onClick={() => handleAddImage(asset)}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border border-white/[0.06] transition-all",
                  "cursor-grab hover:border-white/[0.15] active:cursor-grabbing"
                )}
              >
                {presignedUrls[asset.id] ? (
                  <img
                    src={presignedUrls[asset.id]}
                    alt={asset.fileName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/[0.02]">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="truncate text-[10px] text-slate-300">
                    {asset.fileName}
                  </div>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {getAssetTags(asset).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] px-1 py-0.5 bg-white/20 rounded text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Keep backward compatibility
export function MediaBrowser(props: MediaBrowserProps) {
  return <EnhancedMediaBrowser {...props} />;
}
