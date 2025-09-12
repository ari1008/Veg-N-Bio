import '../../model/DiagnoseResponse.dart';
import '../../model/ReportErrorRequest.dart';
import '../../model/chatbot_models.dart';

abstract class ChatbotDataSource {
  Future<DiagnoseResponse> diagnose(DiagnoseRequest request);
  Future<bool> reportError(ReportErrorRequest request);
  Future<List<String>> getAvailableRaces();
  Future<List<String>> getAvailableSymptoms();
}