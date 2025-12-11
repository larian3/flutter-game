import 'package:flutter/material.dart';
import '../services/game_service.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  final GameService _gameService = GameService();
  bool _isLoading = true;
  List<dynamic> _leaderboard = [];
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadLeaderboard();
  }

  Future<void> _loadLeaderboard() async {
    setState(() {
      _isLoading = true;
      _error = '';
    });

    final result = await _gameService.getLeaderboard(limit: 100);

    setState(() {
      _isLoading = false;
      if (result['success']) {
        _leaderboard = result['data']['leaderboard'] ?? [];
      } else {
        _error = result['error'];
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🏆 Leaderboard'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadLeaderboard,
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.blue.shade100, Colors.purple.shade100],
          ),
        ),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error.isNotEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 80, color: Colors.red),
                        const SizedBox(height: 16),
                        Text(
                          'Erro: $_error',
                          style: const TextStyle(fontSize: 18),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: _loadLeaderboard,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Tentar Novamente'),
                        ),
                      ],
                    ),
                  )
                : _leaderboard.isEmpty
                    ? const Center(
                        child: Text(
                          'Nenhuma pontuação ainda.\nSeja o primeiro a jogar!',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 18),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _leaderboard.length,
                        itemBuilder: (context, index) {
                          final entry = _leaderboard[index];
                          final rank = entry['rank'];
                          final username = entry['username'];
                          final score = entry['score'];
                          final taps = entry['taps'];

                          Color rankColor;
                          IconData rankIcon;
                          
                          if (rank == 1) {
                            rankColor = Colors.amber;
                            rankIcon = Icons.emoji_events;
                          } else if (rank == 2) {
                            rankColor = Colors.grey.shade400;
                            rankIcon = Icons.emoji_events;
                          } else if (rank == 3) {
                            rankColor = Colors.brown.shade300;
                            rankIcon = Icons.emoji_events;
                          } else {
                            rankColor = Colors.deepPurple;
                            rankIcon = Icons.person;
                          }

                          return Card(
                            elevation: 4,
                            margin: const EdgeInsets.only(bottom: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.all(12),
                              leading: CircleAvatar(
                                backgroundColor: rankColor,
                                child: rank <= 3
                                    ? Icon(rankIcon, color: Colors.white)
                                    : Text(
                                        '$rank',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                              ),
                              title: Text(
                                username,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                              subtitle: Text('$taps toques'),
                              trailing: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.deepPurple,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  '$score pts',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}

