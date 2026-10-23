import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../onboarding/presentation/onboarding_screen.dart';

/// Écran d'accueil Splash Screen (conforme à la maquette 150947.jpg)
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNext();
  }

  Future<void> _navigateToNext() async {
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => const OnboardingScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo marmite avec pointeur
            Container(
              width: 130,
              height: 130,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Icon(
                  Icons.restaurant_menu,
                  size: 70,
                  color: AppColors.primary,
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Nom de marque ClicBouffe
            const Text(
              'ClicBouffe',
              style: TextStyle(
                color: Colors.white,
                fontSize: 34,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
