import 'package:flutter_bloc/flutter_bloc.dart';
import '../../model/PaginatedReviews.dart';
import '../../model/ResourceType.dart';
import '../../model/Review.dart';
import '../../model/ReviewStats.dart';
import '../../service/repository/review_repository.dart';
import '../../model/CreateReview.dart';
import 'review_event.dart';
import 'review_state.dart';

class ReviewBloc extends Bloc<ReviewEvent, ReviewState> {
  final ReviewRepository _reviewRepository;

  ReviewRepository get reviewRepository => _reviewRepository;

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
    on<SetCurrentDishEvent>(_onSetCurrentDish);
    on<LoadDishReviewsEvent>(_onLoadDishReviews);
  }

  Future<void> _onCreateReview(
      CreateReviewEvent event,
      Emitter<ReviewState> emit,
      ) async {
    emit(state.copyWith(status: ReviewStatus.creating, clearError: true));

    try {
      final newReview = await _reviewRepository.createReview(event.createReview);

      final shouldUpdateList = state.currentDishId == event.createReview.resourceId;

      emit(state.copyWith(
        status: ReviewStatus.created,
        lastCreatedReview: newReview,
        userHasReviewed: true,
        reviews: shouldUpdateList ? [newReview, ...state.reviews] : state.reviews,
        totalElements: shouldUpdateList ? state.totalElements + 1 : state.totalElements,
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
      emit(state.copyWith(errorMessage: error.toString()));
    }
  }

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
      emit(state.copyWith(userHasReviewed: false));
    }
  }

  Future<void> _onResetReviews(
      ResetReviewsEvent event,
      Emitter<ReviewState> emit,
      ) async {
    emit(const ReviewState());
  }


  void refreshReviews(ResourceType resourceType, String resourceId) {
    add(LoadReviewsEvent(
      resourceType: resourceType,
      resourceId: resourceId,
      refresh: true,
    ));
  }

  void loadNextPage(ResourceType resourceType, String resourceId) {
    if (state.canLoadMore) {
      add(LoadMoreReviewsEvent(
        resourceType: resourceType,
        resourceId: resourceId,
        nextPage: state.currentPage + 1,
      ));
    }
  }

  void initializeForResource({
    required String userId,
    required ResourceType resourceType,
    required String resourceId,
  }) {
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

  void createReviewAndRefresh({
    required CreateReview createReview,
    required ResourceType resourceType,
    required String resourceId,
  }) {
    add(CreateReviewEvent(createReview));

    add(LoadReviewStatsEvent(
      resourceType: resourceType,
      resourceId: resourceId,
    ));
  }

  Future<void> _onSetCurrentDish(
      SetCurrentDishEvent event,
      Emitter<ReviewState> emit,
      ) async {
    final changed = event.dishId != state.currentDishId;
    emit(state.copyWith(
      currentDishId: event.dishId,
      reviews: changed ? <Review>[] : state.reviews,
      userHasReviewed: changed ? false : state.userHasReviewed,
      stats: changed ? null : state.stats,
    ));
  }

  Future<void> _onLoadDishReviews(
      LoadDishReviewsEvent event,
      Emitter<ReviewState> emit,
      ) async {

    emit(state.copyWith(
      status: ReviewStatus.loading,
      currentDishId: event.dishId,
      clearError: true,
    ));

    try {
      final paginated = await _reviewRepository.getReviews(
        ResourceType.DISH,
        event.dishId,
        page: 0,
        size: event.size,
      );

      emit(state.copyWith(
        status: ReviewStatus.success,
        reviews: paginated.content,
        currentPage: paginated.currentPage,
        totalPages: paginated.totalPages,
        totalElements: paginated.totalElements,
        hasReachedMax: !paginated.hasNext,
      ));
    } catch (error) {
      emit(state.copyWith(
        status: ReviewStatus.failure,
        errorMessage: error.toString(),
      ));
    }
  }
}