import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:vegbio/widget/star_rating.dart';

class InteractiveStarRating extends StatefulWidget {
  final double initialRating;
  final int maxRating;
  final double size;
  final Color? activeColor;
  final Color? inactiveColor;
  final Function(double) onRatingChanged;
  final EdgeInsets padding;
  final String? label;
  final bool showLabel;

  const InteractiveStarRating({
    Key? key,
    this.initialRating = 0.0,
    this.maxRating = 5,
    this.size = 32.0,
    this.activeColor,
    this.inactiveColor,
    required this.onRatingChanged,
    this.padding = EdgeInsets.zero,
    this.label,
    this.showLabel = true,
  }) : super(key: key);

  @override
  State<InteractiveStarRating> createState() => _InteractiveStarRatingState();
}

class _InteractiveStarRatingState extends State<InteractiveStarRating> {
  late double _currentRating;

  @override
  void initState() {
    super.initState();
    _currentRating = widget.initialRating;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.showLabel) ...[
          Text(
            widget.label ?? _getRatingLabel(),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
        ],
        StarRating(
          rating: _currentRating,
          maxRating: widget.maxRating,
          size: widget.size,
          activeColor: widget.activeColor,
          inactiveColor: widget.inactiveColor,
          readOnly: false,
          padding: widget.padding,
          onRatingChanged: (newRating) {
            setState(() {
              _currentRating = newRating;
            });
            widget.onRatingChanged(newRating);
          },
        ),
        if (widget.showLabel && _currentRating > 0) ...[
          const SizedBox(height: 4),
          Text(
            _getDescriptiveText(),
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: _getDescriptiveColor(),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
    );
  }

  String _getRatingLabel() {
    if (_currentRating == 0) {
      return 'Sélectionnez une note';
    }
    return 'Note: ${_currentRating.toInt()}/5';
  }

  String _getDescriptiveText() {
    switch (_currentRating.toInt()) {
      case 1:
        return 'Très décevant';
      case 2:
        return 'Décevant';
      case 3:
        return 'Correct';
      case 4:
        return 'Très bien';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  }

  Color _getDescriptiveColor() {
    switch (_currentRating.toInt()) {
      case 1:
      case 2:
        return Colors.red.shade600;
      case 3:
        return Colors.orange.shade600;
      case 4:
      case 5:
        return Colors.green.shade600;
      default:
        return Colors.grey.shade600;
    }
  }
}