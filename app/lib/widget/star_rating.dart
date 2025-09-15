import 'package:flutter/material.dart';

class StarRating extends StatelessWidget {
  final double rating;
  final int maxRating;
  final double size;
  final Color? activeColor;
  final Color? inactiveColor;
  final bool allowHalfRating;
  final bool readOnly;
  final Function(double)? onRatingChanged;
  final EdgeInsets padding;

  const StarRating({
    Key? key,
    required this.rating,
    this.maxRating = 5,
    this.size = 24.0,
    this.activeColor,
    this.inactiveColor,
    this.allowHalfRating = false,
    this.readOnly = true,
    this.onRatingChanged,
    this.padding = EdgeInsets.zero,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveActiveColor = activeColor ?? Colors.amber;
    final effectiveInactiveColor = inactiveColor ?? Colors.grey.shade300;

    return Padding(
      padding: padding,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(maxRating, (index) {
          return GestureDetector(
            onTap: readOnly ? null : () => _handleTap(index + 1),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: size * 0.05),
              child: Icon(
                _getStarIcon(index + 1),
                size: size,
                color: _getStarColor(index + 1, effectiveActiveColor, effectiveInactiveColor),
              ),
            ),
          );
        }),
      ),
    );
  }

  IconData _getStarIcon(int position) {
    if (allowHalfRating) {
      if (position <= rating) {
        return Icons.star;
      } else if (position - 0.5 <= rating) {
        return Icons.star_half;
      } else {
        return Icons.star_border;
      }
    } else {
      return position <= rating ? Icons.star : Icons.star_border;
    }
  }

  Color _getStarColor(int position, Color activeColor, Color inactiveColor) {
    if (allowHalfRating) {
      if (position <= rating || (position - 0.5 <= rating)) {
        return activeColor;
      } else {
        return inactiveColor;
      }
    } else {
      return position <= rating ? activeColor : inactiveColor;
    }
  }

  void _handleTap(int newRating) {
    if (onRatingChanged != null) {
      onRatingChanged!(newRating.toDouble());
    }
  }
}