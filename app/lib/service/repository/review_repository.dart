import '../../model/ResourceType.dart';
import '../../model/Review.dart';
import '../../model/CreateReview.dart';
import '../../model/ReviewStats.dart';
import '../../model/PaginatedReviews.dart';
import '../review_data_source/review_data_source.dart';

class ReviewRepository {
  final ReviewDataSource _remoteDataSource;

  ReviewRepository({
    required ReviewDataSource remoteDataSource,
  }) : _remoteDataSource = remoteDataSource;

  Future<Review> createReview(CreateReview createReview) async {
    try {
      _validateCreateReview(createReview);

      return await _remoteDataSource.createReview(createReview);
    } catch (e) {
      rethrow;
    }
  }

  Future<PaginatedReviews> getReviews(
      ResourceType resourceType,
      String resourceId, {
        int page = 0,
        int size = 20,
      }) async {
    try {
      if (page < 0) {
        throw ArgumentError('La page doit être >= 0');
      }
      if (size <= 0 || size > 100) {
        throw ArgumentError('La taille doit être entre 1 et 100');
      }

      return await _remoteDataSource.getReviews(
        resourceType,
        resourceId,
        page: page,
        size: size,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Review>> getAllReviews(
      ResourceType resourceType,
      String resourceId
      ) async {
    try {
      return await _remoteDataSource.getAllReviews(resourceType, resourceId);
    } catch (e) {
      rethrow;
    }
  }

  Future<ReviewStats> getReviewStats(
      ResourceType resourceType,
      String resourceId
      ) async {
    try {
      return await _remoteDataSource.getReviewStats(resourceType, resourceId);
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> userHasReviewed(
      String userId,
      ResourceType resourceType,
      String resourceId
      ) async {
    try {
      return await _remoteDataSource.userHasReviewed(
          userId,
          resourceType,
          resourceId
      );
    } catch (e) {
      return false;
    }
  }

  Future<ReviewSummary> getReviewSummary(
      ResourceType resourceType,
      String resourceId, {
        int page = 0,
        int size = 20,
      }) async {
    try {
      final futures = await Future.wait([
        getReviews(resourceType, resourceId, page: page, size: size),
        getReviewStats(resourceType, resourceId),
      ]);

      return ReviewSummary(
        reviews: futures[0] as PaginatedReviews,
        stats: futures[1] as ReviewStats,
      );
    } catch (e) {
      rethrow;
    }
  }

  void _validateCreateReview(CreateReview createReview) {
    if (createReview.userId.isEmpty) {
      throw ArgumentError('L\'ID utilisateur ne peut pas être vide');
    }

    if (createReview.resourceId.isEmpty) {
      throw ArgumentError('L\'ID de ressource ne peut pas être vide');
    }

    if (createReview.rating < 1 || createReview.rating > 5) {
      throw ArgumentError('La note doit être entre 1 et 5');
    }

    if (createReview.comment != null && createReview.comment!.length > 1000) {
      throw ArgumentError('Le commentaire ne peut pas dépasser 1000 caractères');
    }

    if (createReview.comment != null && createReview.comment!.trim().isEmpty) {
      throw ArgumentError('Le commentaire ne peut pas être vide');
    }
  }
}

class ReviewSummary {
  final PaginatedReviews reviews;
  final ReviewStats stats;

  ReviewSummary({
    required this.reviews,
    required this.stats,
  });

  @override
  String toString() {
    return 'ReviewSummary{totalReviews: ${reviews.totalElements}, averageRating: ${stats.averageRating}}';
  }
}