"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  ImagePlus,
  Tag,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStoreById, MANUFACTURERS, type Item } from "@/lib/data";

const GAME_SYSTEM_OPTIONS = [
  "Warhammer Old World",
  "Warhammer 40k",
  "Flames of War",
  "Warcry",
  "Other",
];

const ARMY_OPTIONS = [
  "Bretonnia",
  "Empire",
  "Chaos",
  "Undead",
  "Elves",
  "Dwarfs",
  "Orcs & Goblins",
  "Other",
];

const UNIT_TYPE_OPTIONS = [
  "Knight of the realm",
  "Man at arms",
  "Bowmen",
  "Hero",
  "Monster",
  "War Machine",
  "Character",
  "Scenery",
  "Other",
];

const FORMAT_OPTIONS = ["3D", "2D", "Bundle"];
const TYPE_OPTIONS = ["unit", "hero", "scenery", "bundle", "accessory"];

interface FormData {
  name: string;
  gameSystem: string;
  customGameSystem: string;
  army: string;
  customArmy: string;
  unitType: string;
  customUnitType: string;
  manufacturerId: string; // "0" = store original, or a MANUFACTURERS id as string, or "other"
  customManufacturer: string;
  description: string;
  price: string;
  image: string;
  format: string;
  type: string;
  tags: string[];
}

export default function CreateItemPage() {
  const params = useParams();
  const storeId = parseInt(params.storeId as string);
  const storeInfo = getStoreById(storeId);

  const [form, setForm] = useState<FormData>({
    name: "",
    gameSystem: "",
    customGameSystem: "",
    army: "",
    customArmy: "",
    unitType: "",
    customUnitType: "",
    manufacturerId: "0",
    customManufacturer: "",
    description: "",
    price: "",
    image: "",
    format: "3D",
    type: "unit",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const effectiveGameSystem =
    form.gameSystem === "Other" ? form.customGameSystem : form.gameSystem;
  const effectiveArmy = form.army === "Other" ? form.customArmy : form.army;
  const effectiveUnitType =
    form.unitType === "Other" ? form.customUnitType : form.unitType;

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.name.trim()) newErrors.name = "Item name is required.";
    if (!effectiveGameSystem.trim())
      newErrors.gameSystem = "Game system is required.";
    if (!effectiveArmy.trim()) newErrors.army = "Army is required.";
    if (!effectiveUnitType.trim())
      newErrors.unitType = "Unit type is required.";
    if (!form.description.trim())
      newErrors.description = "Description is required.";

    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price < 0)
      newErrors.price = "Please enter a valid price.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const isOtherManufacturer = form.manufacturerId === "other";
    const effectiveManufacturerId = isOtherManufacturer
      ? 0
      : parseInt(form.manufacturerId);
    const customManufacturerName = isOtherManufacturer
      ? form.customManufacturer.trim()
      : "";

    const baseTags = form.tags.length
      ? form.tags
      : [
          effectiveGameSystem.toLowerCase(),
          effectiveArmy.toLowerCase(),
          effectiveUnitType.toLowerCase(),
        ];

    const newItem: Item = {
      id: Date.now(),
      name: form.name.trim(),
      gameSystem: effectiveGameSystem.trim(),
      army: effectiveArmy.trim(),
      unitType: effectiveUnitType.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      tags: baseTags,
      image: form.image.trim(),
      format: form.format,
      type: form.type,
      manufacturerId: effectiveManufacturerId,
    };

    // Add to store inventory
    const storageKey = `store_${storeId}_items`;
    const existingRaw = sessionStorage.getItem(storageKey);
    const existingItems: Item[] = existingRaw ? JSON.parse(existingRaw) : [];
    sessionStorage.setItem(
      storageKey,
      JSON.stringify([...existingItems, newItem]),
    );

    // Track custom items separately so they reappear in admin after removal
    const customKey = `store_${storeId}_custom_items`;
    const existingCustomRaw = sessionStorage.getItem(customKey);
    const existingCustom: Item[] = existingCustomRaw
      ? JSON.parse(existingCustomRaw)
      : [];
    sessionStorage.setItem(
      customKey,
      JSON.stringify([...existingCustom, newItem]),
    );

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({
      name: "",
      gameSystem: "",
      customGameSystem: "",
      army: "",
      customArmy: "",
      unitType: "",
      customUnitType: "",
      manufacturerId: "0",
      customManufacturer: "",
      description: "",
      price: "",
      image: "",
      format: "3D",
      type: "unit",
      tags: [],
    });
    setErrors({});
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Item Created!</h2>
              <p className="text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{form.name}</span>{" "}
                has been added to your store inventory.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center mt-2">
              <Button asChild variant="outline">
                <Link href={`/store/${storeId}/admin`}>Back to Admin</Link>
              </Button>
              <Button asChild>
                <Link href={`/store/${storeId}`}>View Store</Link>
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Create another item
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" asChild className="gap-1 -ml-2">
                <Link href={`/store/${storeId}/admin`}>
                  <ArrowLeft className="h-4 w-4" />
                  Admin Panel
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" />
              Create New Item
            </h1>
            <p className="text-muted-foreground mt-1">
              Add a custom item to{" "}
              <span className="font-medium text-foreground">
                {storeInfo?.name ?? `Store #${storeId}`}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" asChild>
              <Link href={`/store/${storeId}`}>View Store</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Marketplace</Link>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left column ───────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Item Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name">
                      Item Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Grail Knight Commander"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>

                  {/* Game System */}
                  <div className="space-y-1.5">
                    <Label>
                      Game System <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.gameSystem}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, gameSystem: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select game system…" />
                      </SelectTrigger>
                      <SelectContent>
                        {GAME_SYSTEM_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.gameSystem === "Other" && (
                      <Input
                        placeholder="Enter game system name…"
                        value={form.customGameSystem}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            customGameSystem: e.target.value,
                          }))
                        }
                        className="mt-2"
                      />
                    )}
                    {errors.gameSystem && (
                      <p className="text-xs text-destructive">
                        {errors.gameSystem}
                      </p>
                    )}
                  </div>

                  {/* Army + Unit Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>
                        Army <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.army}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, army: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select army…" />
                        </SelectTrigger>
                        <SelectContent>
                          {ARMY_OPTIONS.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.army === "Other" && (
                        <Input
                          placeholder="Enter army name…"
                          value={form.customArmy}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              customArmy: e.target.value,
                            }))
                          }
                          className="mt-2"
                        />
                      )}
                      {errors.army && (
                        <p className="text-xs text-destructive">
                          {errors.army}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Unit Type <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.unitType}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, unitType: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit type…" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_TYPE_OPTIONS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.unitType === "Other" && (
                        <Input
                          placeholder="Enter unit type…"
                          value={form.customUnitType}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              customUnitType: e.target.value,
                            }))
                          }
                          className="mt-2"
                        />
                      )}
                      {errors.unitType && (
                        <p className="text-xs text-destructive">
                          {errors.unitType}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Manufacturer */}
                  <div className="space-y-1.5">
                    <Label>Manufacturer</Label>
                    <Select
                      value={form.manufacturerId}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, manufacturerId: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select manufacturer…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">
                          Store Original (no manufacturer)
                        </SelectItem>
                        {MANUFACTURERS.map((m) => (
                          <SelectItem key={m.id} value={m.id.toString()}>
                            {m.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.manufacturerId === "other" && (
                      <Input
                        placeholder="Enter manufacturer name…"
                        value={form.customManufacturer}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            customManufacturer: e.target.value,
                          }))
                        }
                        className="mt-2"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Select if this item is based on an existing manufacturer's
                      design.
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the item, its features, and what makes it special…"
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                      rows={4}
                      className="resize-none"
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Format & Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    Format &amp; Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Format</Label>
                    <Select
                      value={form.format}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, format: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMAT_OPTIONS.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Tag className="h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag and press Enter…"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addTag}
                      className="gap-1 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  {form.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {form.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1 pr-1 text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Tags help buyers find your item. Leave empty to
                      auto-generate from game system, army &amp; unit type.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Right column ──────────────────────────────────────────────── */}
            <div className="space-y-6">
              {/* Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ImagePlus className="h-4 w-4" />
                    Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="w-full aspect-square rounded-lg bg-muted overflow-hidden flex items-center justify-center border border-dashed border-border">
                    {form.image.trim() && !imagePreviewError ? (
                      <img
                        src={form.image.trim()}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreviewError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImagePlus className="h-10 w-10" />
                        <span className="text-xs text-center px-4">
                          {form.image.trim() && imagePreviewError
                            ? "Could not load image"
                            : "Paste an image URL below to preview"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={form.image}
                      onChange={(e) => {
                        setImagePreviewError(false);
                        setForm((p) => ({ ...p, image: e.target.value }));
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste a direct image URL. Optional — you can add one
                      later.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Price */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <Label htmlFor="price">
                    Store Price (USD){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, price: e.target.value }))
                      }
                      className="pl-7 font-semibold text-lg"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-xs text-destructive">{errors.price}</p>
                  )}
                </CardContent>
              </Card>

              {/* Live Preview */}
              {form.name && (
                <Card className="border-primary/40 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                      Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <div className="w-16 h-16 shrink-0 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        {form.image.trim() && !imagePreviewError ? (
                          <img
                            src={form.image.trim()}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold line-clamp-1">
                          {form.name}
                        </p>
                        {form.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {form.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {effectiveGameSystem && (
                            <Badge variant="outline" className="text-xs">
                              {effectiveGameSystem}
                            </Badge>
                          )}
                          {effectiveArmy && (
                            <Badge variant="secondary" className="text-xs">
                              {effectiveArmy}
                            </Badge>
                          )}
                          {effectiveUnitType && (
                            <span className="text-xs text-muted-foreground">
                              {effectiveUnitType}
                            </span>
                          )}
                        </div>
                        {form.price && !isNaN(parseFloat(form.price)) && (
                          <p className="font-bold mt-1">
                            ${parseFloat(form.price).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit */}
              <Button type="submit" className="w-full gap-2" size="lg">
                <Sparkles className="h-4 w-4" />
                Create Item &amp; Add to Store
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
