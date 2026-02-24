// lib/data.ts - Marketplace with Stores and Manufacturers

export interface Item {
  id: number;
  name: string;
  gameSystem: string;
  army: string;
  unitType: string;
  description: string;
  price: number; // Base price from manufacturer
  tags: string[];
  image: string;
  format: string;
  type: string;
  manufacturerId: number;
}

export interface StoreItemListing {
  itemId: number;
  storePrice: number; // Store sets their own price
}

export interface ManufacturerInfo {
  id: number;
  name: string;
  description: string;
  since: string;
  logo: string;
  website?: string;
}

export interface StoreInfo {
  id: number;
  name: string;
  description: string;
  since: string;
  logo: string;
  owner?: string;
}

// Manufacturers - creators of the miniatures
export const MANUFACTURERS: ManufacturerInfo[] = [
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
  {
    id: 4,
    name: "Mezgike",
    description: "Grimdark sci-fi and fantasy miniatures with a focus on multi-part kits and conversion potential.",
    since: "January 2021",
    logo: "",
    website: "https://www.myminifactory.com/users/Mezgike",
  },
  {
    id: 5,
    name: "3D Stock",
    description: "Historical scale models and military vehicles. Accurate 1/72 and 28mm scale models for wargaming.",
    since: "June 2019",
    logo: "",
    website: "https://cults3d.com",
  },
  {
    id: 6,
    name: "Games Workshop",
    description: "The original creators of Warhammer. Official 3D scan files for select models.",
    since: "January 1975",
    logo: "",
    website: "https://www.warhammer.com",
  },
  {
    id: 7,
    name: "Beholder Miniatures",
    description: "Finely sculpted fantasy miniatures inspired by classic tabletop armies and nature spirits.",
    since: "September 2020",
    logo: "",
    website: "https://www.philibertnet.com",
  },
];

// Stores - retailers that can sell items from any manufacturer at their own prices
export const STORES: StoreInfo[] = [
  {
    id: 1,
    name: "Epic Prints Shop",
    description: "Your one-stop shop for quality 3D printable miniatures from top manufacturers. Premium pricing for premium service.",
    since: "March 2023",
    logo: "",
    owner: "John Smith",
  },
  {
    id: 2,
    name: "Tabletop Treasures",
    description: "Curated selection of the finest miniatures for discerning collectors. Competitive prices.",
    since: "July 2023",
    logo: "",
    owner: "Sarah Johnson",
  },
  {
    id: 3,
    name: "Mini Market",
    description: "Affordable miniatures for every tabletop gamer. Best prices guaranteed!",
    since: "November 2023",
    logo: "",
    owner: "Mike Davis",
  },
];

// All available items in the marketplace (created by manufacturers)
export const ALL_ITEMS: Item[] = [
  // Highlands Miniatures (id: 1) - Bretonnia
  {
    id: 1,
    name: "Knight of the realm",
    gameSystem: "Warhammer Old World",
    army: "Bretonnia",
    unitType: "Knight of the realm",
    description: "Elite mounted knights with ornate armor and lances. Perfect for leading your cavalry charges into battle.",
    price: 12.99,
    tags: ["bretonnia", "knight", "cavalry", "elite", "mounted", "medieval"],
    image: "/images/img1.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 1,
  },
  {
    id: 2,
    name: "Man at arms",
    gameSystem: "Warhammer Old World",
    army: "Bretonnia",
    unitType: "Man at arms",
    description: "Brave infantry soldiers forming the backbone of your army. Armed with swords and shields for close combat.",
    price: 8.99,
    tags: ["bretonnia", "infantry", "man at arms", "core", "medieval", "foot soldiers"],
    image: "/images/img2.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 1,
  },
  {
    id: 3,
    name: "Bowmen",
    gameSystem: "Warhammer Old World",
    army: "Bretonnia",
    unitType: "Bowmen",
    description: "Skilled archers providing ranged support. Essential for softening enemy lines before the charge.",
    price: 8.99,
    tags: ["bretonnia", "bowmen", "ranged", "archers", "medieval", "support"],
    image: "/images/img3.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 1,
  },

  // Lost Kingdom Miniatures (id: 2) - Bretonnia
  {
    id: 4,
    name: "Knight of the realm",
    gameSystem: "Warhammer Old World",
    army: "Bretonnia",
    unitType: "Knight of the realm",
    description: "Noble warriors on foot with spears and heavy armor. Versatile cavalry that can fight dismounted.",
    price: 10.99,
    tags: ["bretonnia", "knight", "spearmen", "heavy infantry", "pre-supported", "historical"],
    image: "/images/img4.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 2,
  },
  {
    id: 5,
    name: "Man at arms",
    gameSystem: "Warhammer Old World",
    army: "Bretonnia",
    unitType: "Man at arms",
    description: "Reliable spear-wielding infantry forming defensive lines. Pre-supported files included for easy printing.",
    price: 7.99,
    tags: ["bretonnia", "man at arms", "spearmen", "infantry", "pre-supported", "defensive"],
    image: "/images/img5.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 2,
  },
  {
    id: 6,
    name: "Bowmen",
    gameSystem: "Warhammer Old World",
    army: "Bretonnia",
    unitType: "Bowmen",
    description: "Expert longbowmen raining arrows on the enemy. Detailed models with dynamic poses.",
    price: 7.99,
    tags: ["bretonnia", "bowmen", "archers", "ranged", "pre-supported", "longbow"],
    image: "/images/img6.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 2,
  },

  // Monstrous Encounters (id: 3) - Bretonnia
  {
    id: 7,
    name: "Knight of the realm",
    gameSystem: "Warhammer Old World",
    army: "Bretonnia",
    unitType: "Knight of the realm",
    description: "Heroic knights blessed with divine virtue. Highly detailed models with ornate heraldry and weapons.",
    price: 14.99,
    tags: ["bretonnia", "knight", "cavalry", "hero", "elite", "virtue", "blessed"],
    image: "/images/img7.webp",
    format: "3D",
    type: "unit",
    manufacturerId: 3,
  },
  {
    id: 8,
    name: "Man at arms",
    gameSystem: "Warhammer Old World",
    army: "Bretonnia",
    unitType: "Man at arms",
    description: "Complete unit of peasant soldiers. Includes multiple pose variations for dynamic formations.",
    price: 9.99,
    tags: ["bretonnia", "man at arms", "infantry", "unit", "peasants", "formation"],
    image: "/images/img8.webp",
    format: "3D",
    type: "unit",
    manufacturerId: 3,
  },
  {
    id: 9,
    name: "Bowmen",
    gameSystem: "Warhammer Old World",
    army: "Bretonnia",
    unitType: "Bowmen",
    description: "Young squires serving as archers. Versatile unit suitable for ranged support or light infantry.",
    price: 9.99,
    tags: ["bretonnia", "bowmen", "squires", "ranged", "youth", "support"],
    image: "/images/img9.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 3,
  },

  // Mezgike (id: 4) - Warhammer 40k Greenskins
  {
    id: 10,
    name: "Orc boyz",
    gameSystem: "Warhammer 40k",
    army: "Greenskins",
    unitType: "Orc boyz",
    description: "Rowdy multi-part Freebooter Boyz mob ready for a scrap. Highly customizable kit with multiple weapon and head options.",
    price: 11.99,
    tags: ["greenskins", "orks", "orc boyz", "infantry", "multipart", "sci-fi", "40k"],
    image: "/images/img10.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 4,
  },

  // 3D Stock (id: 5) - Flames of War Germany
  {
    id: 11,
    name: "PzKpfw IV F2",
    gameSystem: "Flames of war",
    army: "Germany",
    unitType: "PzKpfw IV F2",
    description: "Accurate 1/72 scale model of the iconic German medium tank. Detailed hull and turret with optional stowage.",
    price: 6.99,
    tags: ["germany", "tank", "ww2", "panzer", "medium tank", "historical", "flames of war", "1/72"],
    image: "/images/img11.webp",
    format: "3D",
    type: "vehicle",
    manufacturerId: 5,
  },
  {
    id: 12,
    name: "PzKpfw III L",
    gameSystem: "Flames of war",
    army: "Germany",
    unitType: "PzKpfw III L",
    description: "Detailed 1/72 scale Panzer III Ausf. L with spaced armor and long 5cm gun. Essential for early war German forces.",
    price: 6.99,
    tags: ["germany", "tank", "ww2", "panzer", "medium tank", "historical", "flames of war", "1/72"],
    image: "/images/img12.webp",
    format: "3D",
    type: "vehicle",
    manufacturerId: 5,
  },

  // Highlands Miniatures (id: 1) - Orcs and Goblins
  {
    id: 13,
    name: "Goblin wolf rider mob",
    gameSystem: "Warhammer Old World",
    army: "Orcs and goblins",
    unitType: "Goblin wolf rider mob",
    description: "Fast-moving mounted goblin cavalry riding ferocious steppe wolves. Great for flanking and harassment tactics.",
    price: 10.99,
    tags: ["orcs and goblins", "goblin", "wolf rider", "cavalry", "mounted", "fast cavalry", "medieval fantasy"],
    image: "/images/img13.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 1,
  },
  {
    id: 14,
    name: "Stone troll mob",
    gameSystem: "Warhammer Old World",
    army: "Orcs and goblins",
    unitType: "Stone troll mob",
    description: "Hulking cave trolls with rocky hides and brutal club attacks. Fearsome monsters that anchor your battle line.",
    price: 13.99,
    tags: ["orcs and goblins", "troll", "monster", "cave troll", "stone troll", "large model", "medieval fantasy"],
    image: "/images/img14.jpg",
    format: "3D",
    type: "monster",
    manufacturerId: 1,
  },

  // Games Workshop (id: 6) - Orcs and Goblins
  {
    id: 15,
    name: "Goblin wolf rider mob",
    gameSystem: "Warhammer Old World",
    army: "Orcs and goblins",
    unitType: "Goblin wolf rider mob",
    description: "Official Games Workshop 3D scan of the Goblin Wolf Rider Mob. Authentic detail straight from the original sculpt.",
    price: 15.99,
    tags: ["orcs and goblins", "goblin", "wolf rider", "cavalry", "official", "3d scan", "games workshop"],
    image: "/images/img15.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 6,
  },

  // Beholder Miniatures (id: 7) - Age of Sigmar Sylvaneth
  {
    id: 16,
    name: "Dryads",
    gameSystem: "Age of Sigmar",
    army: "Sylvaneth",
    unitType: "Dryads",
    description: "Ethereal woodland spirits with flowing branch-like forms. Hauntingly beautiful models that bring the forest to life on your tabletop.",
    price: 11.99,
    tags: ["sylvaneth", "dryads", "forest spirits", "age of sigmar", "nature", "fantasy", "ethereal"],
    image: "/images/img16.jpg",
    format: "3D",
    type: "unit",
    manufacturerId: 7,
  },
];

// Default store inventories with store-specific pricing
// Format: { itemId: X, storePrice: Y }
export const DEFAULT_STORE_INVENTORIES: Record<number, StoreItemListing[]> = {
  1: [ // Epic Prints Shop - Premium pricing
    { itemId: 1, storePrice: 14.99 },
    { itemId: 2, storePrice: 10.49 },
    { itemId: 4, storePrice: 12.99 },
    { itemId: 7, storePrice: 16.99 },
    { itemId: 10, storePrice: 13.99 },
    { itemId: 13, storePrice: 12.99 },
    { itemId: 15, storePrice: 17.99 },
    { itemId: 16, storePrice: 13.99 },
  ],
  2: [ // Tabletop Treasures - Mid-range pricing
    { itemId: 1, storePrice: 13.49 },
    { itemId: 3, storePrice: 9.49 },
    { itemId: 5, storePrice: 8.49 },
    { itemId: 8, storePrice: 10.49 },
    { itemId: 11, storePrice: 7.49 },
    { itemId: 12, storePrice: 7.49 },
    { itemId: 14, storePrice: 14.49 },
    { itemId: 16, storePrice: 12.49 },
  ],
  3: [ // Mini Market - Budget pricing (discounts!)
    { itemId: 2, storePrice: 7.99 },
    { itemId: 4, storePrice: 9.99 },
    { itemId: 6, storePrice: 6.99 },
    { itemId: 9, storePrice: 8.99 },
    { itemId: 11, storePrice: 5.99 },
    { itemId: 12, storePrice: 5.99 },
    { itemId: 13, storePrice: 9.99 },
    { itemId: 15, storePrice: 13.99 },
  ],
};

// Helper function to get items for a store with store-specific pricing
export function getDefaultStoreItems(storeId: number): Item[] {
  const listings = DEFAULT_STORE_INVENTORIES[storeId] || [];
  return listings.map(listing => {
    const item = ALL_ITEMS.find(i => i.id === listing.itemId);
    if (!item) return null;
    return {
      ...item,
      price: listing.storePrice,
    };
  }).filter(Boolean) as Item[];
}

// Helper function to get items by manufacturer
export function getItemsByManufacturer(manufacturerId: number): Item[] {
  return ALL_ITEMS.filter(item => item.manufacturerId === manufacturerId);
}

// Helper function to get manufacturer by id
export function getManufacturerById(manufacturerId: number): ManufacturerInfo | undefined {
  return MANUFACTURERS.find(manufacturer => manufacturer.id === manufacturerId);
}

// Helper function to get store by id
export function getStoreById(storeId: number): StoreInfo | undefined {
  return STORES.find(store => store.id === storeId);
}

// Helper function to get item by id (returns base price)
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

// Helper function to search items by unit type (to find similar units across manufacturers)
export function getItemsByUnitType(unitType: string): Item[] {
  return ALL_ITEMS.filter(item =>
    item.unitType.toLowerCase() === unitType.toLowerCase()
  );
}

// Helper function to get all stores selling a specific item with their prices
export function getStoresSelling(itemId: number): Array<{store: StoreInfo, price: number}> {
  const result: Array<{store: StoreInfo, price: number}> = [];

  Object.entries(DEFAULT_STORE_INVENTORIES).forEach(([storeId, listings]) => {
    const listing = listings.find(l => l.itemId === itemId);
    if (listing) {
      const store = getStoreById(parseInt(storeId));
      if (store) {
        result.push({ store, price: listing.storePrice });
      }
    }
  });

  return result;
}