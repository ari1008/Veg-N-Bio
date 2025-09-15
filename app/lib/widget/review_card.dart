import 'package:flutter/material.dart';
import '../model/ResourceType.dart';
import '../model/Review.dart';
import '../model/ReviewStatus.dart';
import 'star_rating.dart';

class ReviewCard extends StatelessWidget {
  final Review review;
  final bool showResourceInfo;
  final VoidCallback? onTap;
  final EdgeInsets? margin;

  const ReviewCard({
    Key? key,
    required this.review,
    this.showResourceInfo = false,
    this.onTap,
    this.margin,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: margin ?? const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // En-tête avec utilisateur et note
              _buildHeader(context, theme),

              const SizedBox(height: 12),

              // Commentaire si présent
              if (review.comment != null && review.comment!.isNotEmpty) ...[
                _buildComment(context, theme),
                const SizedBox(height: 12),
              ],

              // Informations de la ressource si demandé
              if (showResourceInfo) ...[
                _buildResourceInfo(context, theme),
                const SizedBox(height: 8),
              ],

              // Pied avec date et statut
              _buildFooter(context, theme),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, ThemeData theme) {
    return Row(
      children: [
        // Avatar utilisateur
        CircleAvatar(
          radius: 20,
          backgroundColor: theme.primaryColor.withOpacity(0.1),
          child: Icon(
            Icons.person,
            size: 20,
            color: theme.primaryColor,
          ),
        ),

        const SizedBox(width: 12),

        // Nom utilisateur (anonymisé) et note
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _getAnonymizedUserName(),
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              StarRating(
                rating: review.rating.toDouble(),
                size: 16,
                activeColor: Colors.amber,
              ),
            ],
          ),
        ),

        // Statut de modération
        _buildStatusChip(context, theme),
      ],
    );
  }

  Widget _buildComment(BuildContext context, ThemeData theme) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: theme.dividerColor.withOpacity(0.5),
        ),
      ),
      child: Text(
        review.comment!,
        style: theme.textTheme.bodyMedium?.copyWith(
          height: 1.4,
        ),
      ),
    );
  }

  Widget _buildResourceInfo(BuildContext context, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: theme.primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        '${_getResourceTypeLabel()} • ${review.resourceId}',
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.primaryColor,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildFooter(BuildContext context, ThemeData theme) {
    return Row(
      children: [
        // Date de création
        Icon(
          Icons.schedule,
          size: 14,
          color: theme.textTheme.bodySmall?.color,
        ),
        const SizedBox(width: 4),
        Text(
          _formatDate(review.createdAt),
          style: theme.textTheme.bodySmall,
        ),

        const Spacer(),

        if (review.state == ReviewsState.REJECTED && review.moderationReason != null) ...[
          Icon(
            Icons.info_outline,
            size: 14,
            color: Colors.red.shade600,
          ),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              review.moderationReason!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: Colors.red.shade600,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildStatusChip(BuildContext context, ThemeData theme) {
    Color chipColor;
    String chipLabel;
    IconData chipIcon;

    switch (review.state) {
      case ReviewsState.PENDING:
        chipColor = Colors.orange;
        chipLabel = 'En attente';
        chipIcon = Icons.hourglass_empty;
        break;
      case ReviewsState.APPROVED:
        chipColor = Colors.green;
        chipLabel = 'Approuvé';
        chipIcon = Icons.check_circle;
        break;
      case ReviewsState.REJECTED:
        chipColor = Colors.red;
        chipLabel = 'Rejeté';
        chipIcon = Icons.cancel;
        break;
      default:
        chipColor = Colors.grey;
        chipLabel = 'Inconnu';
        chipIcon = Icons.help_outline;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: chipColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: chipColor.withOpacity(0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            chipIcon,
            size: 12,
            color: chipColor,
          ),
          const SizedBox(width: 4),
          Text(
            chipLabel,
            style: theme.textTheme.bodySmall?.copyWith(
              color: chipColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  String _getAnonymizedUserName() {
    // Anonymiser l'ID utilisateur pour la vie privée
    final userId = review.userId;
    if (userId.length >= 8) {
      return 'Utilisateur ${userId.substring(0, 8)}***';
    }
    return 'Utilisateur anonyme';
  }

  String _getResourceTypeLabel() {
    switch (review.resourceType) {
      case ResourceType.RESTAURANT:
        return 'Restaurant';
      case ResourceType.DISH:
        return 'Plat';
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 0) {
      return '${difference.inDays}j';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}min';
    } else {
      return 'Maintenant';
    }
  }
}
