"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, Store } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  STORES,
  ALL_ITEMS,
  getItemsByStore,
  getStoreById,
  type Item,
} from "@/lib/data";

export default function StorePage() {
  const params = useParams();
  const storeId = parseInt(params.storeId as string);

  const [searchQuery, setSearchQuery] = useState("");
  const [storeItems, setStoreItems] = useState<Item[]>([]);

  const store = getStoreById(storeId);

  useEffect(() => {
    // Load items for this store
    const loadItems = () => {
      const storedItems = sessionStorage.getItem(`store_${storeId}_items`);
      if (storedItems) {
        setStoreItems(JSON.parse(storedItems) as Item[]);
      } else {
        // Fallback to default items
        setStoreItems(getItemsByStore(storeId));
      }
    };

    loadItems();

    // Refresh when storage changes
    const interval = setInterval(loadItems, 1000);
    return () => clearInterval(interval);
  }, [storeId]);

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Store not found
          </h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const filteredItems = storeItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.army.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unitType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Marketplace
          </Link>

          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-gray-900 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store size={48} className="text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold text-gray-900">
                  {store.name}
                </h1>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                  Since {store.since}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                {store.description}
              </p>

              <div className="flex gap-3">
                <Link
                  href={`/store/${storeId}/admin`}
                  className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Manage Store
                </Link>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search this store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-4">
          <span className="text-sm text-gray-600">
            {filteredItems.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
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
                  <span className="text-xs text-gray-500">{item.unitType}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>

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
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found in this store.</p>
          </div>
        )}
      </div>
    </div>
  );
}
