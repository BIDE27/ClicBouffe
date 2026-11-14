export interface DishItem {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  originalPrice?: number;
  img: string;
  isFree?: boolean;
}

export const INITIAL_GRID_DISHES: DishItem[] = [
  { id: "1", name: "Pâte noire", price: "2 000 FCFA", priceNum: 2000, originalPrice: 200, img: "/images/dish_pate_noire.jpg", isFree: true },
  { id: "2", name: "Tapioca chaud", price: "100 FCFA", priceNum: 100, originalPrice: 100, img: "/images/dish_tapioca.jpg", isFree: true },
  { id: "3", name: "Chawarma", price: "1 000 FCFA", priceNum: 1000, originalPrice: 1000, img: "/images/dish_chawarma.jpg", isFree: false },
  { id: "4", name: "Pâte blanche", price: "200 FCFA", priceNum: 200, originalPrice: 200, img: "/images/dish_pate_blanche.jpg", isFree: true },
  { id: "5", name: "Gari au lait", price: "200 FCFA", priceNum: 200, originalPrice: 200, img: "/images/dish_gari.jpg", isFree: true },
  { id: "6", name: "Pâte rouge", price: "1 000 FCFA", priceNum: 1000, originalPrice: 200, img: "/images/dish_pate_rouge.jpg", isFree: true },
  { id: "7", name: "Riz au gras", price: "1 000 FCFA", priceNum: 1000, originalPrice: 1000, img: "/images/dish_riz_gras.jpg", isFree: false },
  { id: "8", name: "Amberger", price: "5 000 FCFA", priceNum: 5000, originalPrice: 5000, img: "/images/amberger.jpg", isFree: false },
];

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  categoryId: "all" | "local" | "maquis" | "chawarma" | "burger";
  img: string;
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  deliveryFee: string;
  distance: string;
  address: string;
  popularDishes: string[];
  badges: string[];
  isOpen: boolean;
}

export const REGIONAL_RESTAURANTS: Restaurant[] = [
  {
    id: "r1",
    name: "Le Maquis du Port",
    category: "Cuisine Locale & Poissons Braisés",
    categoryId: "maquis",
    img: "/images/restau_maquis.jpg",
    rating: 4.8,
    reviewsCount: 184,
    deliveryTime: "15-25 min",
    deliveryFee: "80 FCFA",
    distance: "800 m",
    address: "Zone Portuaire, Akpakpa Cotonou",
    popularDishes: ["Pâte noire Télibo", "Daurade braisée", "Pâte rouge Amiwo"],
    badges: ["Populaire", "Partenaire Certifié", "Ouvert"],
    isOpen: true,
  },
  {
    id: "r2",
    name: "Saveurs d'Akpakpa (Terrain Zico)",
    category: "Cuisine Traditionnelle & Douceurs",
    categoryId: "local",
    img: "/images/restau_saveurs.jpg",
    rating: 4.9,
    reviewsCount: 326,
    deliveryTime: "10-20 min",
    deliveryFee: "80 FCFA",
    distance: "200 m",
    address: "Face Terrain Zico, Akpakpa",
    popularDishes: ["Pâte blanche Akassa", "Atassi royal", "Gari au lait", "Tapioca chaud"],
    badges: ["Le plus proche", "Top Noté", "Ouvert"],
    isOpen: true,
  },
  {
    id: "r3",
    name: "Chawarma & Grill Cotonou",
    category: "Chawarma & Fast-Food",
    categoryId: "chawarma",
    img: "/images/restau_chawarma.jpg",
    rating: 4.7,
    reviewsCount: 242,
    deliveryTime: "20-30 min",
    deliveryFee: "80 FCFA",
    distance: "1.2 km",
    address: "Boulevard de la Marina, Akpakpa",
    popularDishes: ["Chawarma bœuf gourmand", "Chawarma poulet", "Brochettes"],
    badges: ["Livraison Rapide", "Ouvert"],
    isOpen: true,
  },
  {
    id: "r4",
    name: "Le Burger Béninois (Gourmet)",
    category: "Fast-Food & Burgers",
    categoryId: "burger",
    img: "/images/restau_burger.jpg",
    rating: 4.8,
    reviewsCount: 195,
    deliveryTime: "20-35 min",
    deliveryFee: "80 FCFA",
    distance: "1.5 km",
    address: "Carrefour Dodji, Akpakpa",
    popularDishes: ["Amberger Signature", "Burger Cheddar Bacon", "Frites douces"],
    badges: ["Gourmet", "Ouvert"],
    isOpen: true,
  },
  {
    id: "r5",
    name: "Chez Maman Cécile (Plats du Jour)",
    category: "Cuisine Familiale & Sauces",
    categoryId: "local",
    img: "/images/restau_cecile.jpg",
    rating: 4.9,
    reviewsCount: 412,
    deliveryTime: "15-25 min",
    deliveryFee: "80 FCFA",
    distance: "900 m",
    address: "Quartier Enagnon, Akpakpa",
    popularDishes: ["Pâte rouge au poulet bicyclette", "Sauce Gombo crincrin", "Tapioca"],
    badges: ["Authentique", "Spécialités Locales", "Ouvert"],
    isOpen: true,
  },
  {
    id: "r6",
    name: "Délice d'Afrique & Co",
    category: "Cuisine Ouest-Africaine",
    categoryId: "maquis",
    img: "/images/restau_delice.jpg",
    rating: 4.6,
    reviewsCount: 118,
    deliveryTime: "25-35 min",
    deliveryFee: "130 FCFA",
    distance: "1.8 km",
    address: "Avenue Sacré-Cœur, Cotonou",
    popularDishes: ["Riz au gras sénégalais", "Alloco doré", "Sauce d'arachide"],
    badges: ["Généreux", "Ouvert"],
    isOpen: true,
  },
];

export interface ScheduledDish {
  id: string;
  dishName: string;
  restaurantName: string;
  price: string;
  priceNum: number;
  scheduledDate: string;
  scheduledTime: string;
  portions: number;
  instructions: string;
  img: string;
  status: "confirmé" | "en_attente";
}

export const INITIAL_SCHEDULED_DISHES: ScheduledDish[] = [
  {
    id: "sch-1",
    dishName: "Pâte rouge Amiwo & Poulet Bicyclette",
    restaurantName: "Chez Maman Cécile",
    price: "2 000 FCFA",
    priceNum: 2000,
    scheduledDate: "Aujourd'hui",
    scheduledTime: "19h30",
    portions: 2,
    instructions: "Piment modéré, sauce servie dans un sachet séparé",
    img: "/images/dish_pate_rouge.jpg",
    status: "confirmé",
  },
  {
    id: "sch-2",
    dishName: "Amberger Double Cheddar Gourmet",
    restaurantName: "Le Burger Béninois",
    price: "5 000 FCFA",
    priceNum: 5000,
    scheduledDate: "Demain",
    scheduledTime: "12h15",
    portions: 1,
    instructions: "Sans oignons crus, bien chaud",
    img: "/images/amberger.jpg",
    status: "confirmé",
  },
  {
    id: "sch-3",
    dishName: "Tapioca chaud & Gari au lait gourmand",
    restaurantName: "Saveurs d'Akpakpa (Terrain Zico)",
    price: "300 FCFA",
    priceNum: 300,
    scheduledDate: "Vendredi 18 Nov",
    scheduledTime: "16h00",
    portions: 1,
    instructions: "Arachides bien croustillantes à part",
    img: "/images/dish_tapioca.jpg",
    status: "confirmé",
  },
];

export interface MealSubscription {
  id: string;
  type: "meal" | "restaurant_vip";
  title: string;
  targetName: string;
  providerName: string;
  img: string;
  frequency: string;
  scheduledTime: string;
  deliveryAddress: string;
  pricePerPeriod: string;
  status: "actif" | "en_pause";
  renewalDate: string;
  benefits?: string[];
}

export const INITIAL_SUBSCRIPTIONS: MealSubscription[] = [
  {
    id: "sub-1",
    type: "meal",
    title: "Abonnement Déjeuner Express Midi (5j/sem)",
    targetName: "Pâte rouge Amiwo ou Pâte noire selon arrivage",
    providerName: "Chez Maman Cécile",
    img: "/images/dish_pate_rouge.jpg",
    frequency: "Du Lundi au Vendredi (5 jours)",
    scheduledTime: "12h30 pile",
    deliveryAddress: "Terrain Zico, Akpakpa Cotonou",
    pricePerPeriod: "7 500 FCFA / semaine",
    status: "actif",
    renewalDate: "Renouvellement le 21 Nov 2026",
    benefits: ["Livraison garantie à 12h30 pile", "Frais de livraison offerts", "Plats chauds et variés"],
  },
  {
    id: "sub-2",
    type: "meal",
    title: "Pack Goûter & Douceur Terroir",
    targetName: "Tapioca chaud onctueux & Gari au lait gourmand",
    providerName: "Saveurs d'Akpakpa (Terrain Zico)",
    img: "/images/dish_tapioca.jpg",
    frequency: "Mardi et Jeudi (2 jours)",
    scheduledTime: "16h00",
    deliveryAddress: "Terrain Zico, Akpakpa",
    pricePerPeriod: "1 200 FCFA / semaine",
    status: "actif",
    renewalDate: "Renouvellement le 24 Nov 2026",
    benefits: ["Goûter prêt pour la pause de 16h", "Arachides grillées fraîches et lait sucré"],
  },
  {
    id: "sub-3",
    type: "restaurant_vip",
    title: "Abonné Fidèle Privilège VIP",
    targetName: "Le Maquis du Port",
    providerName: "Le Maquis du Port",
    img: "/images/restau_maquis.jpg",
    frequency: "Permanent (Accès VIP)",
    scheduledTime: "À chaque commande",
    deliveryAddress: "Terrain Zico, Akpakpa",
    pricePerPeriod: "Abonnement Gratuit",
    status: "actif",
    renewalDate: "Statut VIP actif",
    benefits: [
      "-10% automatique sur toute la carte",
      "Livraison express prioritaire en moins de 20 min",
      "Accès aux arrivages de poissons frais en avant-première",
    ],
  },
];

export const AVAILABLE_FORMULAS = [
  {
    id: "form-1",
    badge: "Populaire Salariés",
    title: "Formule Déjeuner Bureau (5 Jours)",
    price: "7 500 FCFA / semaine",
    description: "Un plat complet équilibré livré du lundi au vendredi à 12h30 précises à votre bureau ou domicile.",
    features: ["5 déjeuners complets", "Livraison offerte (0 FCFA)", "Choix entre 3 plats du jour"],
  },
  {
    id: "form-2",
    badge: "Économique",
    title: "Formule Goûter & En-cas Étudiant",
    price: "3 000 FCFA / semaine",
    description: "Le goûter traditionnel d'Akpakpa : Tapioca chaud, Gari au lait ou Chawarma à prix réduit.",
    features: ["4 en-cas par semaine", "Arachides et accompagnements inclus", "Pause de 16h assurée"],
  },
  {
    id: "form-3",
    badge: "Famille & Festin",
    title: "Formule Famille Week-End",
    price: "15 000 FCFA / week-end",
    description: "Un grand festin pour 4 personnes livré le samedi ou dimanche midi (Grillades, Pâte rouge, Alloco).",
    features: ["Portions pour 4 personnes", "Poisson ou poulet braisé entier", "Boissons fraîches offertes"],
  },
];

export interface PromoSlide {
  id: string;
  tag: string;
  tagBg: string;
  partnerName: string;
  partnerLocation: string;
  title: string;
  price: string;
  priceDetails: string;
  img: string;
  isSponsored: boolean;
  ctaText: string;
  dishRefName: string;
}

export const PROMOTIONAL_CAROUSEL_SLIDES: PromoSlide[] = [
  {
    id: "promo-1",
    tag: "SPÉCIALITÉ DU CHEF",
    tagBg: "bg-[#00AFF2]",
    partnerName: "Le Burger Béninois",
    partnerLocation: "Terrain Zico • Préparé à la minute",
    title: "Amberger Gourmet Signature",
    price: "5 000 FCFA",
    priceDetails: "Double steak, cheddar affiné & sauce maison",
    img: "/images/amberger_banner.jpg",
    isSponsored: true,
    ctaText: "Commander",
    dishRefName: "Amberger",
  },
  {
    id: "promo-2",
    tag: "RESTAURANT EN VEDETTE",
    tagBg: "bg-emerald-600",
    partnerName: "Le Maquis du Port",
    partnerLocation: "Zone Portuaire • Pêche fraîche du jour",
    title: "Daurade Braisée Royale & Alloco",
    price: "3 500 FCFA",
    priceDetails: "Marinade maison au piment vert doux & oignons braisés",
    img: "/images/restau_maquis.jpg",
    isSponsored: true,
    ctaText: "Commander",
    dishRefName: "Pâte rouge",
  },
  {
    id: "promo-3",
    tag: "RECETTE DU JOUR SPONSORISÉE",
    tagBg: "bg-amber-600",
    partnerName: "Chez Maman Cécile",
    partnerLocation: "Enagnon • Cuisiné au feu de bois",
    title: "Pâte Rouge Amiwo & Poulet Doré",
    price: "2 000 FCFA",
    priceDetails: "Poulet bicyclette croustillant, sauce tomate mijotée",
    img: "/images/dish_pate_rouge.jpg",
    isSponsored: true,
    ctaText: "Commander",
    dishRefName: "Pâte rouge",
  },
  {
    id: "promo-4",
    tag: "GOÛTER TERROIR POPULAIRE",
    tagBg: "bg-purple-600",
    partnerName: "Saveurs d'Akpakpa",
    partnerLocation: "Terrain Zico • Pause 16h Gourmande",
    title: "Tapioca Chaud & Gari au Lait",
    price: "300 FCFA",
    priceDetails: "Lait sucré onctueux, arachides grillées croquantes",
    img: "/images/dish_tapioca.jpg",
    isSponsored: true,
    ctaText: "Commander",
    dishRefName: "Tapioca chaud",
  },
];

export interface CategoryFilterItem {
  id: "all" | "local" | "maquis" | "chawarma" | "burger";
  label: string;
  shortLabel: string;
  iconName: "Utensils" | "Soup" | "Flame" | "Sandwich" | "Beef";
}

export const EXPLORER_CATEGORIES: CategoryFilterItem[] = [
  { id: "all", label: "Tous les restaurants", shortLabel: "Tous", iconName: "Utensils" },
  { id: "local", label: "Cuisine Locale & Pâtes", shortLabel: "Cuisine Locale", iconName: "Soup" },
  { id: "maquis", label: "Maquis & Grillades", shortLabel: "Grillades", iconName: "Flame" },
  { id: "chawarma", label: "Chawarma & Wraps", shortLabel: "Chawarma", iconName: "Sandwich" },
  { id: "burger", label: "Fast-Food & Burgers", shortLabel: "Burgers", iconName: "Beef" },
];
