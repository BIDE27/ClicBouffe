import 'package:intl/intl.dart';

/// Utilitaire de formatage monétaire strict en Franc CFA (FCFA)
/// Respecte la norme d'espacement insécable d'AGENTS.md.
class CurrencyFormatter {
  CurrencyFormatter._();

  static final NumberFormat _formatter = NumberFormat.currency(
    locale: 'fr_FR',
    symbol: 'FCFA',
    decimalDigits: 0,
    customPattern: '#,##0\u00A0\u00A4',
  );

  /// Formate un montant entier en FCFA (ex: 1 000 FCFA)
  static String format(int amount) {
    return _formatter.format(amount);
  }

  /// Formate un montant avec le format court utilisé dans les boutons (ex: 1 000 F CFA)
  static String formatButton(int amount) {
    final formattedNumber = NumberFormat('#,##0', 'fr_FR').format(amount);
    return '$formattedNumber F CFA';
  }
}
