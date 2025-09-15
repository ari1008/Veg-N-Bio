import 'package:flutter/material.dart';

import '../model/CreateReview.dart';
import '../model/ResourceType.dart';
import 'interactive_star_rating.dart';

class ReviewForm extends StatefulWidget {
  final ResourceType resourceType;
  final String resourceId;
  final String userId;
  final Function(CreateReview) onSubmit;
  final VoidCallback? onCancel;
  final bool isLoading;
  final String? resourceName;

  const ReviewForm({
    Key? key,
    required this.resourceType,
    required this.resourceId,
    required this.userId,
    required this.onSubmit,
    this.onCancel,
    this.isLoading = false,
    this.resourceName,
  }) : super(key: key);

  @override
  State<ReviewForm> createState() => _ReviewFormState();
}

class _ReviewFormState extends State<ReviewForm> {
  final _formKey = GlobalKey<FormState>();
  final _commentController = TextEditingController();

  double _rating = 0;
  bool _isValid = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          // En-tête avec titre
          _buildHeader(context, theme),

          const SizedBox(height: 24),

          // Information sur la ressource
          if (widget.resourceName != null) ...[
            _buildResourceInfo(context, theme),
            const SizedBox(height: 24),
          ],

          // Sélection de la note
          _buildRatingSection(context, theme),

          const SizedBox(height: 24),

          // Champ commentaire
          _buildCommentSection(context, theme),

          const SizedBox(height: 32),

          // Boutons d'action
          _buildActionButtons(context, theme),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, ThemeData theme) {
    return Column(
      children: [
        Icon(
          widget.resourceType == ResourceType.RESTAURANT
              ? Icons.restaurant
              : Icons.restaurant_menu,
          size: 48,
          color: theme.primaryColor,
        ),
        const SizedBox(height: 12),
        Text(
          'Laissez votre avis',
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          'Votre avis sera vérifié avant publication',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.textTheme.bodySmall?.color,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildResourceInfo(BuildContext context, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.primaryColor.withOpacity(0.2),
        ),
      ),
      child: Row(
        children: [
          Icon(
            widget.resourceType == ResourceType.RESTAURANT
                ? Icons.location_on
                : Icons.restaurant_menu,
            color: theme.primaryColor,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getResourceTypeLabel(),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.primaryColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  widget.resourceName!,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRatingSection(BuildContext context, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.dividerColor.withOpacity(0.5),
        ),
      ),
      child: Column(
        children: [
          Text(
            'Quelle note donnez-vous ?',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          InteractiveStarRating(
            initialRating: _rating,
            size: 40,
            onRatingChanged: (newRating) {
              setState(() {
                _rating = newRating;
                _updateFormValidity();
              });
            },
          ),
          if (_rating > 0) ...[
            const SizedBox(height: 12),
            Text(
              _getRatingDescription(),
              style: theme.textTheme.bodyLarge?.copyWith(
                color: _getRatingColor(),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCommentSection(BuildContext context, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Ajoutez un commentaire (optionnel)',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: _commentController,
          maxLines: 4,
          maxLength: 1000,
          decoration: InputDecoration(
            hintText: 'Partagez votre expérience...',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: theme.dividerColor.withOpacity(0.5),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: theme.primaryColor,
                width: 2,
              ),
            ),
            contentPadding: const EdgeInsets.all(16),
          ),
          onChanged: (value) {
            _updateFormValidity();
          },
          validator: (value) {
            if (value != null &&
                value.trim().isNotEmpty &&
                value.trim().length < 5) {
              return 'Le commentaire doit contenir au moins 5 caractères';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context, ThemeData theme) {
    return Row(
      children: [
        if (widget.onCancel != null) ...[
          Expanded(
            child: OutlinedButton(
              onPressed: widget.isLoading ? null : widget.onCancel,
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Annuler'),
            ),
          ),
          const SizedBox(width: 16),
        ],
        Expanded(
          child: ElevatedButton(
            onPressed: _isValid && !widget.isLoading ? _submitForm : null,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: widget.isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    'Publier l\'avis',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  void _updateFormValidity() {
    setState(() {
      _isValid = _rating > 0;
    });
  }

  void _submitForm() {
    if (_formKey.currentState?.validate() ?? false) {
      final comment = _commentController.text.trim();

      final createReview = CreateReview(
        userId: widget.userId,
        resourceType: widget.resourceType,
        resourceId: widget.resourceId,
        rating: _rating.toInt(),
        comment: comment.isNotEmpty ? comment : null,
      );

      widget.onSubmit(createReview);
    }
  }

  String _getResourceTypeLabel() {
    switch (widget.resourceType) {
      case ResourceType.RESTAURANT:
        return 'RESTAURANT';
      case ResourceType.DISH:
        return 'PLAT';
    }
  }

  String _getRatingDescription() {
    switch (_rating.toInt()) {
      case 1:
        return 'Très décevant 😞';
      case 2:
        return 'Décevant 😐';
      case 3:
        return 'Correct 🙂';
      case 4:
        return 'Très bien 😊';
      case 5:
        return 'Excellent ! 🤩';
      default:
        return '';
    }
  }

  Color _getRatingColor() {
    switch (_rating.toInt()) {
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
