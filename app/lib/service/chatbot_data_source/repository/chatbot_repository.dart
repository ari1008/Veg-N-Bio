import 'package:app/model/chatbot_models.dart';
import 'package:app/service/chatbot_data_source/chatbot_data_source.dart';

import '../../../model/DiagnoseResponse.dart';
import '../../../model/ReportErrorRequest.dart';

class ChatbotRepository {
  final ChatbotDataSource remoteDataSource;

  ChatbotRepository({required this.remoteDataSource});

  Future<DiagnoseResponse> diagnose(DiagnoseRequest request) async {
    return await remoteDataSource.diagnose(request);
  }

  Future<bool> reportError(ReportErrorRequest request) async {
    return await remoteDataSource.reportError(request);
  }

  Future<List<String>> getAvailableRaces() async {
    return await remoteDataSource.getAvailableRaces();
  }

  Future<List<String>> getAvailableSymptoms() async {
    return await remoteDataSource.getAvailableSymptoms();
  }
}
