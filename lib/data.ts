// lib/data.ts - Shared data file with improved structure

export interface Item {
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
  storeId: number;  // Which store created/sells this specific version
  link: string;
}

export interface StoreInfo {
  id: number;
  name: string;
  description: string;
  since: string;
  logo: string;
  website?: string;
}

export const STORES: StoreInfo[] = [
  {
    id: 1,
    name: "Highlands Miniatures",
    description: "High-quality fantasy miniatures for tabletop wargaming. Specializing in medieval knights and armies with exceptional detail.",
    since: "January 2018",
    logo: "",
    website: "https://www.myminifactory.com/users/HighlandMiniatures",
  },
  {
    id: 2,
    name: "Lost Kingdom Miniatures",
    description: "Premium historical and fantasy miniatures. Creating detailed models for collectors and gamers alike.",
    since: "March 2019",
    logo: "",
    website: "https://www.lostkingdomminiatures.com",
  },
  {
    id: 3,
    name: "Monstrous Encounters",
    description: "Epic fantasy miniatures and complete army sets. Bringing legendary battles to your tabletop.",
    since: "June 2020",
    logo: "",
    website: "https://www.myminifactory.com/users/MonstrousEncounters",
  },
];

// Each item is unique to a store - these are different versions from different creators
export const ALL_ITEMS: Item[] = [
  // Highlands Miniatures - Store 1
  {
    id: 1,
    name: "Knight of the realm",
    army: "Bretonnia",
    unitType: "Knight of the realm",
    description: "Elite mounted knights with ornate armor and lances. Perfect for leading your cavalry charges into battle.",
    price: 12.99,
    tags: ["bretonnia", "knight", "cavalry", "elite", "mounted", "medieval"],
    image: "https://dl2.myminifactory.com/object-assets/64da61f3468758.17214992/images/720X720-knights-of-gallia-highlands-miniatures.jpg",
    fileSize: "85 MB",
    downloads: 1247,
    format: "3D",
    type: "unit",
    storeId: 1,
    link: "https://www.myminifactory.com/object/3d-print-knights-of-gallia-highlands-miniatures-317902",
  },
  {
    id: 2,
    name: "Man at arms",
    army: "Bretonnia",
    unitType: "Man at arms",
    description: "Brave infantry soldiers forming the backbone of your army. Armed with swords and shields for close combat.",
    price: 8.99,
    tags: ["bretonnia", "infantry", "man at arms", "core", "medieval", "foot soldiers"],
    image: "https://dl2.myminifactory.com/object-assets/64da74b083b991.88128358/images/720X720-gallia-men-at-arms-highlands-miniatures.jpg",
    fileSize: "62 MB",
    downloads: 892,
    format: "3D",
    type: "unit",
    storeId: 1,
    link: "https://www.myminifactory.com/object/3d-print-gallia-men-at-arms-highlands-miniatures-317913",
  },
  {
    id: 3,
    name: "Bowmen",
    army: "Bretonnia",
    unitType: "Bowmen",
    description: "Skilled archers providing ranged support. Essential for softening enemy lines before the charge.",
    price: 8.99,
    tags: ["bretonnia", "bowmen", "ranged", "archers", "medieval", "support"],
    image: "https://dl2.myminifactory.com/object-assets/64da6d6849bba5.21279537/images/720X720-gallian-archers-highlands-miniatures.jpg",
    fileSize: "58 MB",
    downloads: 756,
    format: "3D",
    type: "unit",
    storeId: 1,
    link: "https://www.myminifactory.com/object/3d-print-gallia-archers-highlands-miniatures-317911",
  },

  // Lost Kingdom Miniatures - Store 2
  {
    id: 4,
    name: "Knight of the realm",
    army: "Bretonnia",
    unitType: "Knight of the realm",
    description: "Noble warriors on foot with spears and heavy armor. Versatile cavalry that can fight dismounted.",
    price: 10.99,
    tags: ["bretonnia", "knight", "spearmen", "heavy infantry", "pre-supported", "historical"],
    image: "https://www.lostkingdomminiatures.com/362-large_default/spearmen-on-foot.jpg",
    fileSize: "72 MB",
    downloads: 634,
    format: "3D",
    type: "unit",
    storeId: 2,
    link: "https://www.lostkingdomminiatures.com/en/kingdom-of-mercia/346-393-spearmen-on-foot.html#/26-supports-pre_supported",
  },
  {
    id: 5,
    name: "Man at arms",
    army: "Bretonnia",
    unitType: "Man at arms",
    description: "Reliable spear-wielding infantry forming defensive lines. Pre-supported files included for easy printing.",
    price: 7.99,
    tags: ["bretonnia", "man at arms", "spearmen", "infantry", "pre-supported", "defensive"],
    image: "https://www.lostkingdomminiatures.com/362-large_default/spearmen-on-foot.jpg",
    fileSize: "68 MB",
    downloads: 523,
    format: "3D",
    type: "unit",
    storeId: 2,
    link: "https://www.lostkingdomminiatures.com/en/kingdom-of-mercia/346-393-spearmen-on-foot.html#/26-supports-pre_supported",
  },
  {
    id: 6,
    name: "Bowmen",
    army: "Bretonnia",
    unitType: "Bowmen",
    description: "Expert longbowmen raining arrows on the enemy. Detailed models with dynamic poses.",
    price: 7.99,
    tags: ["bretonnia", "bowmen", "archers", "ranged", "pre-supported", "longbow"],
    image: "https://www.lostkingdomminiatures.com/360-large_default/bowmen-on-foot.jpg",
    fileSize: "64 MB",
    downloads: 489,
    format: "3D",
    type: "unit",
    storeId: 2,
    link: "https://www.lostkingdomminiatures.com/en/kingdom-of-mercia/337-375-bowmen-on-foot.html#/26-supports-pre_supported",
  },

  // Monstrous Encounters - Store 3
  {
    id: 7,
    name: "Knight of the realm",
    army: "Bretonnia",
    unitType: "Knight of the realm",
    description: "Heroic knights blessed with divine virtue. Highly detailed models with ornate heraldry and weapons.",
    price: 14.99,
    tags: ["bretonnia", "knight", "cavalry", "hero", "elite", "virtue", "blessed"],
    image: "https://dl2.myminifactory.com/object-assets/60d0962870d3d/images/720X720-Breon%20Knights%20of%20Virtue%201.png",
    fileSize: "95 MB",
    downloads: 1456,
    format: "3D",
    type: "unit",
    storeId: 3,
    link: "https://www.myminifactory.com/object/3d-print-breton-knights-of-virtue-174834",
  },
  {
    id: 8,
    name: "Man at arms",
    army: "Bretonnia",
    unitType: "Man at arms",
    description: "Complete unit of peasant soldiers. Includes multiple pose variations for dynamic formations.",
    price: 9.99,
    tags: ["bretonnia", "man at arms", "infantry", "unit", "peasants", "formation"],
    image: "https://dl2.myminifactory.com/object-assets/5fa953b48d78c/images/720X720-Breton%20Men%20At%20Arms%201.png",
    fileSize: "78 MB",
    downloads: 821,
    format: "3D",
    type: "unit",
    storeId: 3,
    link: "https://www.myminifactory.com/object/3d-print-breton-men-at-arms-unit-141217",
  },
  {
    id: 9,
    name: "Bowmen",
    army: "Bretonnia",
    unitType: "Bowmen",
    description: "Young squires serving as archers. Versatile unit suitable for ranged support or light infantry.",
    price: 9.99,
    tags: ["bretonnia", "bowmen", "squires", "ranged", "youth", "support"],
    image: "https://dl2.myminifactory.com/object-assets/5ffb6d2367566/images/720X720-bret-squires-c-1.jpg",
    fileSize: "71 MB",
    downloads: 672,
    format: "3D",
    type: "unit",
    storeId: 3,
    link: "https://www.myminifactory.com/object/3d-print-breton-squires-unit-149195",
  },
];

// Helper function to get items by store
export function getItemsByStore(storeId: number): Item[] {
  return ALL_ITEMS.filter(item => item.storeId === storeId);
}

// Helper function to get items NOT in a specific store (for admin panel)
export function getItemsNotInStore(storeId: number): Item[] {
  return ALL_ITEMS.filter(item => item.storeId !== storeId);
}

// Helper function to get store by id
export function getStoreById(storeId: number): StoreInfo | undefined {
  return STORES.find(store => store.id === storeId);
}

// Helper function to get item by id
export function getItemById(itemId: number): Item | undefined {
  return ALL_ITEMS.find(item => item.id === itemId);
}

// Helper function to search items
export function searchItems(query: string): Item[] {
  const lowerQuery = query.toLowerCase();
  return ALL_ITEMS.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery) ||
    item.army.toLowerCase().includes(lowerQuery) ||
    item.unitType.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Helper function to search items by unit type (to find similar units across stores)
export function getItemsByUnitType(unitType: string): Item[] {
  return ALL_ITEMS.filter(item => 
    item.unitType.toLowerCase() === unitType.toLowerCase()
  );
}