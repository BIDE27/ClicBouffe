"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  QrCode,
  X,
  Flashlight,
  Camera,
  Upload,
  UtensilsCrossed,
  Store,
  CheckCircle2,
  Sparkles,
  Search,
} from "lucide-react";
import { DishItem, Restaurant, INITIAL_GRID_DISHES, REGIONAL_RESTAURANTS } from "@/lib/data/clicbouffe-data";
import { hapticFeedback } from "@/lib/native/haptics";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanDish: (dish: DishItem) => void;
  onScanRestaurant: (restaurant: Restaurant) => void;
}

export function QrScannerModal({
  isOpen,
  onClose,
  onScanDish,
  onScanRestaurant,
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [manualCode, setManualCode] = useState("");
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);

  // Initialisation et gestion du flux vidéo caméra
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (isOpen) {
      if (!navigator?.mediaDevices?.getUserMedia) {
        return;
      }

      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        .then(async (stream) => {
          if (isCancelled) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute("playsinline", "true");
            await videoRef.current.play().catch(() => {});
            setHasCamera(true);
            setCameraError(null);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setHasCamera(false);
            setCameraError("Accès caméra refusé ou indisponible.");
          }
        });
    } else {
      stopCamera();
    }

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [isOpen, facingMode, stopCamera]);

  // Bascule torche
  const toggleTorch = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (track && "applyConstraints" in track) {
      try {
        const newTorch = !isTorchOn;
        await (track as MediaStreamTrack & { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: newTorch }],
        });
        setIsTorchOn(newTorch);
        hapticFeedback("light");
      } catch {
        // Torche non supportée sur cette caméra
      }
    }
  };

  // Bascule caméra avant/arrière
  const toggleCameraFacing = () => {
    hapticFeedback("light");
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Traitement du résultat scanné
  const handleRecognizedPayload = (payload: string) => {
    hapticFeedback("success");
    const cleanPayload = payload.trim().toLowerCase();

    // Recherche d'un restaurant correspondant
    const matchedRestaurant = REGIONAL_RESTAURANTS.find((r) => {
      const nameMatch = cleanPayload.includes(r.name.toLowerCase());
      const idMatch = cleanPayload.includes(r.id.toLowerCase());
      const categoryMatch = cleanPayload.includes(r.categoryId.toLowerCase());
      return nameMatch || idMatch || categoryMatch;
    });

    if (matchedRestaurant) {
      setScanSuccessMessage(`Menu détecté : ${matchedRestaurant.name}`);
      setTimeout(() => {
        onScanRestaurant(matchedRestaurant);
        onClose();
      }, 400);
      return;
    }

    // Recherche d'un plat correspondant
    const matchedDish = INITIAL_GRID_DISHES.find((d) => {
      const nameMatch = cleanPayload.includes(d.name.toLowerCase());
      const idMatch = cleanPayload === d.id || cleanPayload === `dish:${d.id}`;
      return nameMatch || idMatch;
    });

    if (matchedDish) {
      setScanSuccessMessage(`Plat détecté : ${matchedDish.name}`);
      setTimeout(() => {
        onScanDish(matchedDish);
        onClose();
      }, 400);
      return;
    }

    // Si code générique ou inconnu, par défaut afficher le restaurant phare
    const defaultRestaurant = REGIONAL_RESTAURANTS[0];
    setScanSuccessMessage(`Menu de table : ${defaultRestaurant.name}`);
    setTimeout(() => {
      onScanRestaurant(defaultRestaurant);
      onClose();
    }, 400);
  };

  // Traitement fichier importé
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleRecognizedPayload(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* En-tête de la modale */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/50">
              <QrCode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2
                id="qr-scanner-title"
                className="text-base font-black text-slate-900 dark:text-white"
              >
                Scanner un QR Code
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Menu de table ou plat ClicBouffe
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            aria-label="Fermer le scanner"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Corps défilable */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Zone de visée Caméra */}
          <div className="relative w-full aspect-square max-h-64 sm:max-h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center select-none shadow-inner">
            {/* Vidéo en direct */}
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                hasCamera ? "opacity-100" : "opacity-0"
              }`}
              muted
              playsInline
            />

            {/* Viseur de cadrage avec coins et ligne laser animée */}
            <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 flex flex-col justify-between p-2">
              {/* Coin haut-gauche */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00AFF2] rounded-tl-xl" />
              {/* Coin haut-droit */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#00AFF2] rounded-tr-xl" />
              {/* Coin bas-gauche */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#00AFF2] rounded-bl-xl" />
              {/* Coin bas-droit */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00AFF2] rounded-br-xl" />

              {/* Ligne laser animée de balayage */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#00AFF2] to-transparent shadow-[0_0_8px_#00AFF2] animate-bounce my-auto" />
            </div>

            {/* Message de succès après scan */}
            {scanSuccessMessage && (
              <div className="absolute inset-0 z-20 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <p className="text-white font-bold text-sm">{scanSuccessMessage}</p>
                <p className="text-emerald-300 text-xs mt-1">Ouverture immédiate en cours...</p>
              </div>
            )}

            {/* État si caméra indisponible / simulation visuelle */}
            {!hasCamera && !scanSuccessMessage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-gradient-to-b from-slate-900/90 to-slate-950/95">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                  <Camera className="w-6 h-6 stroke-[1.8]" />
                </div>
                <p className="text-white text-xs font-bold">Viseur de détection actif</p>
                <p className="text-slate-400 text-[11px] mt-1 max-w-xs">
                  {cameraError || "Pointez vers le code QR de table ou utilisez un accès direct ci-dessous."}
                </p>
              </div>
            )}

            {/* Contrôles du viseur (Torche, Caméra, Import) */}
            <div className="absolute bottom-2.5 inset-x-3 z-20 flex items-center justify-between">
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isTorchOn
                    ? "bg-amber-400 text-slate-950"
                    : "bg-black/50 hover:bg-black/70 text-white"
                }`}
                title="Bascule torche"
              >
                <Flashlight className="w-4 h-4" />
                <span className="hidden sm:inline">Torche</span>
              </button>

              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Changer de caméra"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Caméra</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Importer une image de QR code"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Importer</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Accès Démo Rapide / QR de Table et Plats en 1 Clic */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00AFF2]" />
                <span>Tester un QR Code Partenaire</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">1 clic</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Preset 1 : Restaurant Maquis du Port */}
              <button
                type="button"
                onClick={() => handleRecognizedPayload("Le Maquis du Port")}
                className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-[#00AFF2] dark:hover:border-[#00AFF2] text-left flex items-center gap-2.5 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00AFF2] transition-colors">
                    Le Maquis du Port
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Menu complet du restaurant
                  </p>
                </div>
              </button>

              {/* Preset 2 : Plat Pâte Noire */}
              <button
                type="button"
                onClick={() => handleRecognizedPayload("Pâte noire")}
                className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-[#00AFF2] dark:hover:border-[#00AFF2] text-left flex items-center gap-2.5 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00AFF2] transition-colors">
                    Pâte noire Télibo
                  </p>
                  <p className="text-[10px] text-[#00AFF2] font-semibold">
                    Plat 2 000 FCFA
                  </p>
                </div>
              </button>

              {/* Preset 3 : Restaurant Le Burger Béninois */}
              <button
                type="button"
                onClick={() => handleRecognizedPayload("Le Burger Béninois")}
                className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-[#00AFF2] dark:hover:border-[#00AFF2] text-left flex items-center gap-2.5 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-[#00AFF2] flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00AFF2] transition-colors">
                    Le Burger Béninois
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Menu burgers & frites
                  </p>
                </div>
              </button>

              {/* Preset 4 : Plat Tapioca Chaud */}
              <button
                type="button"
                onClick={() => handleRecognizedPayload("Tapioca chaud")}
                className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-[#00AFF2] dark:hover:border-[#00AFF2] text-left flex items-center gap-2.5 transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00AFF2] transition-colors">
                    Tapioca chaud
                  </p>
                  <p className="text-[10px] text-[#00AFF2] font-semibold">
                    Plat 100 FCFA
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Saisie manuelle de code QR / Lien */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label
              htmlFor="manual-qr-input"
              className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Ou saisir directement le libellé ou lien QR :
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="manual-qr-input"
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ex: Le Maquis du Port, Pâte noire..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#00AFF2]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualCode.trim()) {
                      handleRecognizedPayload(manualCode);
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (manualCode.trim()) {
                    handleRecognizedPayload(manualCode);
                  }
                }}
                disabled={!manualCode.trim()}
                className="px-3.5 py-2 bg-[#00AFF2] hover:bg-[#009bd6] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Scanner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
