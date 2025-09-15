import 'Review.dart';

class PaginatedReviews {
  final List<Review> content;
  final int totalElements;
  final int totalPages;
  final int currentPage;
  final int size;
  final bool hasNext;
  final bool hasPrevious;

  PaginatedReviews({
    required this.content,
    required this.totalElements,
    required this.totalPages,
    required this.currentPage,
    required this.size,
    required this.hasNext,
    required this.hasPrevious,
  });

  factory PaginatedReviews.fromJson(Map<String, dynamic> json) {
    return PaginatedReviews(
      content: (json['content'] as List)
          .map((item) => Review.fromJson(item))
          .toList(),
      totalElements: json['totalElements'],
      totalPages: json['totalPages'],
      currentPage: json['number'],
      size: json['size'],
      hasNext: !json['last'],
      hasPrevious: !json['first'],
    );
  }

  @override
  String toString() {
    return 'PaginatedReviews{totalElements: $totalElements, currentPage: $currentPage}';
  }
}