class ReviewStats {
  final double averageRating;
  final int totalReviews;
  final Map<int, int> ratingsDistribution;

  ReviewStats({
    required this.averageRating,
    required this.totalReviews,
    required this.ratingsDistribution,
  });

  factory ReviewStats.fromJson(Map<String, dynamic> json) {
    // Convertir la distribution en Map<int, int>
    final Map<String, dynamic> rawDistribution = json['ratingsDistribution'] ?? {};
    final Map<int, int> distribution = rawDistribution.map((key, value) =>
        MapEntry(int.parse(key), value as int));

    return ReviewStats(
      averageRating: (json['averageRating'] as num).toDouble(),
      totalReviews: json['totalReviews'],
      ratingsDistribution: distribution,
    );
  }

  /// Retourne le pourcentage pour une note donnée
  double getPercentageForRating(int rating) {
    if (totalReviews == 0) return 0.0;
    final count = ratingsDistribution[rating] ?? 0;
    return (count / totalReviews) * 100;
  }

  /// Retourne la note la plus fréquente
  int? getMostFrequentRating() {
    if (ratingsDistribution.isEmpty) return null;
    return ratingsDistribution.entries
        .reduce((a, b) => a.value > b.value ? a : b)
        .key;
  }

  @override
  String toString() {
    return 'ReviewStats{averageRating: $averageRating, totalReviews: $totalReviews}';
  }
}