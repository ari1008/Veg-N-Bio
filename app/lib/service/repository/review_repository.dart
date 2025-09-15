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

  /// Créer un nouvel avis
  ///
  /// Lance une exception si :
  /// - L'utilisateur a déjà laissé un avis pour cette ressource
  /// - La ressource n'existe pas
  /// - Les données sont invalides
  Future<Review> createReview(CreateReview createReview) async {
    try {
      // Validation locale avant l'envoi
      _validateCreateReview(createReview);

      return await _remoteDataSource.createReview(createReview);
    } catch (e) {
      // Re-lancer l'exception pour que la couche supérieure la gère
      rethrow;
    }
  }

  /// Récupérer les avis paginés pour une ressource
  Future<PaginatedReviews> getReviews(
      ResourceType resourceType,
      String resourceId, {
        int page = 0,
        int size = 20,
      }) async {
    try {
      // Validation des paramètres
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

  /// Récupérer tous les avis pour une ressource (attention à la performance)
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

  /// Récupérer les statistiques d'avis pour une ressource
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

  /// Vérifier si un utilisateur a déjà laissé un avis
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
      // Si erreur, on considère qu'il n'a pas d'avis (comportement défensif)
      return false;
    }
  }

  /// Récupérer avis + stats en une seule opération
  Future<ReviewSummary> getReviewSummary(
      ResourceType resourceType,
      String resourceId, {
        int page = 0,
        int size = 20,
      }) async {
    try {
      // Appels parallèles pour optimiser les performances
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

  /// Validation locale des données avant envoi
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

/// Classe utilitaire pour combiner avis et stats
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