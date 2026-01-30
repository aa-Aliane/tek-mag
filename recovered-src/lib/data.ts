

import { Smartphone, Tablet, Laptop, Package } from "lucide-react";

export const deviceTypes = [
  { id: "smartphone", name: "Smartphone", icon: Smartphone },
  { id: "tablet", name: "Tablette", icon: Tablet },
  { id: "computer", name: "Ordinateur", icon: Laptop },
  { id: "other", name: "Autre", icon: Package },
];

// Mock brands data
export const brands: Brand[] = [
  { id: "1", name: "Apple", deviceTypes: ["smartphone", "tablet", "computer"] },
  { id: "2", name: "Samsung", deviceTypes: ["smartphone", "tablet"] },
  { id: "3", name: "Huawei", deviceTypes: ["smartphone", "tablet"] },
  { id: "4", name: "Xiaomi", deviceTypes: ["smartphone", "tablet"] },
  { id: "5", name: "Dell", deviceTypes: ["computer"] },
  { id: "6", name: "HP", deviceTypes: ["computer"] },
  { id: "7", name: "Lenovo", deviceTypes: ["computer", "tablet"] },
]

// Mock models data
export const models: Model[] = [
  // Apple
  { id: "1", name: "iPhone 15 Pro", brandId: "1", deviceType: "smartphone" },
  { id: "2", name: "iPhone 14", brandId: "1", deviceType: "smartphone" },
  { id: "3", name: "iPhone 13", brandId: "1", deviceType: "smartphone" },
  { id: "4", name: 'iPad Pro 12.9"', brandId: "1", deviceType: "tablet" },
  { id: "5", name: "iPad Air", brandId: "1", deviceType: "tablet" },
  { id: "6", name: 'MacBook Pro 16"', brandId: "1", deviceType: "computer" },
  { id: "7", name: "MacBook Air M2", brandId: "1", deviceType: "computer" },
  // Samsung
  { id: "8", name: "Galaxy S24 Ultra", brandId: "2", deviceType: "smartphone" },
  { id: "9", name: "Galaxy S23", brandId: "2", deviceType: "smartphone" },
  { id: "10", name: "Galaxy Tab S9", brandId: "2", deviceType: "tablet" },
  // Huawei
  { id: "11", name: "P60 Pro", brandId: "3", deviceType: "smartphone" },
  { id: "12", name: "MatePad Pro", brandId: "3", deviceType: "tablet" },
  // Xiaomi
  { id: "13", name: "Mi 13 Pro", brandId: "4", deviceType: "smartphone" },
  { id: "14", name: "Redmi Note 12", brandId: "4", deviceType: "smartphone" },
  // Dell
  { id: "15", name: "XPS 15", brandId: "5", deviceType: "computer" },
  { id: "16", name: "Inspiron 14", brandId: "5", deviceType: "computer" },
  // HP
  { id: "17", name: "Pavilion 15", brandId: "6", deviceType: "computer" },
  { id: "18", name: "EliteBook 840", brandId: "6", deviceType: "computer" },
  // Lenovo
  { id: "19", name: "ThinkPad X1", brandId: "7", deviceType: "computer" },
  { id: "20", name: "Tab P11", brandId: "7", deviceType: "tablet" },
]

// Mock issues data
export const issues: Issue[] = [
  // Common to all
  { id: "1", name: "Diagnostique", deviceTypes: ["smartphone", "tablet", "computer", "other"], basePrice: 25 },
  { id: "2", name: "Oxydation", deviceTypes: ["smartphone", "tablet", "computer", "other"], basePrice: 45 },

  // Smartphone & Tablet
  { id: "3", name: "Écran cassé", deviceTypes: ["smartphone", "tablet"], requiresPart: true, basePrice: 89 },
  { id: "4", name: "Batterie", deviceTypes: ["smartphone", "tablet"], requiresPart: true, basePrice: 35 },
  { id: "5", name: "Connecteur de charge", deviceTypes: ["smartphone", "tablet"], requiresPart: true, basePrice: 25 },
  { id: "6", name: "Caméra", deviceTypes: ["smartphone", "tablet"], requiresPart: true, basePrice: 55 },
  { id: "7", name: "Haut-parleur", deviceTypes: ["smartphone", "tablet"], requiresPart: true, basePrice: 30 },
  { id: "8", name: "Vitre arrière", deviceTypes: ["smartphone", "tablet"], requiresPart: true, basePrice: 40 },

  // Computer
  { id: "9", name: "Écran", deviceTypes: ["computer"], requiresPart: true, basePrice: 150 },
  { id: "10", name: "Clavier", deviceTypes: ["computer"], requiresPart: true, basePrice: 75 },
  { id: "11", name: "Disque dur / SSD", deviceTypes: ["computer"], requiresPart: true, basePrice: 80 },
  { id: "12", name: "RAM", deviceTypes: ["computer"], requiresPart: true, basePrice: 50 },
  { id: "13", name: "Carte mère", deviceTypes: ["computer"], requiresPart: true, basePrice: 200 },
  { id: "14", name: "Ventilateur", deviceTypes: ["computer"], requiresPart: true, basePrice: 35 },
  { id: "15", name: "Nettoyage / Maintenance", deviceTypes: ["computer"], requiresPart: true, basePrice: 40 },
  { id: "16", name: "Installation logiciel", deviceTypes: ["computer"], requiresPart: true, basePrice: 30 },
]

// Mock clients data
export const mockClients: Client[] = [
  { id: "1", name: "Jean Dupont", phone: "0612345678", email: "jean.dupont@email.com" },
  { id: "2", name: "Marie Martin", phone: "0623456789", email: "marie.martin@email.com" },
  { id: "3", name: "Pierre Bernard", phone: "0634567890" },
]

export const mockRepairs: Repair[] = [
  {
    id: "1",
    deviceType: "smartphone",
    brand: "Apple",
    model: "iPhone 14",
    issues: ["Écran cassé", "Batterie"],
    issueDescription: "Écran fissuré en haut à droite, batterie se décharge rapidement",
    client: mockClients[0],
    status: "en-cours",
    createdAt: new Date("2024-01-15"),
    estimatedCompletion: new Date("2024-01-20"),
    accessories: ["Coque bleue"],
    depositStatus: "deposited",
    totalCost: 124.0, // Écran cassé (89) + Batterie (35)
    payments: [
      {
        id: "p1",
        amount: 50.0,
        method: "cash",
        date: new Date("2024-01-15"),
        note: "Acompte à la prise en charge",
      },
    ],
    paymentStatus: "partial",
  },
  {
    id: "2",
    deviceType: "computer",
    brand: "Dell",
    model: "XPS 15",
    issues: ["Nettoyage / Maintenance", "Installation logiciel"],
    issueDescription: "Ordinateur lent, besoin de nettoyage complet",
    client: mockClients[1],
    status: "prete",
    createdAt: new Date("2024-01-14"),
    accessories: ["Chargeur Dell", "Sacoche"],
    password: "1234",
    depositStatus: "deposited",
    totalCost: 70.0, // Nettoyage (40) + Installation logiciel (30)
    payments: [
      {
        id: "p2",
        amount: 70.0,
        method: "card",
        date: new Date("2024-01-14"),
        note: "Paiement complet",
      },
    ],
    paymentStatus: "paid",
  },
  {
    id: "3",
    deviceType: "tablet",
    brand: "Samsung",
    model: "Galaxy Tab S9",
    issues: ["Diagnostique"],
    issueDescription: "Ne s'allume plus",
    client: mockClients[2],
    status: "en-attente",
    createdAt: new Date("2024-01-16"),
    depositStatus: "scheduled",
    totalCost: 25.0, // Diagnostique (25)
    payments: [],
    paymentStatus: "unpaid",
  },
]

// Mock parts stock data
export const mockParts: Part[] = [
  // iPhone parts
  {
    id: "1",
    name: "Écran iPhone 14",
    deviceType: "smartphone",
    brand: "Apple",
    quantity: 5,
    minQuantity: 3,
    price: 89.99,
  },
  {
    id: "2",
    name: "Batterie iPhone 14",
    deviceType: "smartphone",
    brand: "Apple",
    quantity: 8,
    minQuantity: 5,
    price: 29.99,
  },
  {
    id: "3",
    name: "Écran iPhone 13",
    deviceType: "smartphone",
    brand: "Apple",
    quantity: 2,
    minQuantity: 3,
    price: 79.99,
  },
  {
    id: "4",
    name: "Connecteur charge iPhone",
    deviceType: "smartphone",
    brand: "Apple",
    quantity: 15,
    minQuantity: 10,
    price: 12.99,
  },

  // Samsung parts
  {
    id: "5",
    name: "Écran Galaxy S24",
    deviceType: "smartphone",
    brand: "Samsung",
    quantity: 3,
    minQuantity: 2,
    price: 119.99,
  },
  {
    id: "6",
    name: "Batterie Galaxy S23",
    deviceType: "smartphone",
    brand: "Samsung",
    quantity: 6,
    minQuantity: 4,
    price: 34.99,
  },

  // Tablet parts
  { id: "7", name: "Écran iPad Air", deviceType: "tablet", brand: "Apple", quantity: 1, minQuantity: 2, price: 149.99 },
  {
    id: "8",
    name: "Batterie iPad Pro",
    deviceType: "tablet",
    brand: "Apple",
    quantity: 4,
    minQuantity: 2,
    price: 59.99,
  },

  // Computer parts
  { id: "9", name: "SSD 512GB", deviceType: "computer", quantity: 10, minQuantity: 5, price: 69.99 },
  { id: "10", name: "RAM 8GB DDR4", deviceType: "computer", quantity: 12, minQuantity: 8, price: 39.99 },
  {
    id: "11",
    name: "Clavier MacBook Pro",
    deviceType: "computer",
    brand: "Apple",
    quantity: 0,
    minQuantity: 2,
    price: 89.99,
  },
  {
    id: "12",
    name: "Ventilateur Dell XPS",
    deviceType: "computer",
    brand: "Dell",
    quantity: 3,
    minQuantity: 2,
    price: 24.99,
  },
]

// Mock part orders
export const mockPartOrders: PartOrder[] = [
  {
    id: "1",
    partName: "Écran iPhone 13",
    quantity: 2,
    reason: "Stock faible",
    status: "pending",
    createdAt: new Date("2024-01-16"),
  },
  {
    id: "2",
    partName: "Clavier MacBook Pro",
    quantity: 3,
    reason: "Rupture de stock",
    repairId: "1",
    status: "pending",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    partName: "Écran iPad Air",
    quantity: 2,
    reason: "Stock faible",
    status: "ordered",
    createdAt: new Date("2024-01-14"),
  },
]

// Updated mock archived repairs with new fields
export const mockArchivedRepairs: Repair[] = [
  {
    id: "101",
    deviceType: "smartphone",
    brand: "Apple",
    model: "iPhone 13",
    issues: ["Écran cassé"],
    issueDescription: "Écran complètement cassé suite à une chute",
    client: mockClients[0],
    status: "prete",
    createdAt: new Date("2024-01-05"),
    completedAt: new Date("2024-01-08"),
    recoveredAt: new Date("2024-01-10"),
    totalCost: 89.99,
    depositStatus: "deposited",
  },
  {
    id: "102",
    deviceType: "computer",
    brand: "HP",
    model: "Pavilion 15",
    issues: ["Disque dur / SSD", "Installation logiciel"],
    issueDescription: "Remplacement SSD et installation Windows",
    client: mockClients[1],
    status: "prete",
    createdAt: new Date("2024-01-03"),
    completedAt: new Date("2024-01-06"),
    recoveredAt: new Date("2024-01-07"),
    totalCost: 119.99,
    accessories: ["Chargeur HP"],
    depositStatus: "deposited",
  },
  {
    id: "103",
    deviceType: "tablet",
    brand: "Samsung",
    model: "Galaxy Tab S9",
    issues: ["Batterie", "Connecteur de charge"],
    issueDescription: "Batterie gonflée, connecteur défectueux",
    client: mockClients[2],
    status: "prete",
    createdAt: new Date("2024-01-01"),
    completedAt: new Date("2024-01-04"),
    recoveredAt: new Date("2024-01-05"),
    totalCost: 64.98,
    depositStatus: "deposited",
  },
  {
    id: "104",
    deviceType: "smartphone",
    brand: "Samsung",
    model: "Galaxy S23",
    issues: ["Diagnostique", "Oxydation"],
    issueDescription: "Téléphone tombé dans l'eau",
    client: mockClients[0],
    status: "prete",
    createdAt: new Date("2023-12-28"),
    completedAt: new Date("2023-12-30"),
    recoveredAt: new Date("2024-01-02"),
    totalCost: 45.0,
    depositStatus: "deposited",
  },
  {
    id: "105",
    deviceType: "computer",
    brand: "Dell",
    model: "XPS 15",
    issues: ["Nettoyage / Maintenance"],
    issueDescription: "Nettoyage standard",
    client: mockClients[1],
    status: "prete",
    createdAt: new Date("2023-12-20"),
    completedAt: new Date("2023-12-22"),
    recoveredAt: new Date("2023-12-23"),
    totalCost: 35.0,
    depositStatus: "deposited",
  },
]

// Mock current user (simulating authentication)

