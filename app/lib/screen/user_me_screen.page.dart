import 'package:app/widget/custom_scaffold.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../model/UserMe.dart';
import '../shared/user_me_bloc/user_me_bloc.dart';

class UserMePage extends StatefulWidget {
  const UserMePage({super.key});

  @override
  State<UserMePage> createState() => _UserMePageState();
}

class _UserMePageState extends State<UserMePage> {
  static const Color primaryGreen = Color(0xFF4CAF50);
  static const Color accentGreen = Color(0xFF2E7D32);
  static const Color lightGreen = Color(0xFFE8F5E8);
  static const Color infoBlue = Color(0xFF64B5F6);
  static const Color lightBlue = Color(0xFFE3F2FD);
  static const Color warningRed = Color(0xFFE57373);
  static const Color lightRed = Color(0xFFFFEBEE);

  @override
  void initState() {
    super.initState();
    // Charge les infos utilisateur au montage
    context.read<UserMeBloc>().add(FetchUserMeEvent());
  }

  Future<void> _refresh() async {
    context.read<UserMeBloc>().add(FetchUserMeEvent());
  }

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      title: '👤 Mon compte',
      body: BlocConsumer<UserMeBloc, UserMeState>(
        listener: (context, state) {
          if (state.status == UserMeStatus.error &&
              state.errorMessage != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.errorMessage!),
                backgroundColor: warningRed,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            );
          }
        },
        builder: (context, state) {
          if (state.status == UserMeStatus.loading) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(primaryGreen),
              ),
            );
          }

          if (state.status == UserMeStatus.error && state.userMe == null) {
            return _ErrorView(onRetry: _refresh);
          }

          final user = state.userMe;
          if (user == null) {
            // Cas improbable, mais on gère proprement
            return _ErrorView(
                onRetry: _refresh,
                message: "Impossible d'afficher vos informations.");
          }

          return RefreshIndicator(
            color: primaryGreen,
            onRefresh: _refresh,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // En-tête profil
                  _ProfileHeader(user: user),
                  const SizedBox(height: 16),
                  // Carte d'infos
                  _InfoCard(user: user),
                  const SizedBox(height: 16),
                  // Fidélité
                  _FidelityCard(points: user.fidelity),
                  const SizedBox(height: 24),
                  // Bouton refresh manuel (en plus du pull-to-refresh)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: _refresh,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Actualiser'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: accentGreen,
                        side: const BorderSide(color: accentGreen),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ---------- Widgets privés ----------

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({required this.user});

  final UserMe user;

  String _initials() {
    final f =
        (user.firstName.isNotEmpty ? user.firstName[0] : '').toUpperCase();
    final l = (user.lastName.isNotEmpty ? user.lastName[0] : '').toUpperCase();
    return '$f$l'.isNotEmpty
        ? '$f$l'
        : (user.username.isNotEmpty ? user.username[0].toUpperCase() : '?');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _UserMePageState.lightGreen,
        borderRadius: BorderRadius.circular(16),
        border:
            Border.all(color: _UserMePageState.primaryGreen.withOpacity(0.25)),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: _UserMePageState.primaryGreen,
            child: Text(
              _initials(),
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${user.firstName} ${user.lastName}',
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: _UserMePageState.accentGreen),
                ),
                const SizedBox(height: 4),
                Text(
                  '@${user.username}',
                  style: TextStyle(color: Colors.grey[700]),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: _UserMePageState.accentGreen,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              user.role,
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.user});

  final UserMe user;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1.5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            _InfoTile(
              icon: Icons.badge_outlined,
              label: 'Nom',
              value: '${user.firstName} ${user.lastName}',
            ),
            const Divider(height: 8),
            _InfoTile(
              icon: Icons.alternate_email,
              label: 'Identifiant',
              value: user.username,
            ),
            const Divider(height: 8),
            _InfoTile(
              icon: Icons.email_outlined,
              label: 'Email',
              value: user.email,
              copyable: true,
            ),
            const Divider(height: 8),
            _InfoTile(
              icon: Icons.verified_user_outlined,
              label: 'Rôle',
              value: user.role,
            ),
          ],
        ),
      ),
    );
  }
}

class _FidelityCard extends StatelessWidget {
  const _FidelityCard({required this.points});

  final int points;

  @override
  Widget build(BuildContext context) {
    // Petites paliers visuels
    final level = points >= 200
        ? 'Platine'
        : points >= 120
            ? 'Or'
            : points >= 60
                ? 'Argent'
                : 'Bronze';

    final color = points >= 200
        ? Colors.blueGrey
        : points >= 120
            ? const Color(0xFFFFD54F)
            : points >= 60
                ? const Color(0xFFB0BEC5)
                : const Color(0xFFCD7F32);

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: _UserMePageState.lightBlue,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _UserMePageState.infoBlue.withOpacity(0.3)),
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          const Icon(Icons.card_membership, color: _UserMePageState.infoBlue),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Programme de fidélité — $level',
              style: const TextStyle(
                color: Colors.black87,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '$points pts',
              style: const TextStyle(
                  color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
    this.copyable = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool copyable;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: _UserMePageState.accentGreen),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                  )),
              const SizedBox(height: 2),
              Text(
                value,
                style:
                    const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
        if (copyable)
          IconButton(
            tooltip: 'Copier',
            icon: const Icon(Icons.copy, size: 18),
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: value));
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Email copié'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
          ),
      ],
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.onRetry, this.message});

  final VoidCallback onRetry;
  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline,
                color: _UserMePageState.warningRed, size: 40),
            const SizedBox(height: 12),
            Text(
              message ?? 'Une erreur est survenue.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Réessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _UserMePageState.primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

