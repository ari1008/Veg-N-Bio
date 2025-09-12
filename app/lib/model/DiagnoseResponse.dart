import 'DiseaseResult.dart';

class DiagnoseResponse {
  final String sessionId;
  final List<DiseaseResult> possibleDiseases;
  final bool shouldConsultVet;
  final String generalAdvice;

  DiagnoseResponse({
    required this.sessionId,
    required this.possibleDiseases,
    required this.shouldConsultVet,
    required this.generalAdvice,
  });

  factory DiagnoseResponse.fromJson(Map<String, dynamic> json) {
    return DiagnoseResponse(
      sessionId: json['sessionId'],
      possibleDiseases: (json['possibleDiseases'] as List)
          .map((e) => DiseaseResult.fromJson(e))
          .toList(),
      shouldConsultVet: json['shouldConsultVet'],
      generalAdvice: json['generalAdvice'],
    );
  }
}