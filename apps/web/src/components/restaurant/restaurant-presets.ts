import { CreateRestaurantDishDraft } from "../../lib/types/database";

/**
 * Spécialités culinaires africaines et béninoises strictement dissociées par famille.
 */
export const BENIN_CULINARY_SPECIALTIES: string[] = [
  "Pâtes Traditionnelles Béninoises (Amiwo, Télibo, Wɔ̌, Akassa)",
  "Mets de Riz, Haricots & Céréales (Atassi, Riz au gras, Djounka)",
  "Haricots & Tubercules (Toubani, Ata, Abobo, Igname pilée Agoun)",
  "Gari, Tapioca & Manioc (Dakouin, Gari foto, Attiéké, Garba)",
  "Wagashi & Spécialités du Septentrion (Fromage Peul, Kilichi)",
  "Maquis, Poissons Braisés & Fruits de Mer (Daurade, Crabes, Crevettes)",
  "Grillades, Brochettes & Viandes Rôties (Poulet bicyclette, Choucouya)",
  "Sauces & Mijotés du Terroir (Gombo, Crincrin, Gboma, Graine, Arachide)",
  "Chawarma, Wraps & Street-Food Africaine",
  "Fast-Food & Burgers Gourmets",
  "Boissons Locales & Jus Naturels (Bissap, Gnamakoudji, Baobab, Dêguê)",
  "Cafétéria, Petit-Déjeuner & Pâtisseries (Aklui, Yovotokpo)",
  "Plats Santé, Végétariens & Salades Tropicales",
];

/**
 * Sections officielles de la carte du menu d'un restaurant ClicBouffe.
 */
export const MENU_COURSE_CATEGORIES: string[] = [
  "Entrées & Amuse-bouches",
  "Pâtes & Plats Traditionnels",
  "Riz, Haricots & Céréales",
  "Grillades & Poissons Braisés",
  "Sauces & Accompagnements",
  "Gari, Tapioca & Manioc",
  "Fast-Food, Burgers & Wraps",
  "Boissons Locales & Jus Frais",
  "Desserts & Douceurs",
];

/**
 * Logos standards officiels proposés par ClicBouffe.
 */
export const STANDARD_CLICBOUFFE_LOGOS = [
  { id: "marmite", label: "Marmite ClicBouffe", url: "/images/logos/logo-marmite-bleu.svg" },
  { id: "chef", label: "Toque Chef", url: "/images/logos/logo-chef-noir.svg" },
  { id: "maquis", label: "Braise & Maquis", url: "/images/logos/logo-maquis-braise.svg" },
  { id: "terroir", label: "Bol du Terroir", url: "/images/logos/logo-terroir-emeraude.svg" },
  { id: "street", label: "Burger & Street", url: "/images/logos/logo-street-burger.svg" },
  { id: "boissons", label: "Jus & Fraîcheur", url: "/images/logos/logo-boissons-soleil.svg" },
];

export const BANNER_PRESETS = [
  { label: "Maquis & Poissons", img: "/images/restau_maquis.jpg" },
  { label: "Cuisine Locale", img: "/images/restau_cecile.jpg" },
  { label: "Saveurs du Terroir", img: "/images/restau_saveurs.jpg" },
  { label: "Burger Gourmet", img: "/images/amberger_banner.jpg" },
  { label: "Chawarma & Grill", img: "/images/restau_chawarma.jpg" },
  { label: "Festin Africain", img: "/images/restau_delice.jpg" },
];

export const DISH_PHOTO_PRESETS = [
  { label: "Amiwo / Pâte rouge", img: "/images/dish_pate_rouge.jpg" },
  { label: "Télibo / Pâte noire", img: "/images/dish_pate_noire.jpg" },
  { label: "Wɔ̌ / Pâte blanche", img: "/images/dish_pate_blanche.jpg" },
  { label: "Riz au gras / Atassi", img: "/images/dish_riz_gras.jpg" },
  { label: "Daurade braisée", img: "/images/restau_maquis.jpg" },
  { label: "Gari foto & poisson", img: "/images/dish_gari.jpg" },
  { label: "Tapioca chaud", img: "/images/dish_tapioca.jpg" },
  { label: "Chawarma grillé", img: "/images/dish_chawarma.jpg" },
  { label: "Burger gourmet", img: "/images/amberger.jpg" },
];

export const QUICK_LOCATIONS = [
  "Akpakpa, Zone Portuaire",
  "Enagnon, Cotonou",
  "Haie Vive, Cotonou",
  "Cadjehoun, Cotonou",
  "Fidjrossè, Route des Pêches",
  "Calavi, Carrefour IITA",
  "Porto-Novo, Ouando",
  "Parakou, Centre-ville",
];

export const ZONE_OPTIONS = [
  "Salle Principale",
  "Terrasse",
  "Espace VIP",
  "Comptoir",
  "Jardin",
  "Étage",
];

export const PREP_TIME_OPTIONS = [10, 15, 20, 30, 45];

export const SUGGESTED_MENU_STARTERS: CreateRestaurantDishDraft[] = [
  {
    name: "Amiwo au Poulet Bicyclette",
    description: "Pâte rouge cuite dans une sauce tomate épicée, accompagnée de poulet braisé et sauce piment vert.",
    price: 2000,
    categoryLabel: "Pâtes & Plats Traditionnels",
    prepTimeMin: 18,
    imageUrl: "/images/dish_pate_rouge.jpg",
    isFreeEligible: true,
    allowsCustomization: true,
  },
  {
    name: "Télibo & Sauce Crincrin Gombo",
    description: "Pâte noire de cossettes d'igname servie avec sa sauce gluante maison, poisson fumé et fromage wagashi.",
    price: 2000,
    categoryLabel: "Pâtes & Plats Traditionnels",
    prepTimeMin: 15,
    imageUrl: "/images/dish_pate_noire.jpg",
    isFreeEligible: false,
    allowsCustomization: true,
  },
  {
    name: "Dakouin & Poisson Frit du Lac",
    description: "Gari trempé dans une sauce tomate relevée aux oignons, piment frais et poissons dorés.",
    price: 1500,
    categoryLabel: "Gari, Tapioca & Manioc",
    prepTimeMin: 12,
    imageUrl: "/images/dish_gari.jpg",
    isFreeEligible: false,
    allowsCustomization: true,
  },
  {
    name: "Jus de Bissap Frais à la Menthe",
    description: "Infusion glacée de fleurs d'hibiscus, parfumée à la menthe fraîche et peu sucrée.",
    price: 500,
    categoryLabel: "Boissons Locales & Jus Frais",
    prepTimeMin: 5,
    imageUrl: "/images/dish_tapioca.jpg",
    isFreeEligible: false,
    allowsCustomization: false,
  },
];
