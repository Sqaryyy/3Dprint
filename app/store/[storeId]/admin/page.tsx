"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Search, DollarSign, Store, ExternalLink } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
        JSON.stringify(defaultItems),
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
      item.id === itemId ? { ...item, price: newPrice } : item,
    );
    saveStoreItems(updatedItems);
  };

  const filteredAvailableItems = ALL_ITEMS.filter(
    (item) =>
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.army.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.unitType.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !hasItem(item.id), // Only show items not already in store
  );

  if (!storeInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Store not found</h1>
            <Button asChild variant="link">
              <Link href="/">Back to Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Panel - {storeInfo.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Add items from any manufacturer and set your own prices
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" asChild>
              <Link href={`/store/${storeId}`}>View Store</Link>
            </Button>
            <Button asChild>
              <Link href="/">Marketplace</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Items - Add to Store */}
          <Card>
            <CardHeader>
              <CardTitle>Available Items from All Manufacturers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search available items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredAvailableItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "No items match your search."
                        : "All items are already in your store!"}
                    </p>
                  </div>
                ) : (
                  filteredAvailableItems.map((item) => {
                    const manufacturer = getManufacturerById(
                      item.manufacturerId,
                    );

                    return (
                      <Card
                        key={item.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="w-20 h-20 shrink-0 bg-muted rounded-lg overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold line-clamp-1">
                                {item.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {item.army}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {item.unitType}
                                </span>
                              </div>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                By {manufacturer?.name}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div>
                                  <span className="text-xs text-muted-foreground block">
                                    Base price:
                                  </span>
                                  <span className="font-semibold">
                                    ${item.price.toFixed(2)}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => openPriceModal(item)}
                                  className="gap-1"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Store Items */}
          <Card>
            <CardHeader>
              <CardTitle>Your Store Inventory ({storeItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {storeItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Store className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No items in your store yet. Add items from the available
                      list.
                    </p>
                  </div>
                ) : (
                  storeItems.map((item) => {
                    const manufacturer = getManufacturerById(
                      item.manufacturerId,
                    );
                    const baseItem = ALL_ITEMS.find((i) => i.id === item.id);

                    return (
                      <Card
                        key={item.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="w-20 h-20 shrink-0 bg-muted rounded-lg overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold line-clamp-1">
                                    {item.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {item.army}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {item.unitType}
                                    </span>
                                  </div>
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    By {manufacturer?.name}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItemFromStore(item.id)}
                                  className="text-muted-foreground hover:text-destructive shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="mt-2 flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.price.toFixed(2)}
                                    onChange={(e) => {
                                      const newPrice = parseFloat(
                                        e.target.value,
                                      );
                                      if (!isNaN(newPrice)) {
                                        updateItemPrice(item.id, newPrice);
                                      }
                                    }}
                                    className="w-24 h-8 text-sm font-semibold"
                                  />
                                </div>
                                {baseItem && item.price !== baseItem.price && (
                                  <span className="text-xs text-muted-foreground">
                                    (Base: ${baseItem.price.toFixed(2)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Price Modal */}
      <Dialog open={showPriceModal} onOpenChange={setShowPriceModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Price</DialogTitle>
            <DialogDescription>
              Choose a price for this item in your store
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold">{selectedItem.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedItem.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Manufacturer's Base Price:
                  </span>
                  <span className="font-semibold">
                    ${selectedItem.price.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-price">Your Store Price:</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="custom-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="pl-10 font-semibold text-lg"
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can set any price - higher or lower than the base price
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closePriceModal}>
              Cancel
            </Button>
            <Button onClick={confirmAddItem}>Add to Store</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
