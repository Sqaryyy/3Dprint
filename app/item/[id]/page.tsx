"use client";

import React, { useState, useEffect } from "react";
import { Download, Store, ChevronRight, ShoppingCart } from "lucide-react";

// Mock data types
interface Item {
  id: number;
  name: string;
  army: string;
  unitType: string;
  description: string;
  price: number;
  tags: string[];
  image: string;
  fileSize: string;
  downloads: number;
  format: string;
  type: string;
  storeId: number;
  link: string;
}

interface StoreInfo {
  id: number;
  name: string;
  description: string;
  since: string;
  logo: string;
  website?: string;
}

// Mock data
const mockItem: Item = {
  id: 2,
  name: "Man at arms",
  army: "Bretonnia",
  unitType: "Man at arms",
  description:
    "Brave infantry soldiers forming the backbone of your army. Armed with swords and shields for close combat.",
  price: 8.99,
  tags: [
    "bretonnia",
    "infantry",
    "man at arms",
    "core",
    "medieval",
    "foot soldiers",
  ],
  image:
    "https://dl2.myminifactory.com/object-assets/64da74b083b991.88128358/images/720X720-gallia-men-at-arms-highlands-miniatures.jpg",
  fileSize: "62 MB",
  downloads: 892,
  format: "3D",
  type: "unit",
  storeId: 1,
  link: "https://www.myminifactory.com/object/3d-print-gallia-men-at-arms-highlands-miniatures-317913",
};

const mockStore: StoreInfo = {
  id: 1,
  name: "Highlands Miniatures",
  description: "High-quality fantasy miniatures for tabletop wargaming.",
  since: "January 2018",
  logo: "",
  website: "https://www.myminifactory.com/users/HighlandMiniatures",
};

const mockRelatedItems: Item[] = [
  {
    id: 1,
    name: "Knight of the realm",
    army: "Bretonnia",
    unitType: "Knight of the realm",
    description: "Elite mounted knights with ornate armor and lances.",
    price: 12.99,
    tags: ["bretonnia", "knight", "cavalry"],
    image:
      "https://dl2.myminifactory.com/object-assets/64da61f3468758.17214992/images/720X720-knights-of-gallia-highlands-miniatures.jpg",
    fileSize: "85 MB",
    downloads: 1247,
    format: "3D",
    type: "unit",
    storeId: 1,
    link: "",
  },
  {
    id: 3,
    name: "Bowmen",
    army: "Bretonnia",
    unitType: "Bowmen",
    description: "Skilled archers providing ranged support.",
    price: 8.99,
    tags: ["bretonnia", "bowmen", "ranged"],
    image:
      "https://dl2.myminifactory.com/object-assets/64da6d6849bba5.21279537/images/720X720-gallian-archers-highlands-miniatures.jpg",
    fileSize: "58 MB",
    downloads: 756,
    format: "3D",
    type: "unit",
    storeId: 1,
    link: "",
  },
];

export default function ItemPage() {
  const [quantity, setQuantity] = useState(1);
  const item = mockItem;
  const store = mockStore;
  const relatedItems = mockRelatedItems;

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
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

                <button className="w-full bg-gray-900 text-white py-3.5 rounded-lg hover:bg-gray-800 transition-colors font-semibold text-base shadow-sm">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Store Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Sold by
              </h3>
              <button
                onClick={() => (window.location.href = `/store/${store.id}`)}
                className="flex items-center gap-4 w-full hover:bg-gray-50 p-3 -m-3 rounded-lg transition-colors group"
              >
                <div className="w-14 h-14 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                  {store.logo ? (
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Store size={28} className="text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 text-base mb-0.5">
                    {store.name}
                  </p>
                  <p className="text-sm text-gray-500">Since {store.since}</p>
                </div>
                <ChevronRight
                  size={20}
                  className="text-gray-400 group-hover:text-gray-600 transition-colors"
                />
              </button>
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
                    Material
                  </span>
                  <span className="text-sm text-gray-900 font-semibold">
                    High-Quality Resin
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 font-medium">
                    Scale
                  </span>
                  <span className="text-sm text-gray-900 font-semibold">
                    28mm
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 font-medium">
                    Assembly
                  </span>
                  <span className="text-sm text-gray-900 font-semibold">
                    Required
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
                More from {store.name}
              </h2>
              <p className="text-gray-600">
                Discover other miniatures from this creator
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.map((relatedItem) => (
                <button
                  key={relatedItem.id}
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
