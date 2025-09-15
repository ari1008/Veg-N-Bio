import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class CompactRating extends StatelessWidget {
  final double averageRating;
  final int totalReviews;
  final double starSize;
  final TextStyle? textStyle;
  final Color? starColor;

  const CompactRating({
    Key? key,
    required this.averageRating,
    required this.totalReviews,
    this.starSize = 16.0,
    this.textStyle,
    this.starColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveTextStyle = textStyle ?? theme.textTheme.bodyMedium;
    final effectiveStarColor = starColor ?? Colors.amber;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.star,
          size: starSize,
          color: effectiveStarColor,
        ),
        const SizedBox(width: 4),
        Text(
          averageRating.toStringAsFixed(1),
          style: effectiveTextStyle?.copyWith(fontWeight: FontWeight.w600),
        ),
        const SizedBox(width: 4),
        Text(
          '($totalReviews)',
          style: effectiveTextStyle?.copyWith(
            color: theme.textTheme.bodySmall?.color,
          ),
        ),
      ],
    );
  }
}