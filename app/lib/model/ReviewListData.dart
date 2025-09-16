

import 'package:equatable/equatable.dart';

import 'Review.dart';

class ReviewListData extends Equatable {
  final List<Review> reviews;
  final bool isLoading;
  final bool hasError;
  final bool shouldShow;
  final String? errorMessage;

  const ReviewListData({
    required this.reviews,
    required this.isLoading,
    required this.hasError,
    required this.shouldShow,
    this.errorMessage,
  });

  @override
  List<Object?> get props => [
    reviews.length, // évite la comparaison profonde
    isLoading,
    hasError,
    shouldShow,
    errorMessage,
  ];
}

