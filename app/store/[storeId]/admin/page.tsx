"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Search, DollarSign } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ALL_ITEMS,
  STORES,
  MANUFACTURERS,
  getStoreById,
  getManufacturerById,
  getDefaultStoreItems,
  type Item,
  type StoreInfo,
} from "@/lib/data";

export default function AdminPage() {
  const params = useParams();
  const storeId = parseInt(params.storeId as string);

  const [storeItems, setStoreItems] = useState<Item[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [showPriceModal, setShowPriceModal] = useState(false);

  useEffect(() => {
    // Load store items from sessionStorage
    const storedItems = sessionStorage.getItem(`store_${storeId}_items`);

    if (storedItems) {
      setStoreItems(JSON.parse(storedItems));
    } else {
      // Initialize with default store inventory
      const defaultItems = getDefaultStoreItems(storeId);
      setStoreItems(defaultItems);
      sessionStorage.setItem(
        `store_${storeId}_items`,
        JSON.stringify(defaultItems)
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

  // Check if the store already has this specific item
  const hasItem = (itemId: number) => {
    return storeItems.some((item) => item.id === itemId);
  };

  const openPriceModal = (item: Item) => {
    setSelectedItem(item);
    setCustomPrice(item.price.toFixed(2)); // Pre-fill with base price
    setShowPriceModal(true);
  };

  const closePriceModal = () => {
    setShowPriceModal(false);
    setSelectedItem(null);
    setCustomPrice("");
  };

  const confirmAddItem = () => {
    if (!selectedItem) return;

    const price = parseFloat(customPrice);
    if (isNaN(price) || price < 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (hasItem(selectedItem.id)) {
      alert(`This item is already in your store!`);
      closePriceModal();
      return;
    }

    // Add item with custom price
    const itemWithCustomPrice = {
      ...selectedItem,
      price: price,
    };

    saveStoreItems([...storeItems, itemWithCustomPrice]);
    closePriceModal();
  };

  const removeItemFromStore = (itemId: number) => {
    saveStoreItems(storeItems.filter((item) => item.id !== itemId));
  };

  const updateItemPrice = (itemId: number, newPrice: number) => {
    const updatedItems = storeItems.map((item) =>
      item.id === itemId ? { ...item, price: newPrice } : item
    );
    saveStoreItems(updatedItems);
  };

  const filteredAvailableItems = ALL_ITEMS.filter(
    (item) =>
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.army.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.unitType.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !hasItem(item.id) // Only show items not already in store
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
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Admin Panel - {storeInfo.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Add items from any manufacturer and set your own prices
            </p>
          </div>
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
              Available Items from All Manufacturers
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-transparent text-gray-900"
              />
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredAvailableItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchQuery
                    ? "No items match your search."
                    : "All items are already in your store!"}
                </p>
              ) : (
                filteredAvailableItems.map((item) => {
                  const manufacturer = getManufacturerById(item.manufacturerId);

                  return (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 border-gray-200 hover:border-gray-400 transition-colors"
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
                          <p className="text-xs text-blue-600 mt-1">
                            By {manufacturer?.name}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <span className="text-xs text-gray-500 block">
                                Base price:
                              </span>
                              <span className="font-semibold text-gray-900">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                            <button
                              onClick={() => openPriceModal(item)}
                              className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors"
                            >
                              <Plus size={16} />
                              Add to Store
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Current Store Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Your Store Inventory ({storeItems.length})
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {storeItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No items in your store yet. Add items from the available list.
                </p>
              ) : (
                storeItems.map((item) => {
                  const manufacturer = getManufacturerById(item.manufacturerId);
                  const baseItem = ALL_ITEMS.find((i) => i.id === item.id);

                  return (
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
                              <p className="text-xs text-blue-600 mt-1">
                                By {manufacturer?.name}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItemFromStore(item.id)}
                              className="text-gray-400 hover:text-red-600 ml-2"
                            >
                              <X size={20} />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <DollarSign size={16} className="text-gray-400" />
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.price.toFixed(2)}
                                onChange={(e) => {
                                  const newPrice = parseFloat(e.target.value);
                                  if (!isNaN(newPrice)) {
                                    updateItemPrice(item.id, newPrice);
                                  }
                                }}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            {baseItem && item.price !== baseItem.price && (
                              <span className="text-xs text-gray-500">
                                (Base: ${baseItem.price.toFixed(2)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Price Modal */}
      {showPriceModal && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closePriceModal}
          />

          {/* Modal Content */}
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative z-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Set Your Price
            </h3>

            <div className="mb-4">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <h4 className="font-semibold text-gray-900">
                {selectedItem.name}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedItem.description}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer's Base Price:{" "}
                <span className="font-semibold">
                  ${selectedItem.price.toFixed(2)}
                </span>
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Store Price:
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-semibold text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can set any price - higher or lower than the base price
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closePriceModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddItem}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Add to Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
