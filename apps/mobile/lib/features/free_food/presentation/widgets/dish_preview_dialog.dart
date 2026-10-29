import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

/// Pop-up détail/aperçu d'un plat sélectionné (conforme à la maquette 152030.jpg)
class DishPreviewDialog extends StatelessWidget {
  final String name;
  final String price;
  final String? image;
  final IconData? icon;
  final VoidCallback onAdd;

  const DishPreviewDialog({
    super.key,
    required this.name,
    required this.price,
    this.image,
    this.icon,
    required this.onAdd,
  });

  static Future<void> show({
    required BuildContext context,
    required String name,
    required String price,
    String? image,
    IconData? icon,
    required VoidCallback onAdd,
  }) {
    return showDialog(
      context: context,
      builder: (_) => DishPreviewDialog(
        name: name,
        price: price,
        image: image,
        icon: icon,
        onAdd: onAdd,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Illustration / Image du plat
          Stack(
            children: [
              Container(
                height: 190,
                width: double.infinity,
                color: Colors.white,
                child: image != null
                    ? Image.asset(
                        image!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => Icon(
                          icon ?? Icons.fastfood,
                          size: 70,
                          color: AppColors.primary,
                        ),
                      )
                    : Icon(
                        icon ?? Icons.fastfood,
                        size: 70,
                        color: AppColors.primary,
                      ),
              ),
              // Bandeau transparent en haut avec Nom et Prix
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  color: Colors.black.withValues(alpha: 0.65),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        price,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Barre d'actions inférieure : Ajouter & À propos
          Container(
            color: const Color(0xFF333333),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                InkWell(
                  onTap: () {
                    Navigator.of(context).pop();
                    onAdd();
                  },
                  child: Row(
                    children: const [
                      Text(
                        'Ajouter',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      SizedBox(width: 6),
                      Icon(Icons.check_circle, color: AppColors.primary, size: 18),
                    ],
                  ),
                ),
                Container(width: 1, height: 20, color: Colors.white24),
                InkWell(
                  onTap: () {},
                  child: Row(
                    children: const [
                      Text(
                        'A propos',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      SizedBox(width: 6),
                      Icon(Icons.info, color: AppColors.primary, size: 18),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
