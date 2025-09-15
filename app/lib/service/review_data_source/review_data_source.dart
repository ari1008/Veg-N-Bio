import '../../model/ResourceType.dart';
import '../../model/Review.dart';
import '../../model/CreateReview.dart';
import '../../model/ReviewStats.dart';
import '../../model/PaginatedReviews.dart';

abstract class ReviewDataSource {
  /// Créer un nouvel avis
  Future<Review> createReview(CreateReview createReview);

  /// Récupérer les avis paginés pour une ressource
  Future<PaginatedReviews> getReviews(
      ResourceType resourceType,
      String resourceId, {
        int page = 0,
        int size = 20,
      });

  /// Récupérer tous les avis pour une ressource
  Future<List<Review>> getAllReviews(
      ResourceType resourceType,
      String resourceId
      );

  /// Récupérer les statistiques d'avis pour une ressource
  Future<ReviewStats> getReviewStats(
      ResourceType resourceType,
      String resourceId
      );

  /// Vérifier si un utilisateur a déjà laissé un avis
  Future<bool> userHasReviewed(
      String userId,
      ResourceType resourceType,
      String resourceId
      );
}