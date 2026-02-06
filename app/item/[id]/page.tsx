"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Store, ShoppingCart, ArrowLeft, ExternalLink } from "lucide-react";
import {
  getItemById,
  getManufacturerById,
  getItemsByManufacturer,
  STORES,
  type Item,
  type ManufacturerInfo,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  useEffect(() => {
    const itemId = parseInt(params.id as string);

    // Get the item
    const foundItem = getItemById(itemId);
    if (foundItem) {
      setItem(foundItem);

      // Get the manufacturer
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

      // Build related items with priority:
      // 1. Same store + same manufacturer
      // 2. Same store (any manufacturer)
      // 3. Same manufacturer from different stores
      // 4. Any item from any store
      const related: Item[] = [];
      const maxItems = 3;

      if (itemStoreId !== null) {
        // Get all items from the same store
        const storedItems = sessionStorage.getItem(
          `store_${itemStoreId}_items`,
        );
        if (storedItems) {
          const storeItems: Item[] = JSON.parse(storedItems);

          // Priority 1: Same store + same manufacturer
          const sameStoreManufacturer = storeItems.filter(
            (i) =>
              i.id !== itemId && i.manufacturerId === foundItem.manufacturerId,
          );
          related.push(...sameStoreManufacturer);

          // Priority 2: Same store (any manufacturer)
          if (related.length < maxItems) {
            const sameStoreOnly = storeItems.filter(
              (i) =>
                i.id !== itemId &&
                i.manufacturerId !== foundItem.manufacturerId,
            );
            const needed = maxItems - related.length;
            related.push(...sameStoreOnly.slice(0, needed));
          }
        }
      }

      // Priority 3: Same manufacturer from different stores
      if (related.length < maxItems && foundManufacturer) {
        const sameManufacturerDifferentStore: Item[] = [];

        for (const store of STORES) {
          if (store.id === itemStoreId) continue; // Skip current store

          const storedItems = sessionStorage.getItem(`store_${store.id}_items`);
          if (storedItems) {
            const storeItems: Item[] = JSON.parse(storedItems);
            const matchingItems = storeItems.filter(
              (i) =>
                i.id !== itemId && i.manufacturerId === foundManufacturer.id,
            );
            sameManufacturerDifferentStore.push(...matchingItems);
          }
        }

        const needed = maxItems - related.length;
        related.push(...sameManufacturerDifferentStore.slice(0, needed));
      }

      // Priority 4: Any item from any store
      if (related.length < maxItems) {
        const anyItems: Item[] = [];

        for (const store of STORES) {
          const storedItems = sessionStorage.getItem(`store_${store.id}_items`);
          if (storedItems) {
            const storeItems: Item[] = JSON.parse(storedItems);
            const otherItems = storeItems.filter(
              (i) => i.id !== itemId && !related.some((r) => r.id === i.id),
            );
            anyItems.push(...otherItems);
          }
        }

        const needed = maxItems - related.length;
        related.push(...anyItems.slice(0, needed));
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">
          {/* Left Column - Image */}
          <div className="lg:col-span-7">
            <Card className="overflow-hidden">
              <div className="aspect-square w-full bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-5 space-y-4">
            {/* Product Info */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
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
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Price */}
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">USD</span>
                  </div>
                </div>

                {/* Quantity Selector */}
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

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button className="w-full gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button variant="secondary" className="w-full gap-2" asChild>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on {manufacturer.name}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manufacturer Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Made by
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                    {manufacturer.logo ? (
                      <img
                        src={manufacturer.logo}
                        alt={manufacturer.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Store className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{manufacturer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Since {manufacturer.since}
                    </p>
                  </div>
                </div>
                {manufacturer.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={manufacturer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-muted-foreground">Army</span>
                    <span className="text-xs font-semibold">{item.army}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-muted-foreground">
                      Unit Type
                    </span>
                    <span className="text-xs font-semibold">
                      {item.unitType}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-muted-foreground">
                      File Size
                    </span>
                    <span className="text-xs font-semibold">
                      {item.fileSize}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-muted-foreground">
                      Format
                    </span>
                    <span className="text-xs font-semibold">{item.format}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-xs text-muted-foreground">
                      Downloads
                    </span>
                    <span className="text-xs font-semibold">
                      {item.downloads.toLocaleString()}
                    </span>
                  </div>
                </div>
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
                  ? "More from this store"
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
