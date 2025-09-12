
class DiagnoseRequest {
  final String race;
  final List<String> symptoms;

  DiagnoseRequest({required this.race, required this.symptoms});

  Map<String, dynamic> toJson() {
    return {
      'race': race,
      'symptoms': symptoms,
    };
  }
}
