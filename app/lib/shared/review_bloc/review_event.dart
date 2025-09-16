import '../../model/CreateReview.dart';
import '../../model/ResourceType.dart';

abstract class ReviewEvent {
  const ReviewEvent();
}

/// Événement pour créer un nouvel avis
class CreateReviewEvent extends ReviewEvent {
  final CreateReview createReview;

  const CreateReviewEvent(this.createReview);

  @override
  String toString() => 'CreateReviewEvent { createReview: $createReview }';
}

/// Événement pour charger les avis d'une ressource
class LoadReviewsEvent extends ReviewEvent {
  final ResourceType resourceType;
  final String resourceId;
  final int page;
  final int size;
  final bool refresh; // Pour forcer le rechargement

  const LoadReviewsEvent({
    required this.resourceType,
    required this.resourceId,
    this.page = 0,
    this.size = 20,
    this.refresh = false,
  });

  @override
  String toString() => 'LoadReviewsEvent { resourceType: $resourceType, resourceId: $resourceId, page: $page }';
}

/// Événement pour charger plus d'avis (pagination)
class LoadMoreReviewsEvent extends ReviewEvent {
  final ResourceType resourceType;
  final String resourceId;
  final int nextPage;
  final int size;

  const LoadMoreReviewsEvent({
    required this.resourceType,
    required this.resourceId,
    required this.nextPage,
    this.size = 20,
  });

  @override
  String toString() => 'LoadMoreReviewsEvent { nextPage: $nextPage }';
}

/// Événement pour charger les statistiques d'avis
class LoadReviewStatsEvent extends ReviewEvent {
  final ResourceType resourceType;
  final String resourceId;

  const LoadReviewStatsEvent({
    required this.resourceType,
    required this.resourceId,
  });

  @override
  String toString() => 'LoadReviewStatsEvent { resourceType: $resourceType, resourceId: $resourceId }';
}

/// Événement pour vérifier si l'utilisateur a déjà laissé un avis
class CheckUserReviewEvent extends ReviewEvent {
  final String userId;
  final ResourceType resourceType;
  final String resourceId;

  const CheckUserReviewEvent({
    required this.userId,
    required this.resourceType,
    required this.resourceId,
  });

  @override
  String toString() => 'CheckUserReviewEvent { userId: $userId, resourceType: $resourceType, resourceId: $resourceId }';
}

/// Événement pour réinitialiser l'état des avis
class ResetReviewsEvent extends ReviewEvent {
  const ResetReviewsEvent();

  @override
  String toString() => 'ResetReviewsEvent';
}

class SetCurrentDishEvent extends ReviewEvent {
  final String? dishId;
  const SetCurrentDishEvent(this.dishId);

  @override
  String toString() => 'SetCurrentDishEvent { dishId: $dishId }';
}

/// NEW: charger rapidement les avis d’un plat spécifique (taille réduite)
class LoadDishReviewsEvent extends ReviewEvent {
  final String dishId;
  final int size;

  const LoadDishReviewsEvent({
    required this.dishId,
    this.size = 3,
  });

  @override
  String toString() => 'LoadDishReviewsEvent { dishId: $dishId, size: $size }';
}