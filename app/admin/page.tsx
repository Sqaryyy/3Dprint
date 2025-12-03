"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Search } from "lucide-react";
import Link from "next/link";

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

// Curated list of all available items
const CURATED_ITEMS: Item[] = [
  {
    id: 1,
    name: "Orc Warlord",
    description:
      "Highly detailed orc chieftain model with modular weapon options. Optimized for FDM and resin printing.",
    price: 8.99,
    tags: ["orc", "warlord", "tabletop", "pre-supported"],
    image:
      "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400&h=300&fit=crop",
    fileSize: "45 MB",
    downloads: 342,
    category: "Orcs and Goblins",
    format: "3D",
    type: "object",
  },
  {
    id: 2,
    name: "Ratling Skirmisher",
    description:
      "Sewer-dwelling ratfolk warrior with various weapon configurations.",
    price: 0,
    tags: ["rat", "skaven", "warrior", "free"],
    image:
      "https://images.unsplash.com/photo-1635862662213-6316d6d144d6?w=400&h=300&fit=crop",
    fileSize: "32 MB",
    downloads: 521,
    category: "Sewer Vermin",
    format: "3D",
    type: "object",
  },
  {
    id: 3,
    name: "Gallian Knight Bundle",
    description:
      "Complete set of 5 medieval knights with horses and banners. Includes painting guide PDF.",
    price: 15.99,
    tags: ["knight", "cavalry", "bundle", "medieval"],
    image:
      "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?w=400&h=300&fit=crop",
    fileSize: "120 MB",
    downloads: 687,
    category: "Gallia",
    format: "3D & PDF",
    type: "bundle",
  },
  {
    id: 4,
    name: "Dwarf Runesmith",
    description:
      "Master craftsman dwarf with forge tools and runes. High detail for showcase painting.",
    price: 6.99,
    tags: ["dwarf", "runesmith", "forge", "detailed"],
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop",
    fileSize: "38 MB",
    downloads: 423,
    category: "Dwarfs, Sons of Ymir",
    format: "3D",
    type: "object",
  },
  {
    id: 5,
    name: "Aegean Archer",
    description: "Elegant elven archer with flowing robes and detailed bow.",
    price: 0,
    tags: ["elf", "archer", "free", "graceful"],
    image:
      "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=300&fit=crop",
    fileSize: "29 MB",
    downloads: 892,
    category: "Aegean Elves",
    format: "3D",
    type: "object",
  },
  {
    id: 6,
    name: "Sunland Warrior",
    description:
      "Desert warrior with scimitar and shield. Pre-supported for easy printing.",
    price: 7.99,
    tags: ["warrior", "desert", "scimitar", "pre-supported"],
    image:
      "https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=400&h=300&fit=crop",
    fileSize: "41 MB",
    downloads: 315,
    category: "Sunland",
    format: "3D",
    type: "object",
  },
  {
    id: 7,
    name: "Vampire Count",
    description: "Undead noble with cape and staff. Perfect for gothic themes.",
    price: 9.99,
    tags: ["vampire", "undead", "gothic", "noble"],
    image:
      "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400&h=300&fit=crop",
    fileSize: "52 MB",
    downloads: 458,
    category: "Transilvanya",
    format: "3D",
    type: "object",
  },
  {
    id: 8,
    name: "Skeleton Warrior Pack",
    description:
      "Set of 10 skeleton warriors with various weapons. Great for armies.",
    price: 12.99,
    tags: ["skeleton", "undead", "pack", "army"],
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
    fileSize: "95 MB",
    downloads: 672,
    category: "Eternal Dynasties",
    format: "3D",
    type: "bundle",
  },
  {
    id: 9,
    name: "Goblin Shaman",
    description: "Cunning goblin spellcaster with staff and totems.",
    price: 0,
    tags: ["goblin", "shaman", "magic", "free"],
    image:
      "https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?w=400&h=300&fit=crop",
    fileSize: "28 MB",
    downloads: 743,
    category: "Orcs and Goblins",
    format: "3D",
    type: "object",
  },
  {
    id: 10,
    name: "Elven Mage",
    description:
      "Powerful elven spellcaster with ornate robes and spell effects.",
    price: 8.99,
    tags: ["elf", "mage", "magic", "detailed"],
    image:
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop",
    fileSize: "47 MB",
    downloads: 524,
    category: "Aegean Elves",
    format: "3D & PDF",
    type: "object",
  },
];

export default function AdminPage() {
  const [storeItems, setStoreItems] = useState<Item[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "Highlands Miniatures",
    description:
      "We're Highlands Miniatures, a couple who creates awesome 3D printable miniatures for tabletop games, come and join us!",
    since: "January 2018",
    logo: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load store items from localStorage
    const storedItems = localStorage.getItem("storeItems");
    if (storedItems) {
      setStoreItems(JSON.parse(storedItems));
    } else {
      // Initialize with default items (first 5 items from curated list)
      const defaultItems = CURATED_ITEMS.slice(0, 5);
      setStoreItems(defaultItems);
      localStorage.setItem("storeItems", JSON.stringify(defaultItems));
    }

    // Load store info from localStorage
    const storedInfo = localStorage.getItem("storeInfo");
    if (storedInfo) {
      setStoreInfo(JSON.parse(storedInfo));
    } else {
      // Initialize with default store info
      localStorage.setItem("storeInfo", JSON.stringify(storeInfo));
    }
  }, []);

  const saveStoreItems = (items: Item[]) => {
    setStoreItems(items);
    localStorage.setItem("storeItems", JSON.stringify(items));
  };

  const saveStoreInfo = () => {
    localStorage.setItem("storeInfo", JSON.stringify(storeInfo));
  };

  const isItemInStore = (itemId: number) => {
    return storeItems.some((item) => item.id === itemId);
  };

  const addItemToStore = (item: Item) => {
    if (!isItemInStore(item.id)) {
      saveStoreItems([...storeItems, item]);
    }
  };

  const removeItemFromStore = (itemId: number) => {
    saveStoreItems(storeItems.filter((item) => item.id !== itemId));
  };

  const filteredCuratedItems = CURATED_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Admin Panel</h1>
          <Link
            href="/"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            View Store
          </Link>
        </div>

        {/* Store Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Store Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Store Name
              </label>
              <input
                type="text"
                value={storeInfo.name}
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder:text-gray-400 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                3D Printing Since
              </label>
              <input
                type="text"
                value={storeInfo.since}
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, since: e.target.value })
                }
                placeholder="January 2018"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Store Description
              </label>
              <textarea
                value={storeInfo.description}
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder:text-gray-400 text-gray-900"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Store Logo URL
              </label>
              <input
                type="url"
                value={storeInfo.logo}
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, logo: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder:text-gray-400 text-gray-900"
              />
            </div>
          </div>
          <button
            onClick={saveStoreInfo}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Save Store Settings
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Curated Items - Add to Store */}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent placeholder:text-gray-400 text-gray-900"
              />
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredCuratedItems.map((item) => (
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
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.category} • {item.format}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-gray-900">
                          {item.price === 0
                            ? "Free"
                            : `$${item.price.toFixed(2)}`}
                        </span>
                        {isItemInStore(item.id) ? (
                          <span className="text-sm text-green-600 font-medium">
                            ✓ In Store
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
              ))}
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
                              {item.category} • {item.format}
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
