"use client";

import React, { useState, useEffect } from "react";
import { Search, Store, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStoreById, getManufacturerById, type Item } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function StorePage() {
  const params = useParams();
  const storeId = parseInt(params.storeId as string);

  const [searchQuery, setSearchQuery] = useState("");
  const [storeItems, setStoreItems] = useState<Item[]>([]);

  const store = getStoreById(storeId);

  useEffect(() => {
    const loadItems = () => {
      const storedItems = sessionStorage.getItem(`store_${storeId}_items`);
      if (storedItems) {
        setStoreItems(JSON.parse(storedItems) as Item[]);
      } else {
        setStoreItems([]);
      }
    };

    loadItems();

    const interval = setInterval(loadItems, 1000);
    return () => clearInterval(interval);
  }, [storeId]);

  if (!store) {
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

  const filteredItems = storeItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.army.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unitType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>

          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="h-12 w-12" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {store.name}
                </h1>
                <Badge variant="secondary">Since {store.since}</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-2">
                {store.description}
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href={`/store/${storeId}/admin`}>Manage Store</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search this store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <span className="text-sm font-medium text-muted-foreground">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const manufacturer = getManufacturerById(item.manufacturerId);

            return (
              <Link key={item.id} href={`/item/${item.id}`} className="group">
                <Card className="overflow-hidden h-full transition-all hover:shadow-lg">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{item.army}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.unitType}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        By {manufacturer?.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <span className="text-2xl font-bold">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <Card className="mt-12">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">
                {searchQuery ? "No items found" : "No items in store"}
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchQuery
                  ? "Try adjusting your search"
                  : "This store doesn't have any items yet. Visit the admin panel to add items."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
