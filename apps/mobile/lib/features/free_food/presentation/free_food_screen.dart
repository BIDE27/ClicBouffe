import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../checkout/presentation/checkout_screen.dart';
import 'widgets/delivery_rates_modal.dart';
import 'widgets/dish_preview_dialog.dart';

/// Modèle pour les plats présentés
class FreeFoodDish {
  final String id;
  final String name;
  final int originalPrice;
  final bool isFree;
  final IconData icon;

  const FreeFoodDish({
    required this.id,
    required this.name,
    required this.originalPrice,
    required this.isFree,
    required this.icon,
  });
}

/// Écran "CHOIX DE LA BOUFFE GRATUITE" (conforme aux maquettes 151956, 152219, 152403.jpg)
class FreeFoodScreen extends StatefulWidget {
  const FreeFoodScreen({super.key});

  @override
  State<FreeFoodScreen> createState() => _FreeFoodScreenState();
}

class _FreeFoodScreenState extends State<FreeFoodScreen> {
  final List<FreeFoodDish> _dishes = const [
    FreeFoodDish(
      id: '1',
      name: 'Pâte noire',
      originalPrice: 200,
      isFree: true,
      icon: Icons.rice_bowl,
    ),
    FreeFoodDish(
      id: '2',
      name: 'Tapioca chaud',
      originalPrice: 100,
      isFree: true,
      icon: Icons.breakfast_dining,
    ),
    FreeFoodDish(
      id: '3',
      name: 'Gari au lait',
      originalPrice: 200,
      isFree: true,
      icon: Icons.local_drink,
    ),
    FreeFoodDish(
      id: '4',
      name: 'Pâte rouge',
      originalPrice: 200,
      isFree: true,
      icon: Icons.dinner_dining,
    ),
    FreeFoodDish(
      id: '5',
      name: 'Riz au gras',
      originalPrice: 1000,
      isFree: false,
      icon: Icons.set_meal,
    ),
    FreeFoodDish(
      id: '6',
      name: 'Amberger',
      originalPrice: 5000,
      isFree: false,
      icon: Icons.lunch_dining,
    ),
    FreeFoodDish(
      id: '7',
      name: 'Pâte blanche',
      originalPrice: 200,
      isFree: true,
      icon: Icons.rice_bowl_outlined,
    ),
    FreeFoodDish(
      id: '8',
      name: 'Chawarma',
      originalPrice: 1000,
      isFree: false,
      icon: Icons.fastfood,
    ),
  ];

  final Set<String> _selectedDishIds = {'1'}; // 'Pâte noire' sélectionné par défaut comme sur la maquette

  int get _totalAmount {
    int sum = 0;
    for (final dish in _dishes) {
      if (_selectedDishIds.contains(dish.id)) {
        if (!dish.isFree) {
          sum += dish.originalPrice;
        }
      }
    }
    return sum;
  }

  void _toggleDish(FreeFoodDish dish) {
    setState(() {
      if (_selectedDishIds.contains(dish.id)) {
        _selectedDishIds.remove(dish.id);
      } else {
        _selectedDishIds.add(dish.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'CHOIX DE LA BOUFFE GRATUITE',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        elevation: 0,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Texte explicatif
                RichText(
                  text: TextSpan(
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 13,
                      height: 1.4,
                    ),
                    children: [
                      const TextSpan(
                        text:
                            'Vous pouvez choisir une seule bouffe gratuite. Pour recevoir votre bouffe choisie, il ne vous suffira que de payer la livraison de cette dernière. ',
                      ),
                      TextSpan(
                        text: 'Lire plus...',
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // Bouton Tarif de livraison
                Align(
                  alignment: Alignment.centerRight,
                  child: InkWell(
                    onTap: () => DeliveryRatesModal.show(context),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Text(
                          'Tarif de livraison',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.menu, size: 16, color: AppColors.primary),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Grille des plats
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _dishes.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                    childAspectRatio: 0.85,
                  ),
                  itemBuilder: (context, index) {
                    final dish = _dishes[index];
                    final isSelected = _selectedDishIds.contains(dish.id);

                    return GestureDetector(
                      onTap: () => _toggleDish(dish),
                      onLongPress: () {
                        DishPreviewDialog.show(
                          context: context,
                          name: dish.name,
                          price: '${dish.originalPrice} F CFA',
                          icon: dish.icon,
                          onAdd: () {
                            if (!isSelected) _toggleDish(dish);
                          },
                        );
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected ? AppColors.primary : AppColors.border,
                            width: isSelected ? 2 : 1,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // En-tête 'Gratuit' si applicable
                            if (dish.isFree)
                              Padding(
                                padding: const EdgeInsets.only(top: 6, left: 10),
                                child: Text(
                                  'Gratuit',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ),

                            // Image du plat
                            Expanded(
                              child: Container(
                                margin: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  dish.icon,
                                  size: 48,
                                  color: AppColors.primary,
                                ),
                              ),
                            ),

                            // Bandeau bas (Nom + Prix) avec fond bleu si sélectionné
                            Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? AppColors.primary : Colors.white,
                                borderRadius: const BorderRadius.only(
                                  bottomLeft: Radius.circular(14),
                                  bottomRight: Radius.circular(14),
                                ),
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    dish.name,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: isSelected ? Colors.white : AppColors.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${dish.originalPrice} FCFA',
                                    style: TextStyle(
                                      fontSize: 12,
                                      decoration: dish.isFree
                                          ? TextDecoration.lineThrough
                                          : TextDecoration.none,
                                      color: isSelected
                                          ? Colors.white70
                                          : AppColors.textMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 20),
                Center(
                  child: TextButton(
                    onPressed: () {},
                    child: const Text(
                      'Voir plus de bouffes',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 14,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Bouton flottant de validation en bas à droite
          if (_selectedDishIds.isNotEmpty)
            Positioned(
              bottom: 20,
              right: 16,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  elevation: 4,
                ),
                onPressed: () {
                  final selectedList = _dishes
                      .where((d) => _selectedDishIds.contains(d.id))
                      .toList();
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => CheckoutScreen(
                        selectedDishes: selectedList,
                        totalAmount: _totalAmount,
                      ),
                    ),
                  );
                },
                iconAlignment: IconAlignment.end,
                label: Text(
                  '$_totalAmount F CFA (${_selectedDishIds.length})',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                icon: const Icon(Icons.send, size: 18),
              ),
            ),
        ],
      ),
    );
  }
}
