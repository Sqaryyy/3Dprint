"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ALL_ITEMS,
  STORES,
  getStoreById,
  type Item,
  type StoreInfo,
} from "@/lib/data";

export default function AdminPage() {
  const params = useParams();
  const storeId = parseInt(params.storeId as string);

  const [storeItems, setStoreItems] = useState<Item[]>([]);
  const [allowedItemIds, setAllowedItemIds] = useState<number[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load store items from memory (in real app this would be from a database)
    const storedItems = sessionStorage.getItem(`store_${storeId}_items`);
    const storedAllowedIds = sessionStorage.getItem(
      `store_${storeId}_allowed_ids`
    );

    if (storedItems) {
      setStoreItems(JSON.parse(storedItems));
    } else {
      // Initialize with items that belong to this store from lib/data.ts
      const defaultStoreItems = ALL_ITEMS.filter(
        (item) => item.storeId === storeId
      );
      setStoreItems(defaultStoreItems);
      sessionStorage.setItem(
        `store_${storeId}_items`,
        JSON.stringify(defaultStoreItems)
      );
    }

    if (storedAllowedIds) {
      setAllowedItemIds(JSON.parse(storedAllowedIds));
    } else {
      // Initialize with the original item IDs for this store
      const defaultAllowedIds = ALL_ITEMS.filter(
        (item) => item.storeId === storeId
      ).map((item) => item.id);
      setAllowedItemIds(defaultAllowedIds);
      sessionStorage.setItem(
        `store_${storeId}_allowed_ids`,
        JSON.stringify(defaultAllowedIds)
      );
    }

    // Load store info
    const storedInfo = sessionStorage.getItem(`store_${storeId}_info`);
    if (storedInfo) {
      setStoreInfo(JSON.parse(storedInfo));
    } else {
      // Get default store info from lib/data.ts
      const defaultInfo = getStoreById(storeId);
      if (defaultInfo) {
        setStoreInfo(defaultInfo);
      }
    }
  }, [storeId]);

  const saveStoreItems = (items: Item[]) => {
    setStoreItems(items);
    sessionStorage.setItem(`store_${storeId}_items`, JSON.stringify(items));
  };

  const saveAllowedIds = (ids: number[]) => {
    setAllowedItemIds(ids);
    sessionStorage.setItem(`store_${storeId}_allowed_ids`, JSON.stringify(ids));
  };

  const saveStoreInfo = () => {
    if (storeInfo) {
      sessionStorage.setItem(
        `store_${storeId}_info`,
        JSON.stringify(storeInfo)
      );
      alert("Store settings saved!");
    }
  };

  // Check if the store already has an item of this unit type
  const hasUnitType = (unitType: string) => {
    return storeItems.some((item) => item.unitType === unitType);
  };

  // Check if this specific item is allowed for this store
  const isItemAllowed = (itemId: number) => {
    return allowedItemIds.includes(itemId);
  };

  const addItemToStore = (item: Item) => {
    if (!isItemAllowed(item.id)) {
      alert(
        `This item is not available for your store. You can only add items that were originally assigned to your store.`
      );
      return;
    }
    if (hasUnitType(item.unitType)) {
      alert(`You already have a "${item.unitType}" unit in your store!`);
      return;
    }
    const itemWithStore = { ...item, storeId };
    saveStoreItems([...storeItems, itemWithStore]);
  };

  const removeItemFromStore = (itemId: number) => {
    saveStoreItems(storeItems.filter((item) => item.id !== itemId));
  };

  const filteredAvailableItems = ALL_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.army.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unitType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!storeInfo) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Admin Panel - {storeInfo.name}
          </h1>
          <div className="flex gap-3">
            <Link
              href={`/store/${storeId}`}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Store
            </Link>
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Marketplace
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Items - Add to Store */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Available Items
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search available items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredAvailableItems
                .filter((item) => isItemAllowed(item.id))
                .map((item) => {
                  const alreadyHasUnitType = hasUnitType(item.unitType);

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        alreadyHasUnitType
                          ? "border-gray-200 bg-gray-50 opacity-60"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.army} • {item.unitType} • {item.format}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold text-gray-900">
                              {item.price === 0
                                ? "Free"
                                : `${item.price.toFixed(2)}`}
                            </span>
                            {alreadyHasUnitType ? (
                              <span className="text-sm text-green-600 font-medium">
                                ✓ In store
                              </span>
                            ) : (
                              <button
                                onClick={() => addItemToStore(item)}
                                className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors"
                              >
                                <Plus size={16} />
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Current Store Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Your Store Items ({storeItems.length})
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {storeItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No items in your store yet. Add items from the available list.
                </p>
              ) : (
                storeItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {item.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.army} • {item.unitType} • {item.format}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItemFromStore(item.id)}
                            className="text-gray-400 hover:text-red-600 ml-2"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="mt-2">
                          <span className="font-semibold text-gray-900">
                            {item.price === 0
                              ? "Free"
                              : `$${item.price.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
