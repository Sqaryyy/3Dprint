"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, Store } from "lucide-react";
import Link from "next/link";
import { STORES, ALL_ITEMS, type Item, type StoreInfo } from "@/lib/data";

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterStore, setFilterStore] = useState("all");
  const [filterUnitType, setFilterUnitType] = useState("all");
  const [allStoreItems, setAllStoreItems] = useState<Item[]>([]);

  useEffect(() => {
    // Load items from all stores
    const loadAllStoreItems = () => {
      const items: Item[] = [];

      STORES.forEach((store) => {
        const storedItems = sessionStorage.getItem(`store_${store.id}_items`);
        if (storedItems) {
          const storeItems = JSON.parse(storedItems);
          items.push(...storeItems);
        } else {
          // If no custom items set, use default items for this store
          const defaultItems = ALL_ITEMS.filter(
            (item) => item.storeId === store.id
          );
          items.push(...defaultItems);
        }
      });

      setAllStoreItems(items);
    };

    loadAllStoreItems();

    // Listen for storage changes (when admin updates items)
    const handleStorageChange = () => {
      loadAllStoreItems();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for sessionStorage changes (since storage event doesn't fire for same-tab changes)
    const interval = setInterval(loadAllStoreItems, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "popular", label: "Most Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  const unitTypes = ["All", "Knight of the realm", "Man at arms", "Bowmen"];

  const filteredAndSortedItems = () => {
    let result = allStoreItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.army.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStore =
        filterStore === "all" || item.storeId === parseInt(filterStore);

      const matchesUnitType =
        filterUnitType === "all" ||
        filterUnitType.toLowerCase() === item.unitType.toLowerCase();

      return matchesSearch && matchesStore && matchesUnitType;
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

  const displayItems = filteredAndSortedItems();

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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search miniatures, armies, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Featured Stores */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Featured Stores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STORES.map((store) => (
              <Link
                key={store.id}
                href={`/store/${store.id}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                    {store.logo ? (
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Store size={24} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {store.name}
                    </h3>
                    <p className="text-xs text-gray-500">Since {store.since}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {store.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-800 font-medium">
              {displayItems.length} items
            </span>

            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm 
                 bg-white text-gray-800 font-medium 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stores</option>
              {STORES.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
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
          {displayItems.map((item) => {
            const store = STORES.find((s) => s.id === item.storeId);
            return (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {item.army}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.unitType}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center shrink-0">
                      {store?.logo ? (
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Store size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{store?.name}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Download size={14} />
                      {item.downloads}
                    </span>
                    <span>{item.fileSize}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-gray-900">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {displayItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No items found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
