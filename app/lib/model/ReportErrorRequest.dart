class ReportErrorRequest {
  final String sessionId;
  final String feedback;
  final String? actualDiagnosis;

  ReportErrorRequest({
    required this.sessionId,
    required this.feedback,
    this.actualDiagnosis,
  });

  Map<String, dynamic> toJson() {
    return {
      'sessionId': sessionId,
      'feedback': feedback,
      if (actualDiagnosis != null) 'actualDiagnosis': actualDiagnosis,
    };
  }
}