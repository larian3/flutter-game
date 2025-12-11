import 'package:flutter/material.dart';
import 'dart:math';
import '../services/game_service.dart';
import '../services/auth_service.dart';
import 'leaderboard_screen.dart';
import 'login_screen.dart';

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> with SingleTickerProviderStateMixin {
  int _score = 0;
  int _bestScore = 0;
  int _timeLeft = 30;
  bool _isPlaying = false;
  int _tapsCount = 0;
  late AnimationController _animationController;
  final Random _random = Random();
  final GameService _gameService = GameService();
  final AuthService _authService = AuthService();
  String _username = '';
  
  double _targetX = 0.5;
  double _targetY = 0.5;
  Color _targetColor = Colors.red;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _loadUserData();
    _loadBestScore();
  }

  Future<void> _loadUserData() async {
    final username = await _authService.getUsername();
    setState(() {
      _username = username ?? 'Jogador';
    });
  }

  Future<void> _loadBestScore() async {
    final result = await _gameService.getUserStats();
    if (result['success']) {
      final stats = result['data']['stats'];
      setState(() {
        _bestScore = stats['bestScore'] ?? 0;
      });
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _startGame() {
    setState(() {
      _score = 0;
      _tapsCount = 0;
      _timeLeft = 30;
      _isPlaying = true;
    });
    _moveTarget();
    _startTimer();
  }

  void _startTimer() {
    Future.delayed(const Duration(seconds: 1), () {
      if (_isPlaying && _timeLeft > 0) {
        setState(() {
          _timeLeft--;
        });
        _startTimer();
      } else if (_timeLeft == 0) {
        _endGame();
      }
    });
  }

  Future<void> _endGame() async {
    setState(() {
      _isPlaying = false;
    });

    // Enviar pontuação para a API
    final result = await _gameService.submitScore(_score, _tapsCount, 30);
    
    if (result['success']) {
      // Atualizar melhor pontuação se necessário
      if (_score > _bestScore) {
        setState(() {
          _bestScore = _score;
        });
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Pontuação salva com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Erro: ${result['error']}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _moveTarget() {
    setState(() {
      _targetX = _random.nextDouble() * 0.8 + 0.1;
      _targetY = _random.nextDouble() * 0.7 + 0.1;
      _targetColor = Color.fromRGBO(
        _random.nextInt(256),
        _random.nextInt(256),
        _random.nextInt(256),
        1,
      );
    });
  }

  void _onTargetTap() {
    if (!_isPlaying) return;
    
    _animationController.forward().then((_) {
      _animationController.reverse();
    });

    setState(() {
      _score += 10;
      _tapsCount++;
    });
    _moveTarget();
  }

  Future<void> _logout() async {
    await _authService.logout();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text('🎮 Tap Game - $_username'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.leaderboard),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const LeaderboardScreen()),
              );
            },
            tooltip: 'Ver Ranking',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Sair',
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.blue.shade100,
              Colors.purple.shade100,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Painel de informações
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _InfoCard(
                      icon: Icons.stars,
                      label: 'Pontuação',
                      value: _score.toString(),
                      color: Colors.orange,
                    ),
                    _InfoCard(
                      icon: Icons.timer,
                      label: 'Tempo',
                      value: _timeLeft.toString(),
                      color: Colors.blue,
                    ),
                    _InfoCard(
                      icon: Icons.emoji_events,
                      label: 'Recorde',
                      value: _bestScore.toString(),
                      color: Colors.amber,
                    ),
                  ],
                ),
              ),
              // Área do jogo
              Expanded(
                child: _isPlaying
                    ? Stack(
                        children: [
                          Positioned(
                            left: MediaQuery.of(context).size.width * _targetX - 30,
                            top: MediaQuery.of(context).size.height * _targetY - 80,
                            child: GestureDetector(
                              onTap: _onTargetTap,
                              child: ScaleTransition(
                                scale: Tween<double>(begin: 1.0, end: 0.8).animate(_animationController),
                                child: Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    color: _targetColor,
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: _targetColor.withOpacity(0.5),
                                        blurRadius: 20,
                                        spreadRadius: 5,
                                      ),
                                    ],
                                  ),
                                  child: const Center(
                                    child: Icon(
                                      Icons.touch_app,
                                      color: Colors.white,
                                      size: 30,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      )
                    : Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.videogame_asset,
                              size: 100,
                              color: Colors.deepPurple.shade300,
                            ),
                            const SizedBox(height: 20),
                            Text(
                              _score > 0
                                  ? 'Fim de Jogo!\nPontuação: $_score\n✅ Salvo no servidor!'
                                  : 'Toque nos círculos o mais rápido possível!',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.deepPurple,
                              ),
                            ),
                            const SizedBox(height: 40),
                            ElevatedButton.icon(
                              onPressed: _startGame,
                              icon: const Icon(Icons.play_arrow, size: 32),
                              label: const Text(
                                'JOGAR',
                                style: TextStyle(fontSize: 24),
                              ),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 40,
                                  vertical: 20,
                                ),
                                backgroundColor: Colors.deepPurple,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(30),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _InfoCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade600,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

