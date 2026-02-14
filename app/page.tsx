"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Store as StoreIcon } from "lucide-react";
import Link from "next/link";
import {
  MANUFACTURERS,
  STORES,
  ALL_ITEMS,
  getDefaultStoreItems,
  type Item,
} from "@/lib/data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ItemListing extends Item {
  storeId: number;
  storeName: string;
}

function CardImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = React.useState(false);
  if (!src.trim() || errored) {
    return (
      <div className="aspect-video w-full bg-muted flex items-center justify-center">
        <StoreIcon className="h-10 w-10 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="aspect-video relative overflow-hidden bg-muted">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterGameSystem, setFilterGameSystem] = useState("all");
  const [filterArmy, setFilterArmy] = useState("all");
  const [filterUnitType, setFilterUnitType] = useState("all");
  const [filterManufacturer, setFilterManufacturer] = useState("all");
  const [filterStore, setFilterStore] = useState("all");
  const [allListings, setAllListings] = useState<ItemListing[]>([]);
  const [shuffledOrder, setShuffledOrder] = useState<Map<string, number>>(
    new Map(),
  );
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const loadAllListings = () => {
      const listings: ItemListing[] = [];
      STORES.forEach((store) => {
        const stored = sessionStorage.getItem(`store_${store.id}_items`);
        const storeItems: Item[] = stored
          ? JSON.parse(stored)
          : getDefaultStoreItems(store.id);
        storeItems.forEach((item) =>
          listings.push({ ...item, storeId: store.id, storeName: store.name }),
        );
      });
      setAllListings(listings);
      setShuffledOrder((prev) => {
        const next = new Map(prev);
        listings.forEach((l) => {
          const key = `${l.storeId}-${l.id}`;
          if (!next.has(key)) next.set(key, Math.random());
        });
        return next;
      });
    };

    STORES.forEach((store) => {
      const key = `store_${store.id}_items`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(
          key,
          JSON.stringify(getDefaultStoreItems(store.id)),
        );
      }
    });

    loadAllListings();
    window.addEventListener("storage", loadAllListings);
    const interval = setInterval(loadAllListings, 1000);
    return () => {
      window.removeEventListener("storage", loadAllListings);
      clearInterval(interval);
    };
  }, []);

  // Use ALL_ITEMS as the base so options are available immediately on first render
  // (allListings is populated async from sessionStorage — it's empty on the first paint).
  // Custom store-created items that exist only in sessionStorage get merged in via allListings.
  const itemsPool = useMemo(() => {
    const combined = [
      ...ALL_ITEMS,
      ...allListings.filter((l) => l.manufacturerId === 0),
    ];
    return combined;
  }, [allListings]);

  const allGameSystems = useMemo(
    () =>
      [...new Set(itemsPool.map((l) => l.gameSystem).filter(Boolean))].sort(),
    [itemsPool],
  );

  const allArmies = useMemo(
    () => [...new Set(itemsPool.map((l) => l.army))].sort(),
    [itemsPool],
  );

  const allUnitTypes = useMemo(
    () => [...new Set(itemsPool.map((l) => l.unitType))].sort(),
    [itemsPool],
  );

  const displayListings = useMemo(() => {
    let result = allListings.filter((listing) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        listing.name.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q) ||
        listing.army.toLowerCase().includes(q) ||
        listing.gameSystem?.toLowerCase().includes(q) ||
        listing.storeName.toLowerCase().includes(q) ||
        listing.tags.some((t) => t.toLowerCase().includes(q));

      const matchesGameSystem =
        filterGameSystem === "all" || listing.gameSystem === filterGameSystem;

      const matchesArmy = filterArmy === "all" || listing.army === filterArmy;

      const matchesUnitType =
        filterUnitType === "all" ||
        listing.unitType.toLowerCase() === filterUnitType.toLowerCase();

      const matchesManufacturer =
        filterManufacturer === "all" ||
        listing.manufacturerId === parseInt(filterManufacturer);

      const matchesStore =
        filterStore === "all" || listing.storeId.toString() === filterStore;

      return (
        matchesSearch &&
        matchesGameSystem &&
        matchesArmy &&
        matchesUnitType &&
        matchesManufacturer &&
        matchesStore
      );
    });

    switch (sortBy) {
      case "popular":
        result = [...result].sort((a, b) => {
          const aKey = `${a.storeId}-${a.id}`;
          const bKey = `${b.storeId}-${b.id}`;
          return (
            (shuffledOrder.get(aKey) ?? 0) - (shuffledOrder.get(bKey) ?? 0)
          );
        });
        break;
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [
    allListings,
    searchQuery,
    sortBy,
    filterGameSystem,
    filterArmy,
    filterUnitType,
    filterManufacturer,
    filterStore,
    shuffledOrder,
  ]);

  // Reset visible count whenever filters or sort change so users start from the top
  useEffect(() => {
    setVisibleCount(12);
  }, [
    searchQuery,
    sortBy,
    filterGameSystem,
    filterArmy,
    filterUnitType,
    filterManufacturer,
    filterStore,
  ]);

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              3D Miniatures Marketplace
            </h1>
            <p className="text-muted-foreground">
              Discover high-quality 3D printable miniatures from talented
              creators
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search miniatures, armies, game systems, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters and Sort */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">
              {displayListings.length}{" "}
              {displayListings.length === 1 ? "listing" : "listings"}
            </span>

            {/* 1. Game System */}
            <Select
              value={filterGameSystem}
              onValueChange={setFilterGameSystem}
            >
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="All Game Systems" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Game Systems</SelectItem>
                {allGameSystems.map((gs) => (
                  <SelectItem key={gs} value={gs}>
                    {gs}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 2. Army */}
            <Select value={filterArmy} onValueChange={setFilterArmy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Armies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Armies</SelectItem>
                {allArmies.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 3. Model / Unit Type */}
            <Select value={filterUnitType} onValueChange={setFilterUnitType}>
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {allUnitTypes.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 4. Manufacturer */}
            <Select
              value={filterManufacturer}
              onValueChange={setFilterManufacturer}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Manufacturers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Manufacturers</SelectItem>
                {MANUFACTURERS.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Sort by:
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayListings.slice(0, visibleCount).map((listing, index) => {
            const manufacturer = MANUFACTURERS.find(
              (m) => m.id === listing.manufacturerId,
            );
            return (
              <Link
                key={`${listing.storeId}-${listing.id}-${index}`}
                href={`/item/${listing.id}`}
                className="group"
              >
                <Card className="overflow-hidden h-full transition-all hover:shadow-lg">
                  <CardImage src={listing.image} alt={listing.name} />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {listing.gameSystem && (
                        <Badge variant="outline" className="text-xs">
                          {listing.gameSystem}
                        </Badge>
                      )}
                      <Badge variant="secondary">{listing.army}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {listing.unitType}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                        {listing.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-secondary rounded flex items-center justify-center shrink-0">
                        {manufacturer?.logo ? (
                          <img
                            src={manufacturer.logo}
                            alt={manufacturer.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <StoreIcon className="h-3 w-3" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        by{" "}
                        {listing.manufacturerId === 0
                          ? listing.storeName
                          : manufacturer?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-2 py-1.5 rounded-md">
                      <StoreIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        Sold by {listing.storeName}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {listing.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <span className="text-2xl font-bold">
                        ${listing.price.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Load More */}
        {visibleCount < displayListings.length && (
          <div className="flex flex-col items-center gap-2 mt-8">
            <button
              onClick={() => setVisibleCount((c) => c + 12)}
              className="px-8 py-2.5 rounded-lg border bg-card text-sm font-medium hover:bg-muted transition-colors"
            >
              Load More
            </button>
            <p className="text-xs text-muted-foreground">
              Showing {Math.min(visibleCount, displayListings.length)} of{" "}
              {displayListings.length} listings
            </p>
          </div>
        )}

        {displayListings.length === 0 && (
          <Card className="mt-12">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">No listings found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
