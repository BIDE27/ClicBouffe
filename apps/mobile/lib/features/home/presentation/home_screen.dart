import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../compose_dish/presentation/compose_dish_screen.dart';
import '../../free_food/presentation/free_food_screen.dart';
import 'widgets/free_food_dialog.dart';

/// Écran 5 : Accueil principal (conforme au pixel près à la capture 151615.jpg)
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentNavIndex = 0;

  // Liste des plats de la grille inférieure (2 lignes x 3 colonnes)
  final List<Map<String, String>> _interestDishes = const [
    {
      'name': 'Pâte noire',
      'price': '2 000 FCFA',
      'image': 'assets/images/dish_pate_noire.png',
    },
    {
      'name': 'Tapioca chaud',
      'price': '100 FCFA',
      'image': 'assets/images/dish_tapioca.png',
    },
    {
      'name': 'Chawarma',
      'price': '1 000 FCFA',
      'image': 'assets/images/dish_chawarma.png',
    },
    {
      'name': 'Pâte blanche',
      'price': '200 FCFA',
      'image': 'assets/images/dish_pate_blanche.png',
    },
    {
      'name': 'Gari au lait',
      'price': '200 FCFA',
      'image': 'assets/images/dish_gari.png',
    },
    {
      'name': 'Pâte rouge',
      'price': '1 000 FCFA',
      'image': 'assets/images/dish_pate_rouge.png',
    },
  ];

  @override
  void initState() {
    super.initState();
    // Affichage de la modale de bienvenue cadeau selon le flow
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(milliseconds: 900), () {
        if (mounted) {
          FreeFoodDialog.show(context);
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      // 1. APP BAR
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 16,
        title: const Text(
          'ClicBouffe',
          style: TextStyle(
            color: AppColors.primary,
            fontSize: 22,
            fontWeight: FontWeight.w900,
            letterSpacing: -0.2,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined, color: Colors.black87, size: 24),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.search, color: Colors.black87, size: 24),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.menu, color: Colors.black87, size: 24),
            onPressed: () {},
          ),
        ],
      ),

      // 2. CORPS DE LA PAGE
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),

            // CARROUSEL SUPÉRIEUR (Plats en vedette : Spaghetti - Amberger - Poisson)
            SizedBox(
              height: 155,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  // Carte gauche partielle (Spaghetti)
                  _buildPartialCard(
                    child: Container(
                      width: 50,
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Center(
                        child: Icon(Icons.dinner_dining, color: Colors.orange, size: 30),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Carte centrale principale : Amberger (5 000 FCFA)
                  Container(
                    width: 200,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: Colors.grey.shade200),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.06),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      children: [
                        // Image du Amberger
                        Expanded(
                          child: Container(
                            width: double.infinity,
                            color: Colors.black,
                            child: Image.asset(
                              'assets/images/amberger_banner.png',
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        // Détails (Nom & Prix)
                        Container(
                          width: double.infinity,
                          color: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Column(
                            children: const [
                              Text(
                                'Amberger',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: Colors.black,
                                ),
                              ),
                              SizedBox(height: 1),
                              Text(
                                '5 000 FCFA',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Carte droite partielle (Poisson grillé)
                  _buildPartialCard(
                    child: Container(
                      width: 50,
                      decoration: BoxDecoration(
                        color: Colors.teal.shade50,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Center(
                        child: Icon(Icons.set_meal, color: Colors.teal, size: 30),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // TITRE DE SECTION
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'Plats pouvant vous intéresser',
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF222222),
                ),
              ),
            ),
            const SizedBox(height: 8),

            // GRILLE DES PLATS (2 lignes x 3 colonnes)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _interestDishes.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 0.85,
                ),
                itemBuilder: (context, index) {
                  final dish = _interestDishes[index];
                  return InkWell(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const FreeFoodScreen(),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.grey.shade200),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Image du plat
                          Expanded(
                            child: Container(
                              color: Colors.grey.shade50,
                              child: Image.asset(
                                dish['image']!,
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
                          // Libellé et prix
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
                            child: Column(
                              children: [
                                Text(
                                  dish['name']!,
                                  textAlign: TextAlign.center,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black,
                                  ),
                                ),
                                const SizedBox(height: 1),
                                Text(
                                  dish['price']!,
                                  style: const TextStyle(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black87,
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
            ),

            const SizedBox(height: 90), // Espace pour la barre de navigation
          ],
        ),
      ),

      // 3. BOUTON FLOTTANT CENTRAL : (+) "Composer plat"
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.4),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const ComposeDishScreen(),
                    ),
                  );
                },
                child: const Center(
                  child: Icon(Icons.add, color: Colors.white, size: 32),
                ),
              ),
            ),
          ),
          const SizedBox(height: 2),
          const Text(
            'Composer plat',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 4),
        ],
      ),

      // 4. BARRE DE NAVIGATION INFÉRIEURE
      bottomNavigationBar: Container(
        height: 60,
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade200, width: 1)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(
              index: 0,
              icon: Icons.home,
              label: 'Accueil',
              isActive: _currentNavIndex == 0,
            ),
            _buildNavItem(
              index: 1,
              icon: Icons.smart_display_outlined,
              label: 'Explorer',
              isActive: _currentNavIndex == 1,
            ),
            // Espace réservé pour le bouton central flottant (+)
            const SizedBox(width: 70),
            _buildNavItem(
              index: 2,
              icon: Icons.access_time_outlined,
              label: 'Plus tard',
              isActive: _currentNavIndex == 2,
            ),
            _buildNavItem(
              index: 3,
              icon: Icons.calendar_today_outlined,
              label: 'Abonnements',
              isActive: _currentNavIndex == 3,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPartialCard({required Widget child}) {
    return Opacity(
      opacity: 0.6,
      child: child,
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
    required bool isActive,
  }) {
    return InkWell(
      onTap: () => setState(() => _currentNavIndex = index),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 22,
              color: isActive ? AppColors.primary : Colors.black87,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 9.5,
                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                color: isActive ? AppColors.primary : Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
