import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:vegbio/widget/review_form.dart';

import '../model/CreateReview.dart';
import '../model/ResourceType.dart';

class ReviewFormModal extends StatelessWidget {
  final ResourceType resourceType;
  final String resourceId;
  final String userId;
  final Function(CreateReview) onSubmit;
  final bool isLoading;
  final String? resourceName;

  const ReviewFormModal({
    Key? key,
    required this.resourceType,
    required this.resourceId,
    required this.userId,
    required this.onSubmit,
    this.isLoading = false,
    this.resourceName,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(20),
        ),
      ),
      child: SafeArea(
        child: ReviewForm(
          resourceType: resourceType,
          resourceId: resourceId,
          userId: userId,
          resourceName: resourceName,
          isLoading: isLoading,
          onSubmit: onSubmit,
          onCancel: () => Navigator.of(context).pop(),
        ),
      ),
    );
  }

  /// Méthode statique pour afficher le modal
  static Future<void> show({
    required BuildContext context,
    required ResourceType resourceType,
    required String resourceId,
    required String userId,
    required Function(CreateReview) onSubmit,
    bool isLoading = false,
    String? resourceName,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ReviewFormModal(
        resourceType: resourceType,
        resourceId: resourceId,
        userId: userId,
        onSubmit: onSubmit,
        isLoading: isLoading,
        resourceName: resourceName,
      ),
    );
  }
}