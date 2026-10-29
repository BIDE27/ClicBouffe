import 'package:flutter/material.dart';

/// Palette de couleurs officielle de ClicBouffe extraite au pixel près des maquettes.
class AppColors {
  AppColors._();

  /// Bleu primaire officiel ClicBouffe (#00AFF2 / RGB 0, 175, 242)
  static const Color primary = Color(0xFF00AFF2);

  /// Nuance primaire plus foncée pour le texte ou le focus
  static const Color primaryDark = Color(0xFF008CC2);

  /// Nuance primaire très claire pour les fonds d'étiquettes
  static const Color primaryLight = Color(0xFFE5F7FE);

  /// Couleur de fond principale de l'application
  static const Color background = Color(0xFFF9FAFB);

  /// Couleur de fond des cartes et modales
  static const Color surface = Colors.white;

  /// Texte principal (très sombre)
  static const Color textPrimary = Color(0xFF1E293B);

  /// Texte secondaire (gris moyen pour descriptions et sous-titres)
  static const Color textSecondary = Color(0xFF64748B);

  /// Gris clair pour les prix barrés et placeholders
  static const Color textMuted = Color(0xFF94A3B8);

  /// Bordures et séparateurs
  static const Color border = Color(0xFFE2E8F0);

  /// Couleur d'erreur ou d'annulation
  static const Color error = Color(0xFFEF4444);

  /// Couleur de succès ou de validation
  static const Color success = Color(0xFF10B981);
}
