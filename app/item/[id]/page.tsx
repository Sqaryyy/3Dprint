"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Store, ChevronRight, ShoppingCart } from "lucide-react";
import {
  getItemById,
  getManufacturerById,
  getItemsByManufacturer,
  type Item,
  type ManufacturerInfo,
} from "@/lib/data";

export default function ItemPage() {
  const params = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState<Item | null>(null);
  const [manufacturer, setManufacturer] = useState<ManufacturerInfo | null>(
    null
  );
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);

  useEffect(() => {
    const itemId = parseInt(params.id as string);

    // Get the item
    const foundItem = getItemById(itemId);
    if (foundItem) {
      setItem(foundItem);

      // Get the manufacturer
      const foundManufacturer = getManufacturerById(foundItem.manufacturerId);
      setManufacturer(foundManufacturer || null);

      // Get related items from the same manufacturer
      if (foundManufacturer) {
        const related = getItemsByManufacturer(foundManufacturer.id)
          .filter((i) => i.id !== itemId)
          .slice(0, 3);
        setRelatedItems(related);
      }
    }
  }, [params.id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  if (!item || !manufacturer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">
          {/* Left Column - Image */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm sticky top-24">
              <div className="aspect-square w-full">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {item.name}
              </h1>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">USD</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center text-gray-700 font-semibold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-24 text-center border-2 border-gray-300 rounded-lg py-3 text-gray-900 font-semibold text-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center text-gray-700 font-semibold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base flex items-center justify-center gap-2 shadow-sm">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gray-900 text-white py-3.5 rounded-lg hover:bg-gray-800 transition-colors font-semibold text-base shadow-sm block text-center"
                >
                  View on {manufacturer.name}
                </a>
              </div>
            </div>

            {/* Manufacturer Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Made by
              </h3>
              <div className="flex items-center gap-4 w-full">
                <div className="w-14 h-14 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                  {manufacturer.logo ? (
                    <img
                      src={manufacturer.logo}
                      alt={manufacturer.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Store size={28} className="text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 text-base mb-0.5">
                    {manufacturer.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Since {manufacturer.since}
                  </p>
                </div>
              </div>
              {manufacturer.website && (
                <a
                  href={manufacturer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm block text-center"
                >
                  Visit Website
                </a>
              )}
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Product Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 font-medium">
                    Army
                  </span>
                  <span className="text-sm text-gray-900 font-semibold">
                    {item.army}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 font-medium">
                    Unit Type
                  </span>
                  <span className="text-sm text-gray-900 font-semibold">
                    {item.unitType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 font-medium">
                    File Size
                  </span>
                  <span className="text-sm text-gray-900 font-semibold">
                    {item.fileSize}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 font-medium">
                    Format
                  </span>
                  <span className="text-sm text-gray-900 font-semibold">
                    {item.format}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 font-medium">
                    Downloads
                  </span>
                  <span className="text-sm text-gray-900 font-semibold">
                    {item.downloads.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                More from {manufacturer.name}
              </h2>
              <p className="text-gray-600">
                Discover other miniatures from this creator
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.map((relatedItem) => (
                <button
                  key={relatedItem.id}
                  onClick={() => router.push(`/item/${relatedItem.id}`)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-left group"
                >
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    <img
                      src={relatedItem.image}
                      alt={relatedItem.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 text-lg">
                      {relatedItem.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {relatedItem.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        ${relatedItem.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {relatedItem.unitType}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
