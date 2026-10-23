import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../free_food/presentation/free_food_screen.dart';

/// Écran de finalisation de commande (conforme à la maquette 152446.jpg)
class CheckoutScreen extends StatefulWidget {
  final List<FreeFoodDish> selectedDishes;
  final int totalAmount;

  const CheckoutScreen({
    super.key,
    required this.selectedDishes,
    required this.totalAmount,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _deliveryAddress = 'Terrain Zico';
  String _recipient = 'Moi seul(e)';
  bool _isPlatsExpanded = true;

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
          'Finalisation',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        actions: [
          // Badge montant en haut à droite (+ 0 F)
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                const Icon(Icons.add_circle, size: 16, color: AppColors.primary),
                const SizedBox(width: 4),
                Text(
                  '${widget.totalAmount} F',
                  style: const TextStyle(
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Étape 1 : Plats choisis
            _buildStep1Plats(),
            const SizedBox(height: 16),

            // Étape 2 : Lieu de livraison
            _buildStepCard(
              stepNumber: '2',
              title: 'Lieu de livraison',
              icon: Icons.location_on_outlined,
              value: _deliveryAddress,
              onTap: () {
                _showEditDialog(
                  title: 'Modifier le lieu de livraison',
                  currentValue: _deliveryAddress,
                  onSaved: (val) => setState(() => _deliveryAddress = val),
                );
              },
            ),
            const SizedBox(height: 16),

            // Étape 3 : Destinataires
            _buildStepCard(
              stepNumber: '3',
              title: 'Destinataires',
              icon: Icons.group_outlined,
              value: _recipient,
              onTap: () {
                _showRecipientSelector();
              },
            ),
            const SizedBox(height: 36),

            // Bouton de confirmation
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  _showOrderSuccessModal();
                },
                child: const Text('Confirmer la commande'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep1Plats() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // En-tête bleu de l'étape 1
          InkWell(
            onTap: () {
              setState(() => _isPlatsExpanded = !_isPlatsExpanded);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: const BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(15),
                  topRight: Radius.circular(15),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Text(
                        '1',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Icon(Icons.restaurant, color: Colors.white, size: 18),
                  const SizedBox(width: 6),
                  const Text(
                    'Plats : ',
                    style: TextStyle(color: Colors.white, fontSize: 14),
                  ),
                  Text(
                    widget.selectedDishes.isNotEmpty
                        ? widget.selectedDishes.first.name
                        : 'Aucun plat',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const Spacer(),
                  Icon(
                    _isPlatsExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    color: Colors.white,
                  ),
                ],
              ),
            ),
          ),

          // Contenu déroulant
          if (_isPlatsExpanded)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // Plat affiché
                  if (widget.selectedDishes.isNotEmpty)
                    Container(
                      width: 130,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Stack(
                        children: [
                          Column(
                            children: [
                              Container(
                                height: 80,
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  borderRadius: const BorderRadius.only(
                                    topLeft: Radius.circular(14),
                                    topRight: Radius.circular(14),
                                  ),
                                ),
                                child: Center(
                                  child: Icon(
                                    widget.selectedDishes.first.icon,
                                    size: 40,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                decoration: const BoxDecoration(
                                  color: AppColors.primary,
                                  borderRadius: BorderRadius.only(
                                    bottomLeft: Radius.circular(14),
                                    bottomRight: Radius.circular(14),
                                  ),
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      widget.selectedDishes.first.name,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                    Text(
                                      '${widget.selectedDishes.first.originalPrice} FCFA',
                                      style: const TextStyle(
                                        color: Colors.white70,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          // Bouton croix
                          Positioned(
                            top: 4,
                            right: 4,
                            child: GestureDetector(
                              onTap: () => Navigator.of(context).pop(),
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.3),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.close, size: 14, color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(width: 16),

                  // Bouton (+) Ajouter
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      width: 100,
                      height: 110,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.add, size: 36, color: Colors.grey),
                          SizedBox(height: 6),
                          Text(
                            'Ajouter',
                            style: TextStyle(color: Colors.grey, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStepCard({
    required String stepNumber,
    required String title,
    required IconData icon,
    required String value,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Container(
              width: 26,
              height: 26,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  stepNumber,
                  style: const TextStyle(
                    color: Colors.grey,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              '$title ',
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
            ),
            Icon(icon, size: 18, color: Colors.grey.shade600),
            const Text(' : ', style: TextStyle(color: AppColors.textPrimary)),
            Expanded(
              child: Text(
                value,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: AppColors.textPrimary,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const Icon(Icons.keyboard_arrow_down, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  void _showEditDialog({
    required String title,
    required String currentValue,
    required ValueChanged<String> onSaved,
  }) {
    final controller = TextEditingController(text: currentValue);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              onSaved(controller.text);
              Navigator.of(ctx).pop();
            },
            child: const Text('Enregistrer'),
          ),
        ],
      ),
    );
  }

  void _showRecipientSelector() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Moi seul(e)'),
              trailing: _recipient == 'Moi seul(e)'
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () {
                setState(() => _recipient = 'Moi seul(e)');
                Navigator.of(ctx).pop();
              },
            ),
            ListTile(
              title: const Text('Famille / Groupe'),
              trailing: _recipient == 'Famille / Groupe'
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () {
                setState(() => _recipient = 'Famille / Groupe');
                Navigator.of(ctx).pop();
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showOrderSuccessModal() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('Commande Enregistrée !'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle_outline, color: AppColors.success, size: 64),
            const SizedBox(height: 14),
            Text(
              'Votre commande pour $_deliveryAddress a bien été prise en compte. Un livreur vous contactera très vite !',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).popUntil((route) => route.isFirst);
            },
            child: const Text('Retour à l\'accueil'),
          ),
        ],
      ),
    );
  }
}
