import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../home/presentation/home_screen.dart';

/// Modèle pour chaque étape de l'onboarding
class OnboardingStep {
  final String imagePath;
  final String title;
  final String description;

  const OnboardingStep({
    required this.imagePath,
    required this.title,
    required this.description,
  });
}

/// Écrans 2, 3, 4 : Onboarding en 3 étapes (conforme aux captures 151155, 151227 et 151522.jpg)
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  final List<OnboardingStep> _steps = const [
    OnboardingStep(
      imagePath: 'assets/images/onboarding_1.png',
      title: 'Des plats familiers',
      description:
          'Composez à votre convenance des plats que vous avez l\'habitude de manger chez vous et qui ne sont pas forcément accessibles dans les restaurants.',
    ),
    OnboardingStep(
      imagePath: 'assets/images/onboarding_2.png',
      title: 'Des plats courants',
      description:
          'Des plats plus ou moins bourgeois que vous trouvez souvent dans les restaurants ou que vous cuisinez à la maison.',
    ),
    OnboardingStep(
      imagePath: 'assets/images/onboarding_3.png',
      title: 'Des plats soutenus\net exotiques',
      description:
          'Des plats bourgeois que vous et votre famille mangez pour votre plaisir.',
    ),
  ];

  void _finish() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 300),
        pageBuilder: (_, animation, _) => FadeTransition(
          opacity: animation,
          child: const HomeScreen(),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Contenu paginé (Image + Titre + Description)
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _steps.length,
                onPageChanged: (index) {
                  setState(() => _currentIndex = index);
                },
                itemBuilder: (context, index) {
                  final step = _steps[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Illustration des 3 plats en triangle
                        Image.asset(
                          step.imagePath,
                          height: 200,
                          fit: BoxFit.contain,
                        ),
                        const SizedBox(height: 36),

                        // Titre du slide
                        Text(
                          step.title,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Colors.black,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Description
                        Text(
                          step.description,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 13.5,
                            color: Color(0xFF222222),
                            height: 1.45,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Indicateurs de pagination (3 cercles comme sur la maquette)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _steps.length,
                (index) {
                  final isCurrent = _currentIndex == index;
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 6),
                    width: 9,
                    height: 9,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isCurrent ? AppColors.primary : Colors.transparent,
                      border: Border.all(
                        color: isCurrent ? AppColors.primary : Colors.black87,
                        width: 1.2,
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 36),

            // Barre inférieure de navigation : [<]  [ SAUTER / COMMENCER ]  [>]
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: SizedBox(
                height: 48,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Flèche gauche (<)
                    SizedBox(
                      width: 48,
                      child: _currentIndex > 0
                          ? IconButton(
                              padding: EdgeInsets.zero,
                              icon: const Icon(
                                Icons.chevron_left,
                                size: 38,
                                color: Colors.black,
                              ),
                              onPressed: () {
                                _pageController.previousPage(
                                  duration: const Duration(milliseconds: 250),
                                  curve: Curves.easeInOut,
                                );
                              },
                            )
                          : const SizedBox.shrink(),
                    ),

                    // Bouton central : SAUTER ou COMMENCER
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 12),
                      ),
                      onPressed: () {
                        if (_currentIndex == _steps.length - 1) {
                          _finish();
                        } else {
                          _finish();
                        }
                      },
                      child: Text(
                        _currentIndex == _steps.length - 1 ? 'COMMENCER' : 'SAUTER',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),

                    // Flèche droite (>)
                    SizedBox(
                      width: 48,
                      child: _currentIndex < _steps.length - 1
                          ? IconButton(
                              padding: EdgeInsets.zero,
                              icon: const Icon(
                                Icons.chevron_right,
                                size: 38,
                                color: Colors.black,
                              ),
                              onPressed: () {
                                _pageController.nextPage(
                                  duration: const Duration(milliseconds: 250),
                                  curve: Curves.easeInOut,
                                );
                              },
                            )
                          : const SizedBox.shrink(),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
