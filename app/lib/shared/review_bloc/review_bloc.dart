// lib/shared/review_bloc/review_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../model/PaginatedReviews.dart';
import '../../model/ResourceType.dart';
import '../../model/ReviewStats.dart';
import '../../service/repository/review_repository.dart';
import '../../model/CreateReview.dart';
import 'review_event.dart';
import 'review_state.dart';

class ReviewBloc extends Bloc<ReviewEvent, ReviewState> {
  final ReviewRepository _reviewRepository;

  ReviewBloc({
    required ReviewRepository reviewRepository,
  })  : _reviewRepository = reviewRepository,
        super(const ReviewState()) {
    on<CreateReviewEvent>(_onCreateReview);
    on<LoadReviewsEvent>(_onLoadReviews);
    on<LoadMoreReviewsEvent>(_onLoadMoreReviews);
    on<LoadReviewStatsEvent>(_onLoadReviewStats);
    on<CheckUserReviewEvent>(_onCheckUserReview);
    on<ResetReviewsEvent>(_onResetReviews);
  }

  /// Gestionnaire pour créer un avis
  Future<void> _onCreateReview(
      CreateReviewEvent event,
      Emitter<ReviewState> emit,
      ) async {
    emit(state.copyWith(status: ReviewStatus.creating, clearError: true));

    try {
      final newReview = await _reviewRepository.createReview(event.createReview);

      emit(state.copyWith(
        status: ReviewStatus.created,
        lastCreatedReview: newReview,
        userHasReviewed: true,
        reviews: [newReview, ...state.reviews],
        totalElements: state.totalElements + 1,
      ));
    } catch (error) {
      emit(state.copyWith(
        status: ReviewStatus.createFailure,
        errorMessage: error.toString(),
      ));
    }
  }

  Future<void> _onLoadReviews(
      LoadReviewsEvent event,
      Emitter<ReviewState> emit,
      ) async {
    if (event.refresh || state.isInitial) {
      emit(state.copyWith(
        status: ReviewStatus.loading,
        reviews: [],
        currentPage: 0,
        hasReachedMax: false,
        clearError: true,
      ));
    }

    try {
      // Charger les avis et les stats en parallèle
      final futures = await Future.wait([
        _reviewRepository.getReviews(
          event.resourceType,
          event.resourceId,
          page: event.page,
          size: event.size,
        ),
        _reviewRepository.getReviewStats(
          event.resourceType,
          event.resourceId,
        ),
      ]);

      final paginatedReviews = futures[0] as PaginatedReviews;
      final stats = futures[1] as ReviewStats;

      emit(state.copyWith(
        status: ReviewStatus.success,
        reviews: paginatedReviews.content,
        stats: stats,
        currentPage: paginatedReviews.currentPage,
        totalPages: paginatedReviews.totalPages,
        totalElements: paginatedReviews.totalElements,
        hasReachedMax: !paginatedReviews.hasNext,
      ));
    } catch (error) {
      emit(state.copyWith(
        status: ReviewStatus.failure,
        errorMessage: error.toString(),
      ));
    }
  }

  /// Gestionnaire pour charger plus d'avis (pagination)
  Future<void> _onLoadMoreReviews(
      LoadMoreReviewsEvent event,
      Emitter<ReviewState> emit,
      ) async {
    if (state.hasReachedMax || state.isLoadingMore) return;

    emit(state.copyWith(status: ReviewStatus.loadingMore, clearError: true));

    try {
      final paginatedReviews = await _reviewRepository.getReviews(
        event.resourceType,
        event.resourceId,
        page: event.nextPage,
        size: event.size,
      );

      emit(state.copyWith(
        status: ReviewStatus.success,
        reviews: [...state.reviews, ...paginatedReviews.content],
        currentPage: paginatedReviews.currentPage,
        hasReachedMax: !paginatedReviews.hasNext,
      ));
    } catch (error) {
      emit(state.copyWith(
        status: ReviewStatus.loadMoreFailure,
        errorMessage: error.toString(),
      ));
    }
  }

  /// Gestionnaire pour charger les statistiques uniquement
  Future<void> _onLoadReviewStats(
      LoadReviewStatsEvent event,
      Emitter<ReviewState> emit,
      ) async {
    try {
      final stats = await _reviewRepository.getReviewStats(
        event.resourceType,
        event.resourceId,
      );

      emit(state.copyWith(stats: stats));
    } catch (error) {
      // On ne change pas le statut pour les stats, juste on log l'erreur
      emit(state.copyWith(errorMessage: error.toString()));
    }
  }

  /// Gestionnaire pour vérifier si l'utilisateur a déjà laissé un avis
  Future<void> _onCheckUserReview(
      CheckUserReviewEvent event,
      Emitter<ReviewState> emit,
      ) async {
    try {
      final hasReviewed = await _reviewRepository.userHasReviewed(
        event.userId,
        event.resourceType,
        event.resourceId,
      );

      emit(state.copyWith(userHasReviewed: hasReviewed));
    } catch (error) {
      // Si erreur, on assume que l'utilisateur n'a pas d'avis
      emit(state.copyWith(userHasReviewed: false));
    }
  }

  /// Gestionnaire pour réinitialiser l'état
  Future<void> _onResetReviews(
      ResetReviewsEvent event,
      Emitter<ReviewState> emit,
      ) async {
    emit(const ReviewState());
  }

  /// Méthodes helper pour l'UI

  /// Recharge les avis (pull-to-refresh)
  void refreshReviews(ResourceType resourceType, String resourceId) {
    add(LoadReviewsEvent(
      resourceType: resourceType,
      resourceId: resourceId,
      refresh: true,
    ));
  }

  /// Charge la page suivante
  void loadNextPage(ResourceType resourceType, String resourceId) {
    if (state.canLoadMore) {
      add(LoadMoreReviewsEvent(
        resourceType: resourceType,
        resourceId: resourceId,
        nextPage: state.currentPage + 1,
      ));
    }
  }

  /// Initialise les données pour une ressource
  void initializeForResource({
    required String userId,
    required ResourceType resourceType,
    required String resourceId,
  }) {
    // Charger les avis et vérifier si l'user a déjà un avis
    add(LoadReviewsEvent(
      resourceType: resourceType,
      resourceId: resourceId,
    ));

    add(CheckUserReviewEvent(
      userId: userId,
      resourceType: resourceType,
      resourceId: resourceId,
    ));
  }

  /// Crée un avis et rafraîchit automatiquement
  void createReviewAndRefresh({
    required CreateReview createReview,
    required ResourceType resourceType,
    required String resourceId,
  }) {
    add(CreateReviewEvent(createReview));

    // Après création, on peut rafraîchir les stats
    add(LoadReviewStatsEvent(
      resourceType: resourceType,
      resourceId: resourceId,
    ));
  }
}