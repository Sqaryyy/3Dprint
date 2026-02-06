"use client";

import React, { useState, useEffect } from "react";
import { Search, Store as StoreIcon } from "lucide-react";
import Link from "next/link";
import {
  MANUFACTURERS,
  STORES,
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

// Extended item type that includes store information
interface ItemListing extends Item {
  storeId: number;
  storeName: string;
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterManufacturer, setFilterManufacturer] = useState("all");
  const [filterUnitType, setFilterUnitType] = useState("all");
  const [allListings, setAllListings] = useState<ItemListing[]>([]);

  useEffect(() => {
    // Load all item listings from all stores
    const loadAllListings = () => {
      const listings: ItemListing[] = [];

      STORES.forEach((store) => {
        const storedItems = sessionStorage.getItem(`store_${store.id}_items`);
        let storeItems: Item[] = [];

        if (storedItems) {
          storeItems = JSON.parse(storedItems);
        } else {
          // Use default store inventory
          storeItems = getDefaultStoreItems(store.id);
        }

        // Add each item from this store as a separate listing
        storeItems.forEach((item) => {
          listings.push({
            ...item,
            storeId: store.id,
            storeName: store.name,
          });
        });
      });

      setAllListings(listings);
    };

    // Initialize default store inventories in sessionStorage if not present
    STORES.forEach((store) => {
      const key = `store_${store.id}_items`;
      if (!sessionStorage.getItem(key)) {
        const defaultItems = getDefaultStoreItems(store.id);
        sessionStorage.setItem(key, JSON.stringify(defaultItems));
      }
    });

    // Load all listings initially
    loadAllListings();

    // Listen for storage changes (when admin updates items)
    const handleStorageChange = () => {
      loadAllListings();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for sessionStorage changes
    const interval = setInterval(loadAllListings, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  const unitTypes = ["All", "Knight of the realm", "Man at arms", "Bowmen"];

  const filteredAndSortedListings = () => {
    let result = allListings.filter((listing) => {
      const matchesSearch =
        listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.army.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesManufacturer =
        filterManufacturer === "all" ||
        listing.manufacturerId === parseInt(filterManufacturer);

      const matchesUnitType =
        filterUnitType === "all" ||
        filterUnitType.toLowerCase() === listing.unitType.toLowerCase();

      return matchesSearch && matchesManufacturer && matchesUnitType;
    });

    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  };

  const displayListings = filteredAndSortedListings();

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

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search miniatures, armies, or tags..."
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
              {displayListings.length} {displayListings.length === 1 ? 'listing' : 'listings'}
            </span>

            <Select value={filterManufacturer} onValueChange={setFilterManufacturer}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Manufacturers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Manufacturers</SelectItem>
                {MANUFACTURERS.map((manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                    {manufacturer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterUnitType} onValueChange={setFilterUnitType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Unit Types" />
              </SelectTrigger>
              <SelectContent>
                {unitTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
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
          {displayListings.map((listing, index) => {
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
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={listing.image}
                      alt={listing.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
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

                    {/* Manufacturer */}
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
                        by {manufacturer?.name}
                      </span>
                    </div>

                    {/* Store selling this item */}
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