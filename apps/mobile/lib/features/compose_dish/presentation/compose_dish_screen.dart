import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';

/// Écran interactif "Composer son plat"
class ComposeDishScreen extends StatefulWidget {
  const ComposeDishScreen({super.key});

  @override
  State<ComposeDishScreen> createState() => _ComposeDishScreenState();
}

class _ComposeDishScreenState extends State<ComposeDishScreen> {
  // Sélection des bases
  String _selectedBase = 'Pâte noire';
  int _basePrice = 500;

  final Map<String, int> _bases = {
    'Pâte noire': 500,
    'Pâte blanche (Akassa)': 400,
    'Pâte rouge (Amiwo)': 600,
    'Riz au gras': 800,
    'Atassi (Riz & Haricots)': 700,
    'Tapioca': 300,
  };

  // Sélection des sauces (obligatoire)
  String _selectedSauce = 'Sauce Gombo';
  final List<String> _sauces = [
    'Sauce Gombo',
    'Sauce Tomate fraîche',
    'Sauce Légumes (Gboma)',
    'Sauce Piment vert (Dja)',
    'Sauce Arachide',
  ];

  // Sélection des viandes / poissons
  final Set<String> _selectedProteins = {'Poisson braisé'};
  final Map<String, int> _proteins = {
    'Poisson braisé': 1000,
    'Viande de bœuf': 1200,
    'Poulet bicyclette': 1500,
    'Fromage local (Wagashi)': 500,
    'Crabes & Crevettes': 1800,
  };

  // Suppléments facultatifs
  final Set<String> _selectedExtras = {};
  final Map<String, int> _extras = {
    'Alloco (Banane plantain)': 400,
    'Œuf dur': 200,
    'Piment fort': 100,
    'Gari supplémentaire': 100,
  };

  int get _totalPrice {
    int total = _basePrice;
    for (final p in _selectedProteins) {
      total += _proteins[p] ?? 0;
    }
    for (final e in _selectedExtras) {
      total += _extras[e] ?? 0;
    }
    return total;
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
          'Composer son plat',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Bannière explicative
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: const [
                  Icon(Icons.restaurant, color: AppColors.primary),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Composez votre plat sur-mesure comme au maquis ou chez vous !',
                      style: TextStyle(
                        color: AppColors.primaryDark,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Étape 1 : Choisir la base
            _buildSectionTitle('1. Choisissez votre base', isRequired: true),
            ..._bases.entries.map((entry) {
              final isSelected = _selectedBase == entry.key;
              return _buildSelectableTile(
                title: entry.key,
                subtitle: CurrencyFormatter.format(entry.value),
                isSelected: isSelected,
                onTap: () {
                  setState(() {
                    _selectedBase = entry.key;
                    _basePrice = entry.value;
                  });
                },
              );
            }),
            const Divider(height: 32),

            // Étape 2 : Choisir la sauce
            _buildSectionTitle('2. Choisissez votre sauce', isRequired: true),
            ..._sauces.map((sauce) {
              final isSelected = _selectedSauce == sauce;
              return _buildSelectableTile(
                title: sauce,
                isSelected: isSelected,
                onTap: () {
                  setState(() => _selectedSauce = sauce);
                },
              );
            }),
            const Divider(height: 32),

            // Étape 3 : Viandes / Poissons
            _buildSectionTitle('3. Viande, Poisson ou Fromage', isRequired: false),
            ..._proteins.entries.map((entry) {
              final isChecked = _selectedProteins.contains(entry.key);
              return _buildCheckboxTile(
                title: entry.key,
                subtitle: '+ ${CurrencyFormatter.format(entry.value)}',
                isChecked: isChecked,
                onTap: () {
                  setState(() {
                    if (isChecked) {
                      _selectedProteins.remove(entry.key);
                    } else {
                      _selectedProteins.add(entry.key);
                    }
                  });
                },
              );
            }),
            const Divider(height: 32),

            // Étape 4 : Suppléments
            _buildSectionTitle('4. Suppléments & Extras', isRequired: false),
            ..._extras.entries.map((entry) {
              final isChecked = _selectedExtras.contains(entry.key);
              return _buildCheckboxTile(
                title: entry.key,
                subtitle: '+ ${CurrencyFormatter.format(entry.value)}',
                isChecked: isChecked,
                onTap: () {
                  setState(() {
                    if (isChecked) {
                      _selectedExtras.remove(entry.key);
                    } else {
                      _selectedExtras.add(entry.key);
                    }
                  });
                },
              );
            }),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total estimé', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  Text(
                    CurrencyFormatter.format(_totalPrice),
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        '$_selectedBase + $_selectedSauce ajouté au panier !',
                      ),
                      backgroundColor: AppColors.success,
                    ),
                  );
                  Navigator.of(context).pop();
                },
                icon: const Icon(Icons.shopping_bag_outlined),
                label: const Text('Ajouter au panier'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSelectableTile({
    required String title,
    String? subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryLight : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                color: isSelected ? AppColors.primary : Colors.grey,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              if (subtitle != null)
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCheckboxTile({
    required String title,
    required String subtitle,
    required bool isChecked,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: isChecked ? AppColors.primaryLight : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isChecked ? AppColors.primary : AppColors.border,
              width: isChecked ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                isChecked ? Icons.check_box : Icons.check_box_outline_blank,
                color: isChecked ? AppColors.primary : Colors.grey,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isChecked ? FontWeight.bold : FontWeight.normal,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Text(
                subtitle,
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, {required bool isRequired}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          if (isRequired)
            Container(
              margin: const EdgeInsets.only(left: 8),
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'Obligatoire',
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.red.shade700,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
