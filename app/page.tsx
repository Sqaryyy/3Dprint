"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, Store as StoreIcon } from "lucide-react";
import Link from "next/link";
import {
  MANUFACTURERS,
  STORES,
  ALL_ITEMS,
  getDefaultStoreItems,
  getStoreById,
  type Item,
} from "@/lib/data";

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
          tag.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              3D Miniatures Marketplace
            </h1>
            <p className="text-gray-600">
              Discover high-quality 3D printable miniatures from talented
              creators
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-800"
              size={20}
            />
            <input
              type="text"
              placeholder="Search miniatures, armies, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters and Sort */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-800 font-medium">
              {displayListings.length} listings
            </span>

            <select
              value={filterManufacturer}
              onChange={(e) => setFilterManufacturer(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm 
                 bg-white text-gray-800 font-medium 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Manufacturers</option>
              {MANUFACTURERS.map((manufacturer) => (
                <option key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                </option>
              ))}
            </select>

            <select
              value={filterUnitType}
              onChange={(e) => setFilterUnitType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm 
                 bg-white text-gray-800 font-medium 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {unitTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-800 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm 
                 bg-white text-gray-800 font-medium 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayListings.map((listing, index) => {
            const manufacturer = MANUFACTURERS.find(
              (m) => m.id === listing.manufacturerId
            );
            return (
              <Link
                key={`${listing.storeId}-${listing.id}-${index}`}
                href={`/item/${listing.id}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {listing.army}
                    </span>
                    <span className="text-xs text-gray-500">
                      {listing.unitType}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {listing.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Manufacturer */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center shrink-0">
                      {manufacturer?.logo ? (
                        <img
                          src={manufacturer.logo}
                          alt={manufacturer.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <StoreIcon size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      by {manufacturer?.name}
                    </span>
                  </div>

                  {/* Store selling this item */}
                  <div className="flex items-center gap-2 mb-3 bg-green-50 px-2 py-1.5 rounded">
                    <StoreIcon size={14} className="text-green-600" />
                    <span className="text-xs font-medium text-green-700">
                      Sold by {listing.storeName}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {listing.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-gray-900">
                      ${listing.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {displayListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No listings found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
