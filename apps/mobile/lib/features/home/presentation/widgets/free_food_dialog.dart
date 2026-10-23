import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../free_food/presentation/free_food_screen.dart';

/// Modale de bienvenue "BOUFFE GRATUITE" (conforme à la maquette 151714.jpg)
class FreeFoodDialog extends StatelessWidget {
  const FreeFoodDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      barrierDismissible: true,
      builder: (_) => const FreeFoodDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Bouton fermeture (croix)
            Align(
              alignment: Alignment.topRight,
              child: GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.close, size: 18, color: Colors.grey),
                ),
              ),
            ),
            const SizedBox(height: 8),

            // Titre
            const Text(
              'BOUFFE GRATUITE',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 20),

            // Illustration paquet / boisson
            Container(
              width: 140,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(
                Icons.card_giftcard,
                size: 64,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 20),

            // Badge 100% GRATUIT
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                '100% GRATUIT',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Texte explicatif
            const Text(
              'Profitez d\'une bouffe 100% gratuite comme cadeau de bienvenue. Faites votre premier pas gratuitement dans un monde libre en civilisation culinaire.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),

            // Bouton Profiter
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const FreeFoodScreen(),
                    ),
                  );
                },
                child: const Text('Profiter'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
