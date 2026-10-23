import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

/// Modal des tarifs de livraison (conforme à la maquette 152247.jpg)
class DeliveryRatesModal extends StatelessWidget {
  const DeliveryRatesModal({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (_) => const DeliveryRatesModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // En-tête avec bouton fermer
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 24),
                const Text(
                  'TARIF DE LIVRAISON',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade200,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, size: 16, color: Colors.grey),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1),

            // Lignes du tableau tarifaire
            _buildRateRow('Entre 1F et 200F', '80 F CFA'),
            const Divider(height: 1),
            _buildRateRow('Entre 03 et 05 plats', '130 F CFA'),
            const Divider(height: 1),
            _buildRateRow('Entre 06 et 10 plats', '170 F CFA'),
            const Divider(height: 1),
            _buildRateRow('Plus de 10 plats', 'Gratuit', isHighlighted: true),
            const Divider(height: 1),
            const SizedBox(height: 16),

            // Lien politique d'utilisation
            InkWell(
              onTap: () {},
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.info, size: 16, color: AppColors.primary),
                  SizedBox(width: 6),
                  Text(
                    'Politique d\'utilisation et conditions',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRateRow(String label, String price, {bool isHighlighted = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            price,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isHighlighted ? AppColors.success : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
