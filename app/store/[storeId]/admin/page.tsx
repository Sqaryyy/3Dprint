"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  X,
  Search,
  DollarSign,
  Store,
  Package,
  PackagePlus,
} from "lucide-react";
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

  // ── Bulk add state ─────────────────────────────────────────────────────────
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMarkup, setBulkMarkup] = useState("0");
  const [bulkMarkupType, setBulkMarkupType] = useState<"percent" | "fixed">(
    "percent",
  );

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

  // Cascading: armies filtered by game system
  const availableArmies = useMemo(() => {
    const pool =
      filterGameSystem === "all"
        ? allItemsPool
        : allItemsPool.filter((i) => i.gameSystem === filterGameSystem);
    return [...new Set(pool.map((i) => i.army))].sort();
  }, [allItemsPool, filterGameSystem]);

  // Cascading: unit types filtered by game system + army
  const availableUnitTypes = useMemo(() => {
    let pool = allItemsPool;
    if (filterGameSystem !== "all")
      pool = pool.filter((i) => i.gameSystem === filterGameSystem);
    if (filterArmy !== "all") pool = pool.filter((i) => i.army === filterArmy);
    return [...new Set(pool.map((i) => i.unitType))].sort();
  }, [allItemsPool, filterGameSystem, filterArmy]);

  // Cascading: manufacturers filtered by game system + army + unit type
  const availableManufacturers = useMemo(() => {
    let pool = allItemsPool;
    if (filterGameSystem !== "all")
      pool = pool.filter((i) => i.gameSystem === filterGameSystem);
    if (filterArmy !== "all") pool = pool.filter((i) => i.army === filterArmy);
    if (filterUnitType !== "all")
      pool = pool.filter(
        (i) => i.unitType.toLowerCase() === filterUnitType.toLowerCase(),
      );
    const ids = new Set(pool.map((i) => i.manufacturerId));
    return MANUFACTURERS.filter((m) => ids.has(m.id));
  }, [allItemsPool, filterGameSystem, filterArmy, filterUnitType]);

  const handleGameSystemChange = (value: string) => {
    setFilterGameSystem(value);
    setFilterArmy("all");
    setFilterUnitType("all");
    setFilterManufacturer("all");
  };

  const handleArmyChange = (value: string) => {
    setFilterArmy(value);
    setFilterUnitType("all");
    setFilterManufacturer("all");
  };

  const handleUnitTypeChange = (value: string) => {
    setFilterUnitType(value);
    setFilterManufacturer("all");
  };

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

  // ── Bulk add helpers ───────────────────────────────────────────────────────
  const computeBulkPrice = (basePrice: number): number => {
    const markup = parseFloat(bulkMarkup) || 0;
    if (bulkMarkupType === "percent") {
      return Math.max(0, basePrice * (1 + markup / 100));
    }
    return Math.max(0, basePrice + markup);
  };

  const confirmBulkAdd = () => {
    const newItems = filteredAvailableItems.map((item) => ({
      ...item,
      price: parseFloat(computeBulkPrice(item.price).toFixed(2)),
    }));
    saveStoreItems([...storeItems, ...newItems]);
    setShowBulkModal(false);
    setBulkMarkup("0");
    setBulkMarkupType("percent");
  };

  // ── Label for what's currently filtered ───────────────────────────────────
  const categoryLabel = useMemo(() => {
    const parts: string[] = [];
    if (filterGameSystem !== "all") parts.push(filterGameSystem);
    if (filterArmy !== "all") parts.push(filterArmy);
    if (filterUnitType !== "all") parts.push(filterUnitType);
    if (filterManufacturer !== "all") {
      const m = MANUFACTURERS.find(
        (m) => m.id === parseInt(filterManufacturer),
      );
      if (m) parts.push(m.name);
    }
    if (searchQuery) parts.push(`"${searchQuery}"`);
    return parts.length > 0 ? parts.join(" › ") : "all available items";
  }, [
    filterGameSystem,
    filterArmy,
    filterUnitType,
    filterManufacturer,
    searchQuery,
  ]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ── Header ── */}
        <div className="flex flex-col gap-3 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Admin — {storeInfo.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Add items from any manufacturer and set your own prices
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/store/${storeId}`}>View Store</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/store/${storeId}/admin/create-item`}>
                <Plus className="h-4 w-4 mr-1" />
                Create Item
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/">Marketplace</Link>
            </Button>
          </div>
        </div>

        {/* ── Unified filter bar ── */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 mb-6">
          <div className="relative col-span-2 sm:flex-1 sm:min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Cascading: Game System */}
          <Select
            value={filterGameSystem}
            onValueChange={handleGameSystemChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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

          {/* Cascading: Army */}
          <Select value={filterArmy} onValueChange={handleArmyChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Armies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Armies</SelectItem>
              {availableArmies.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Cascading: Unit Type */}
          <Select value={filterUnitType} onValueChange={handleUnitTypeChange}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue placeholder="All Models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              {availableUnitTypes.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Cascading: Manufacturer */}
          <Select
            value={filterManufacturer}
            onValueChange={setFilterManufacturer}
          >
            <SelectTrigger className="w-full sm:w-[190px]">
              <SelectValue placeholder="All Manufacturers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {availableManufacturers.map((m) => (
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
              className="col-span-2 sm:col-span-1 gap-1.5 text-muted-foreground w-full sm:w-auto justify-center sm:justify-start"
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>
                  Available Items
                  <span className="text-muted-foreground font-normal text-sm ml-2">
                    ({filteredAvailableItems.length})
                  </span>
                </CardTitle>
                {filteredAvailableItems.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 shrink-0"
                    onClick={() => setShowBulkModal(true)}
                  >
                    <PackagePlus className="h-4 w-4" />
                    Add All ({filteredAvailableItems.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:max-h-[600px] sm:overflow-y-auto sm:pr-2">
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
                          <div className="flex gap-2 flex-wrap shrink-0">
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
              <div className="space-y-3 sm:max-h-[600px] sm:overflow-y-auto sm:pr-2">
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
                          <div className="flex gap-2 flex-wrap shrink-0">
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

      {/* ── Single Item Price Modal ── */}
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
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={closePriceModal}>
              Cancel
            </Button>
            <Button onClick={confirmAddItem}>Add to Store</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Add Modal ── */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5" />
              Bulk Add Items
            </DialogTitle>
            <DialogDescription>
              Add <strong>{filteredAvailableItems.length}</strong> items from{" "}
              <strong>{categoryLabel}</strong> to your store at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Markup controls */}
            <div className="space-y-3">
              <Label>Price Markup (optional)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={bulkMarkup}
                    onChange={(e) => setBulkMarkup(e.target.value)}
                    className="pr-16"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {bulkMarkupType === "percent" ? "%" : "$"}
                  </span>
                </div>
                <Select
                  value={bulkMarkupType}
                  onValueChange={(v) =>
                    setBulkMarkupType(v as "percent" | "fixed")
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {bulkMarkupType === "percent"
                  ? `All items will be added at base price ${parseFloat(bulkMarkup) >= 0 ? "+" : ""}${bulkMarkup || 0}%.`
                  : `All items will be added at base price ${parseFloat(bulkMarkup) >= 0 ? "+" : ""}$${bulkMarkup || 0}.`}{" "}
                Leave at 0 to use base prices as-is.
              </p>
            </div>

            {/* Preview list */}
            <div className="space-y-2">
              <Label>
                Preview{" "}
                <span className="text-muted-foreground font-normal">
                  (showing up to 5)
                </span>
              </Label>
              <div className="rounded-lg border divide-y max-h-[220px] overflow-y-auto">
                {filteredAvailableItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.army} · {item.unitType}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-semibold">
                        ${computeBulkPrice(item.price).toFixed(2)}
                      </p>
                      {computeBulkPrice(item.price) !== item.price && (
                        <p className="text-xs text-muted-foreground">
                          was ${item.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {filteredAvailableItems.length > 5 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                    + {filteredAvailableItems.length - 5} more items
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowBulkModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBulkAdd} className="gap-1.5">
              <PackagePlus className="h-4 w-4" />
              Add {filteredAvailableItems.length} Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
