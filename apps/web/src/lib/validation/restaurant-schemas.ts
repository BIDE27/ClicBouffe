import { z } from "zod";

export const createRestaurantSchema = z.object({
  ownerId: z.string().trim().min(1, "Identifiant propriétaire requis."),
  name: z
    .string()
    .trim()
    .min(2, "Le nom du restaurant doit contenir au moins 2 caractères.")
    .max(80, "Le nom du restaurant ne peut pas dépasser 80 caractères."),
  category: z.string().trim().min(2, "Veuillez sélectionner une spécialité culinaire."),
  address: z
    .string()
    .trim()
    .min(3, "Veuillez renseigner le quartier ou l'adresse précise.")
    .max(160, "L'adresse est trop longue."),
  phoneNumber: z
    .string()
    .trim()
    .min(8, "Veuillez renseigner un numéro de téléphone valide (au moins 8 chiffres).")
    .max(30, "Numéro de téléphone invalide."),
  description: z.string().trim().max(500, "Description trop longue (500 caractères max).").optional(),
  openTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format d'heure invalide (HH:MM).").optional(),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format d'heure invalide (HH:MM).").optional(),
  bannerUrl: z
    .string()
    .trim()
    .max(300, "URL de bannière trop longue.")
    .refine(
      (val) => !val || val.startsWith("/images/") || val.startsWith("https://"),
      "URL de bannière non autorisée."
    )
    .optional(),
  salesMode: z.enum(["online_only", "dine_in_only", "hybrid"]).default("hybrid"),
  tablesCount: z.number().int().min(0).max(500).default(10),
  tableZones: z.array(z.string().trim().min(1).max(40)).min(1).max(12).default(["Salle Principale"]),
  avgPrepTimeMin: z.number().int().min(5).max(180).default(20),
  allowsDineInComposition: z.boolean().default(true),
  allowsWaiterCall: z.boolean().default(true),
  acceptsCashOnSite: z.boolean().default(true),
});

export const dineInOrderItemSchema = z.object({
  dishId: z.string().nullable().optional(),
  dishName: z.string().trim().min(1, "Nom du plat requis.").max(120),
  quantity: z.number().int().min(1).max(50),
  unitPrice: z.number().int().min(0).max(500000),
  customizationDetails: z
    .record(
      z.string().max(40),
      z.union([z.string().max(120), z.number(), z.boolean()])
    )
    .refine((obj) => Object.keys(obj).length <= 12, "Trop de détails de personnalisation.")
    .optional(),
});

export const createRestaurantOrderSchema = z
  .object({
    restaurantId: z.string().trim().min(1, "Restaurant cible requis."),
    restaurantName: z.string().trim().min(1).max(120),
    customerId: z.string().trim().min(1).optional(),
    customerName: z.string().trim().min(1).max(80).default("Client en salle"),
    customerPhone: z.string().trim().max(30).default("Sur place"),
    orderType: z.enum(["delivery", "pickup", "dine_in"]).default("dine_in"),
    tableNumber: z.string().trim().max(60).optional(),
    estimatedServeMinutes: z.number().int().min(5).max(180).default(20),
    deliveryAddress: z.string().trim().min(1).max(180),
    paymentMethod: z.enum(["mobile_money", "cash_on_delivery", "card"]).default("cash_on_delivery"),
    notes: z.string().trim().max(400).optional(),
    items: z
      .array(dineInOrderItemSchema)
      .min(1, "Veuillez ajouter au moins un plat à votre commande.")
      .max(100, "Maximum 100 lignes par commande."),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === "dine_in" && (!data.tableNumber || data.tableNumber.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tableNumber"],
        message: "Le numéro de table est requis pour commander sur place.",
      });
    }
  });

export const createDishSchema = z.object({
  restaurantId: z.string().trim().min(1, "Restaurant cible requis."),
  name: z.string().trim().min(2, "Nom du plat requis (2 caractères min).").max(100),
  description: z.string().trim().max(300).default(""),
  price: z.number().int().min(0, "Le prix ne peut pas être négatif.").max(500000, "Prix maximum dépassé."),
  category: z.string().trim().min(2).max(60).default("Plat Principal"),
  prepTimeMin: z.number().int().min(3).max(180).default(15),
  imageUrl: z.string().trim().max(300).optional(),
});

export const waiterCallSchema = z.object({
  restaurantId: z.string().trim().min(1, "Restaurant cible requis."),
  restaurantName: z.string().trim().max(120).optional(),
  customerId: z.string().trim().nullable().optional(),
  customerName: z.string().trim().min(1).max(80).default("Client en salle"),
  tableNumber: z
    .string()
    .trim()
    .min(1, "Veuillez indiquer votre numéro de table ou zone.")
    .max(60, "Numéro de table trop long."),
  requestType: z
    .enum(["call_waiter", "silent_request", "bill_request", "water_cutlery", "urgent_help"])
    .default("call_waiter"),
  message: z.string().trim().max(500, "Message trop long (500 caractères maximum).").optional(),
  isSilent: z.boolean().default(true),
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type CreateRestaurantOrderInput = z.infer<typeof createRestaurantOrderSchema>;
export type WaiterCallInput = z.infer<typeof waiterCallSchema>;
