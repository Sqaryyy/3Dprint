"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Store, ShoppingCart, ArrowLeft, ChevronRight } from "lucide-react";
import {
  getItemById,
  getManufacturerById,
  STORES,
  getStoreById,
  type Item,
  type ManufacturerInfo,
  type StoreInfo,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function ItemPage() {
  const params = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState<Item | null>(null);
  const [manufacturer, setManufacturer] = useState<ManufacturerInfo | null>(
    null,
  );
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);
  const [currentStoreId, setCurrentStoreId] = useState<number | null>(null);
  const [currentStore, setCurrentStore] = useState<StoreInfo | null>(null);

  useEffect(() => {
    const itemId = parseInt(params.id as string);

    const foundItem = getItemById(itemId);
    if (foundItem) {
      setItem(foundItem);

      const foundManufacturer = getManufacturerById(foundItem.manufacturerId);
      setManufacturer(foundManufacturer || null);

      // Find which store this item belongs to
      let itemStoreId: number | null = null;
      for (const store of STORES) {
        const storedItems = sessionStorage.getItem(`store_${store.id}_items`);
        if (storedItems) {
          const storeItems = JSON.parse(storedItems);
          if (storeItems.some((i: Item) => i.id === itemId)) {
            itemStoreId = store.id;
            break;
          }
        }
      }
      setCurrentStoreId(itemStoreId);
      if (itemStoreId) {
        setCurrentStore(getStoreById(itemStoreId) || null);
      }

      // Build related items
      const related: Item[] = [];
      const maxItems = 3;

      if (itemStoreId !== null) {
        const storedItems = sessionStorage.getItem(
          `store_${itemStoreId}_items`,
        );
        if (storedItems) {
          const storeItems: Item[] = JSON.parse(storedItems);

          const sameStoreManufacturer = storeItems.filter(
            (i) =>
              i.id !== itemId && i.manufacturerId === foundItem.manufacturerId,
          );
          related.push(...sameStoreManufacturer);

          if (related.length < maxItems) {
            const sameStoreOnly = storeItems.filter(
              (i) =>
                i.id !== itemId &&
                i.manufacturerId !== foundItem.manufacturerId,
            );
            related.push(...sameStoreOnly.slice(0, maxItems - related.length));
          }
        }
      }

      if (related.length < maxItems && foundManufacturer) {
        for (const store of STORES) {
          if (store.id === itemStoreId) continue;
          const storedItems = sessionStorage.getItem(`store_${store.id}_items`);
          if (storedItems) {
            const storeItems: Item[] = JSON.parse(storedItems);
            const matchingItems = storeItems.filter(
              (i) =>
                i.id !== itemId && i.manufacturerId === foundManufacturer.id,
            );
            related.push(...matchingItems);
          }
        }
      }

      if (related.length < maxItems) {
        for (const store of STORES) {
          const storedItems = sessionStorage.getItem(`store_${store.id}_items`);
          if (storedItems) {
            const storeItems: Item[] = JSON.parse(storedItems);
            const otherItems = storeItems.filter(
              (i) => i.id !== itemId && !related.some((r) => r.id === i.id),
            );
            related.push(...otherItems);
          }
        }
      }

      setRelatedItems(related.slice(0, maxItems));
    }
  }, [params.id]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  if (!item || !manufacturer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12 lg:items-stretch">
          {/* Left Column - Image */}
          <div className="lg:col-span-7 flex flex-col">
            <Card className="overflow-hidden flex-1">
              <div className="w-full h-full bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Single merged card */}
          <div className="lg:col-span-5 flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardContent className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto">
                {/* Title & description */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{item.army}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.unitType}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight mb-2">
                    {item.name}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Separator />

                {/* Product details */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Product Details
                  </p>
                  {[
                    { label: "Army", value: item.army },
                    { label: "Unit Type", value: item.unitType },
                    { label: "Manufacturer", value: manufacturer.name },
                    { label: "Material", value: "Resin / PLA" },
                    { label: "Scale", value: "28mm" },
                    { label: "Type", value: item.type },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label}>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-muted-foreground">
                          {label}
                        </span>
                        <span className="text-xs font-semibold capitalize">
                          {value}
                        </span>
                      </div>
                      {i < arr.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Sold by */}
                {currentStore && (
                  <div
                    className="flex items-center justify-between cursor-pointer rounded-lg bg-muted/50 hover:bg-muted transition-colors px-3 py-2.5"
                    onClick={() => router.push(`/store/${currentStoreId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center shrink-0">
                        {currentStore.logo ? (
                          <img
                            src={currentStore.logo}
                            alt={currentStore.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <Store className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sold by</p>
                        <p className="text-sm font-semibold">
                          {currentStore.name}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                )}

                {/* Spacer to push price + actions to bottom */}
                <div className="flex-1" />

                {/* Price */}
                <div className="bg-muted rounded-lg px-3 py-2.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">USD</span>
                  </div>
                </div>

                {/* Quantity + Add to Cart */}
                <div>
                  <label className="block text-xs font-semibold mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      className="h-9 w-9"
                    >
                      −
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-20 text-center font-semibold h-9"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      className="h-9 w-9"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Button className="w-full gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart — ${(item.price * quantity).toFixed(2)}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                {currentStoreId
                  ? "Similar items you might like"
                  : `More from ${manufacturer?.name}`}
              </h2>
              <p className="text-muted-foreground">
                Discover other miniatures you might like
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.map((relatedItem) => (
                <Card
                  key={relatedItem.id}
                  onClick={() => router.push(`/item/${relatedItem.id}`)}
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
                >
                  <div className="aspect-square w-full overflow-hidden bg-muted">
                    <img
                      src={relatedItem.image}
                      alt={relatedItem.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1 mb-2">
                        {relatedItem.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {relatedItem.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold">
                        ${relatedItem.price.toFixed(2)}
                      </span>
                      <Badge variant="secondary">{relatedItem.unitType}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
