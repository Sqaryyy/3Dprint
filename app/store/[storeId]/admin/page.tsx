"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, X, Search, DollarSign, Store, Package } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ALL_ITEMS,
  getStoreById,
  getManufacturerById,
  getDefaultStoreItems,
  MANUFACTURERS,
  type Item,
  type StoreInfo,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// ── Safe image thumbnail ───────────────────────────────────────────────────────
function ItemThumbnail({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = React.useState(false);
  if (!src.trim() || errored) {
    return (
      <div className="w-20 h-20 shrink-0 bg-muted rounded-lg flex items-center justify-center">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="w-20 h-20 shrink-0 bg-muted rounded-lg overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

// ── Safe modal image ───────────────────────────────────────────────────────────
function ModalImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = React.useState(false);
  if (!src.trim() || errored) {
    return (
      <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
        <Package className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  );
}

export default function AdminPage() {
  const params = useParams();
  const storeId = parseInt(params.storeId as string);

  const [storeItems, setStoreItems] = useState<Item[]>([]);
  const [customItems, setCustomItems] = useState<Item[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [showPriceModal, setShowPriceModal] = useState(false);

  // ── Unified filters ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGameSystem, setFilterGameSystem] = useState("all");
  const [filterArmy, setFilterArmy] = useState("all");
  const [filterUnitType, setFilterUnitType] = useState("all");
  const [filterManufacturer, setFilterManufacturer] = useState("all");

  useEffect(() => {
    const storedItems = sessionStorage.getItem(`store_${storeId}_items`);
    if (storedItems) {
      setStoreItems(JSON.parse(storedItems));
    } else {
      const defaultItems = getDefaultStoreItems(storeId);
      setStoreItems(defaultItems);
      sessionStorage.setItem(
        `store_${storeId}_items`,
        JSON.stringify(defaultItems),
      );
    }

    const storedCustom = sessionStorage.getItem(
      `store_${storeId}_custom_items`,
    );
    if (storedCustom) setCustomItems(JSON.parse(storedCustom));

    const storedInfo = sessionStorage.getItem(`store_${storeId}_info`);
    if (storedInfo) {
      setStoreInfo(JSON.parse(storedInfo));
    } else {
      const defaultInfo = getStoreById(storeId);
      if (defaultInfo) setStoreInfo(defaultInfo);
    }
  }, [storeId]);

  const saveStoreItems = (items: Item[]) => {
    setStoreItems(items);
    sessionStorage.setItem(`store_${storeId}_items`, JSON.stringify(items));
  };

  const hasItem = (itemId: number) =>
    storeItems.some((item) => item.id === itemId);

  const openPriceModal = (item: Item) => {
    setSelectedItem(item);
    setCustomPrice(item.price.toFixed(2));
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
      alert("This item is already in your store!");
      closePriceModal();
      return;
    }
    saveStoreItems([...storeItems, { ...selectedItem, price }]);
    closePriceModal();
  };

  const removeItemFromStore = (itemId: number) => {
    saveStoreItems(storeItems.filter((item) => item.id !== itemId));
  };

  const updateItemPrice = (itemId: number, newPrice: number) => {
    saveStoreItems(
      storeItems.map((item) =>
        item.id === itemId ? { ...item, price: newPrice } : item,
      ),
    );
  };

  // ── All items that could potentially be added ──────────────────────────────
  const allAvailableItems = useMemo(
    () => [...ALL_ITEMS, ...customItems],
    [customItems],
  );

  // ── Derive filter options from the union of both panels ────────────────────
  const allItemsPool = useMemo(
    () => [...allAvailableItems, ...storeItems],
    [allAvailableItems, storeItems],
  );

  const allGameSystems = useMemo(
    () =>
      [
        ...new Set(allItemsPool.map((i) => i.gameSystem).filter(Boolean)),
      ].sort(),
    [allItemsPool],
  );
  const allArmies = useMemo(
    () => [...new Set(allItemsPool.map((i) => i.army))].sort(),
    [allItemsPool],
  );
  const allUnitTypes = useMemo(
    () => [...new Set(allItemsPool.map((i) => i.unitType))].sort(),
    [allItemsPool],
  );

  const filtersActive =
    filterGameSystem !== "all" ||
    filterArmy !== "all" ||
    filterUnitType !== "all" ||
    filterManufacturer !== "all" ||
    !!searchQuery;

  // ── Shared filter function applied to any item list ────────────────────────
  const applyFilters = (items: Item[]) =>
    items.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.army.toLowerCase().includes(q) ||
        item.unitType.toLowerCase().includes(q);

      const matchesGameSystem =
        filterGameSystem === "all" || item.gameSystem === filterGameSystem;
      const matchesArmy = filterArmy === "all" || item.army === filterArmy;
      const matchesUnitType =
        filterUnitType === "all" ||
        item.unitType.toLowerCase() === filterUnitType.toLowerCase();
      const matchesManufacturer =
        filterManufacturer === "all" ||
        item.manufacturerId === parseInt(filterManufacturer);

      return (
        matchesSearch &&
        matchesGameSystem &&
        matchesArmy &&
        matchesUnitType &&
        matchesManufacturer
      );
    });

  const filteredAvailableItems = useMemo(
    () => applyFilters(allAvailableItems.filter((item) => !hasItem(item.id))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      allAvailableItems,
      storeItems,
      searchQuery,
      filterGameSystem,
      filterArmy,
      filterUnitType,
      filterManufacturer,
    ],
  );

  const filteredStoreItems = useMemo(
    () => applyFilters(storeItems),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      storeItems,
      searchQuery,
      filterGameSystem,
      filterArmy,
      filterUnitType,
      filterManufacturer,
    ],
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
        {/* ── Header ── */}
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
            <Button variant="outline" asChild>
              <Link href={`/store/${storeId}/admin/create-item`}>
                <Plus className="h-4 w-4 mr-1" />
                Create Item
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">Marketplace</Link>
            </Button>
          </div>
        </div>

        {/* ── Unified filter bar ── */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterGameSystem} onValueChange={setFilterGameSystem}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Game Systems" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Game Systems</SelectItem>
              {allGameSystems.map((gs) => (
                <SelectItem key={gs} value={gs}>
                  {gs}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterArmy} onValueChange={setFilterArmy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Armies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Armies</SelectItem>
              {allArmies.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterUnitType} onValueChange={setFilterUnitType}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="All Models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              {allUnitTypes.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterManufacturer}
            onValueChange={setFilterManufacturer}
          >
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="All Manufacturers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {MANUFACTURERS.map((m) => (
                <SelectItem key={m.id} value={m.id.toString()}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterGameSystem("all");
                setFilterArmy("all");
                setFilterUnitType("all");
                setFilterManufacturer("all");
                setSearchQuery("");
              }}
              className="gap-1.5 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Available Items ── */}
          <Card>
            <CardHeader>
              <CardTitle>
                Available Items
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  ({filteredAvailableItems.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {filteredAvailableItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {filtersActive
                        ? "No items match your filters."
                        : "All items are already in your store!"}
                    </p>
                  </div>
                ) : (
                  filteredAvailableItems.map((item) => {
                    const manufacturer = getManufacturerById(
                      item.manufacturerId,
                    );
                    const isCustom = item.manufacturerId === 0;
                    return (
                      <Card
                        key={item.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <ItemThumbnail src={item.image} alt={item.name} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold line-clamp-1">
                                  {item.name}
                                </h3>
                                {isCustom && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs shrink-0"
                                  >
                                    Custom
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {item.gameSystem}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {item.army}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {item.unitType}
                                </span>
                              </div>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {isCustom
                                  ? "Your item"
                                  : `By ${manufacturer?.name}`}
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

          {/* ── Store Inventory ── */}
          <Card>
            <CardHeader>
              <CardTitle>
                Your Store Inventory
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  ({filteredStoreItems.length}
                  {filteredStoreItems.length !== storeItems.length
                    ? ` of ${storeItems.length}`
                    : ""}
                  )
                </span>
              </CardTitle>
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
                ) : filteredStoreItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      No inventory items match your filters.
                    </p>
                  </div>
                ) : (
                  filteredStoreItems.map((item) => {
                    const manufacturer = getManufacturerById(
                      item.manufacturerId,
                    );
                    const isCustom = item.manufacturerId === 0;
                    const baseItem = ALL_ITEMS.find((i) => i.id === item.id);
                    return (
                      <Card
                        key={item.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <ItemThumbnail src={item.image} alt={item.name} />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold line-clamp-1">
                                      {item.name}
                                    </h3>
                                    {isCustom && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs shrink-0"
                                      >
                                        Custom
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {item.gameSystem}
                                    </Badge>
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
                                    {isCustom
                                      ? "Your item"
                                      : `By ${manufacturer?.name}`}
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
                                      if (!isNaN(newPrice))
                                        updateItemPrice(item.id, newPrice);
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

      {/* ── Price Modal ── */}
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
              <ModalImage src={selectedItem.image} alt={selectedItem.name} />
              <div>
                <h4 className="font-semibold">{selectedItem.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedItem.description}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {selectedItem.manufacturerId === 0
                      ? "Your Base Price:"
                      : "Manufacturer's Base Price:"}
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
