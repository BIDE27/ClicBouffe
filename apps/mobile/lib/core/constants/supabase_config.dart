/// Configuration de connexion au projet Supabase ClicBouffe.
/// Seule la clé publique (anon) est autorisée dans l'application mobile
/// conformément aux règles strictes de sécurité d'AGENTS.md.
class SupabaseConfig {
  SupabaseConfig._();

  static const String url = 'https://nudmiaaypwfysobcrzvb.supabase.co';
  static const String anonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZG1pYWF5cHdmeXNvYmNyenZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODQyMTcsImV4cCI6MjEwODI2MDIxN30.SfaeAudXX24Pq6jsfDNBYjgCZwr7KJ7txjbXRNaElng';
}
