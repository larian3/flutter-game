class ApiConfig {
  static const String baseUrl = 'http://localhost:3000/api';
  
  // Auth endpoints
  static const String register = '$baseUrl/auth/register';
  static const String login = '$baseUrl/auth/login';
  
  // Game endpoints
  static const String submitScore = '$baseUrl/game/score';
  static const String leaderboard = '$baseUrl/game/leaderboard';
  static const String userStats = '$baseUrl/game/stats';
  static const String globalStats = '$baseUrl/game/global-stats';
}

