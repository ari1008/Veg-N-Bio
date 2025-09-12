class DiseaseResult {
  final String name;
  final String description;
  final int probability;
  final String urgency;
  final String advice;

  DiseaseResult({
    required this.name,
    required this.description,
    required this.probability,
    required this.urgency,
    required this.advice,
  });

  factory DiseaseResult.fromJson(Map<String, dynamic> json) {
    return DiseaseResult(
      name: json['name'],
      description: json['description'],
      probability: json['probability'],
      urgency: json['urgency'],
      advice: json['advice'],
    );
  }
}