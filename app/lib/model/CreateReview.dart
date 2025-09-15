import 'ResourceType.dart';

class CreateReview {
  final String userId;
  final ResourceType resourceType;
  final String resourceId;
  final int rating;
  final String? comment;

  CreateReview({
    required this.userId,
    required this.resourceType,
    required this.resourceId,
    required this.rating,
    this.comment,
  });

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'resourceType': resourceType.name,
      'resourceId': resourceId,
      'rating': rating,
      'comment': comment,
    };
  }

  @override
  String toString() {
    return 'CreateReview{userId: $userId, resourceType: $resourceType, resourceId: $resourceId, rating: $rating}';
  }
}