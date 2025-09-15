import 'ResourceType.dart';
import 'ReviewStatus.dart';

class Review {
  final String id;
  final String userId;
  final ResourceType resourceType;
  final String resourceId;
  final int rating;
  final ReviewsState state;
  final String? comment;
  final String? moderatedBy;
  final DateTime? moderatedAt;
  final String? moderationReason;
  final DateTime createdAt;
  final DateTime updatedAt;

  Review({
    required this.id,
    required this.userId,
    required this.resourceType,
    required this.resourceId,
    required this.rating,
    this.comment,
    this.moderatedBy,
    this.moderatedAt,
    this.moderationReason,
    required this.createdAt,
    required this.updatedAt,
    required this.state,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      userId: json['userId'],
      resourceType: ResourceType.values.byName(json['resourceType']),
      resourceId: json['resourceId'],
      rating: json['rating'],
      comment: json['comment'],
      state: ReviewsState.values.byName(json['status']),
      moderatedBy: json['moderatedBy'],
      moderatedAt: json['moderatedAt'] != null
          ? DateTime.parse(json['moderatedAt'])
          : null,
      moderationReason: json['moderationReason'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'resourceType': resourceType.name,
      'resourceId': resourceId,
      'rating': rating,
      'comment': comment,
      'state': state.name,
      'moderatedBy': moderatedBy,
      'moderatedAt': moderatedAt?.toIso8601String(),
      'moderationReason': moderationReason,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  @override
  String toString() {
    return 'Review{id: $id, rating: $rating, resourceType: $resourceType, status: $state}';
  }
}