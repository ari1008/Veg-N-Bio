import '../../model/Review.dart';
import '../../model/ReviewStats.dart';

enum ReviewStatus {
  initial,
  loading,
  success,
  failure,
  creating,
  created,
  createFailure,
  loadingMore,
  loadMoreFailure,
}

class ReviewState {
  final ReviewStatus status;
  final List<Review> reviews;
  final ReviewStats? stats;
  final String? errorMessage;
  final bool hasReachedMax;
  final int currentPage;
  final int totalPages;
  final int totalElements;
  final bool userHasReviewed;
  final Review? lastCreatedReview;
  final String? currentDishId;

  const ReviewState({
    this.status = ReviewStatus.initial,
    this.reviews = const [],
    this.stats,
    this.errorMessage,
    this.hasReachedMax = false,
    this.currentPage = 0,
    this.totalPages = 0,
    this.totalElements = 0,
    this.userHasReviewed = false,
    this.lastCreatedReview,
    this.currentDishId,
  });

  ReviewState copyWith({
    ReviewStatus? status,
    List<Review>? reviews,
    ReviewStats? stats,
    String? errorMessage,
    bool? hasReachedMax,
    int? currentPage,
    int? totalPages,
    int? totalElements,
    bool? userHasReviewed,
    Review? lastCreatedReview,
    bool clearError = false,
    bool clearLastCreated = false,
    String? currentDishId,
    bool clearStats = false, // AJOUTÉ: pour pouvoir reset les stats
  }) {
    return ReviewState(
      status: status ?? this.status,
      reviews: reviews ?? this.reviews,
      stats: clearStats ? null : (stats ?? this.stats), // FIXED: Gestion du reset stats
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
      totalElements: totalElements ?? this.totalElements,
      userHasReviewed: userHasReviewed ?? this.userHasReviewed,
      lastCreatedReview: clearLastCreated ? null : (lastCreatedReview ?? this.lastCreatedReview),
      currentDishId: currentDishId ?? this.currentDishId,
    );
  }

  @override
  String toString() {
    return '''ReviewState {
      status: $status,
      reviewsCount: ${reviews.length},
      hasReachedMax: $hasReachedMax,
      currentPage: $currentPage,
      totalPages: $totalPages,
      totalElements: $totalElements,
      userHasReviewed: $userHasReviewed,
      errorMessage: $errorMessage,
      stats: $stats,
      currentDishId: $currentDishId
    }''';
  }

  // Helpers UI
  bool get isLoading => status == ReviewStatus.loading;
  bool get isLoadingMore => status == ReviewStatus.loadingMore;
  bool get isCreating => status == ReviewStatus.creating;
  bool get hasError => status == ReviewStatus.failure || status == ReviewStatus.createFailure || status == ReviewStatus.loadMoreFailure;
  bool get hasData => reviews.isNotEmpty;
  bool get isEmpty => reviews.isEmpty && status == ReviewStatus.success;
  bool get canLoadMore => !hasReachedMax && currentPage < totalPages - 1;
  bool get isInitial => status == ReviewStatus.initial;
  bool get wasJustCreated => status == ReviewStatus.created && lastCreatedReview != null;

  String get contextualErrorMessage {
    switch (status) {
      case ReviewStatus.createFailure:
        return errorMessage ?? "Erreur lors de la création de l'avis";
      case ReviewStatus.loadMoreFailure:
        return errorMessage ?? "Erreur lors du chargement d'avis supplémentaires";
      case ReviewStatus.failure:
        return errorMessage ?? "Erreur lors du chargement des avis";
      default:
        return errorMessage ?? "Une erreur est survenue";
    }
  }
}