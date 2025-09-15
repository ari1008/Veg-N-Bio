import 'package:flutter/material.dart';
import '../model/Review.dart';
import '../model/ReviewStatus.dart';
import 'star_rating.dart';

class CompactReviewCard extends StatelessWidget {
  final Review review;
  final VoidCallback? onTap;

  const CompactReviewCard({
    Key? key,
    required this.review,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      elevation: 1,
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          radius: 16,
          backgroundColor: theme.primaryColor.withOpacity(0.1),
          child: Icon(
            Icons.person,
            size: 16,
            color: theme.primaryColor,
          ),
        ),
        title: Row(
          children: [
            StarRating(
              rating: review.rating.toDouble(),
              size: 14,
              activeColor: Colors.amber,
            ),
            const SizedBox(width: 8),
            Text(
              _formatDate(review.createdAt),
              style: theme.textTheme.bodySmall,
            ),
          ],
        ),
        subtitle: review.comment != null && review.comment!.isNotEmpty
            ? Text(
          review.comment!,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        )
            : null,
        trailing: _buildStatusIcon(theme),
      ),
    );
  }

  Widget _buildStatusIcon(ThemeData theme) {
    switch (review.state) {
      case ReviewsState.PENDING:
        return Icon(Icons.hourglass_empty, size: 16, color: Colors.orange);
      case ReviewsState.APPROVED:
        return Icon(Icons.check_circle, size: 16, color: Colors.green);
      case ReviewsState.REJECTED:
        return Icon(Icons.cancel, size: 16, color: Colors.red);
      default:
      // Cas par défaut pour éviter le retour null
        return Icon(Icons.help_outline, size: 16, color: Colors.grey);
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