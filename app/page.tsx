"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, Box } from "lucide-react";

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  tags: string[];
  image: string;
  fileSize: string;
  downloads: number;
  category: string;
  format: string;
  type: string;
}

interface StoreInfo {
  name: string;
  description: string;
  since: string;
  logo: string;
}

export default function StoreFront() {
  const [items, setItems] = useState<Item[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "Highlands Miniatures",
    description:
      "We're Highlands Miniatures, a couple who creates awesome 3D printable miniatures for tabletop games, come and join us!",
    since: "January 2018",
    logo: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFormat, setFilterFormat] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");

  const categories = [
    "All",
    "Orcs and Goblins",
    "Sewer Vermin",
    "Gallia",
    "Dwarfs, Sons of Ymir",
    "Aegean Elves",
    "Sunland",
    "Transilvanya",
    "Eternal Dynasties",
  ];

  const formats = ["All", "3D", "3D & PDF", "PDF"];
  const types = ["All", "Objects", "Bundles"];
  const prices = ["All", "Free objects", "Premium objects"];
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  useEffect(() => {
    // Load store items from localStorage
    const storedItems = localStorage.getItem("storeItems");
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }

    // Load store info from localStorage
    const storedInfo = localStorage.getItem("storeInfo");
    if (storedInfo) {
      setStoreInfo(JSON.parse(storedInfo));
    }
  }, []);

  const resetFilters = () => {
    setFilterCategory("all");
    setFilterFormat("all");
    setFilterType("all");
    setFilterPrice("all");
    setSearchQuery("");
  };

  const filteredAndSortedItems = () => {
    let result = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        filterCategory === "all" ||
        filterCategory.toLowerCase() === item.category.toLowerCase();

      const matchesFormat =
        filterFormat === "all" ||
        filterFormat.toLowerCase() === item.format.toLowerCase();

      const matchesType =
        filterType === "all" ||
        (filterType === "objects" && item.type === "object") ||
        (filterType === "bundles" && item.type === "bundle");

      const matchesPrice =
        filterPrice === "all" ||
        (filterPrice === "free objects" && item.price === 0) ||
        (filterPrice === "premium objects" && item.price > 0);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFormat &&
        matchesType &&
        matchesPrice
      );
    });

    // Sort
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
      default:
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
          {/* Store Info */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {storeInfo.logo ? (
                <img
                  src={storeInfo.logo}
                  alt={storeInfo.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Box size={48} className="text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold text-gray-900">
                  {storeInfo.name}
                </h1>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                  3D Printing since {storeInfo.since}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed max-w-3xl">
                {storeInfo.description}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search miniatures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Reset
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Categories
                </h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={filterCategory === cat.toLowerCase()}
                        onChange={() => setFilterCategory(cat.toLowerCase())}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Format
                </h4>
                <div className="space-y-2">
                  {formats.map((fmt) => (
                    <label
                      key={fmt}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="format"
                        checked={filterFormat === fmt.toLowerCase()}
                        onChange={() => setFilterFormat(fmt.toLowerCase())}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">{fmt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Objects & Bundles */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Objects & Bundles
                </h4>
                <div className="space-y-2">
                  {types.map((type) => (
                    <label
                      key={type}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="type"
                        checked={filterType === type.toLowerCase()}
                        onChange={() => setFilterType(type.toLowerCase())}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Price
                </h4>
                <div className="space-y-2">
                  {prices.map((price) => (
                    <label
                      key={price}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="price"
                        checked={filterPrice === price.toLowerCase()}
                        onChange={() => setFilterPrice(price.toLowerCase())}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">{price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-600">
                {displayItems.length} items
              </span>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent"
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Download size={14} />
                        {item.downloads}
                      </span>
                      <span>{item.fileSize}</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                        {item.format}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold text-gray-900">
                        {item.price === 0
                          ? "Free"
                          : `$${item.price.toFixed(2)}`}
                      </span>
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No miniatures found matching your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
