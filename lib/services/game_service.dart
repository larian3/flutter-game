import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

class GameService {
  final AuthService _authService = AuthService();

  Future<Map<String, dynamic>> submitScore(int score, int taps, int duration) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'error': 'Usuário não autenticado'};
      }

      final response = await http.post(
        Uri.parse(ApiConfig.submitScore),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'score': score,
          'taps': taps,
          'duration': duration,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data};
      } else {
        final error = jsonDecode(response.body);
        return {'success': false, 'error': error['error'] ?? 'Erro ao enviar pontuação'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Erro de conexão: $e'};
    }
  }

  Future<Map<String, dynamic>> getLeaderboard({int limit = 100}) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'error': 'Usuário não autenticado'};
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.leaderboard}?limit=$limit'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': 'Erro ao buscar leaderboard'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Erro de conexão: $e'};
    }
  }

  Future<Map<String, dynamic>> getUserStats() async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'error': 'Usuário não autenticado'};
      }

      final response = await http.get(
        Uri.parse(ApiConfig.userStats),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'error': 'Erro ao buscar estatísticas'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Erro de conexão: $e'};
    }
  }
}

