import 'package:app/model/chatbot_models.dart';
import 'package:app/service/chatbot_data_source/chatbot_data_source.dart';
import 'package:app/utils/dio_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../../model/DiagnoseResponse.dart';
import '../../model/ReportErrorRequest.dart';

class ApiChatbotDataSource implements ChatbotDataSource {
  @override
  Future<DiagnoseResponse> diagnose(DiagnoseRequest request) async {
    final dio = makeTheHeader();
    final response = await dio.post(
      "${dotenv.env['BASE_URL']}/notprotected/chatbot/diagnose",
      data: request.toJson(),
    );

    if (response.statusCode != 200) {
      final data = response.data;
      final apiMessage = (data is Map && data["message"] is String)
          ? data["message"] as String
          : "Erreur inconnue";
      throw Exception("Erreur ${response.statusCode}: $apiMessage");
    }

    return DiagnoseResponse.fromJson(response.data);
  }

  @override
  Future<bool> reportError(ReportErrorRequest request) async {
    final dio = makeTheHeader();
    final response = await dio.post(
      "${dotenv.env['BASE_URL']}/notprotected/chatbot/report",
      data: request.toJson(),
    );

    if (response.statusCode != 200) {
      final data = response.data;
      final apiMessage = (data is Map && data["message"] is String)
          ? data["message"] as String
          : "Erreur inconnue";
      throw Exception("Erreur ${response.statusCode}: $apiMessage");
    }

    return true;
  }

  @override
  Future<List<String>> getAvailableRaces() async {
    final dio = makeTheHeader();
    final response = await dio.get(
      "${dotenv.env['BASE_URL']}/notprotected/chatbot/races",
    );

    if (response.statusCode != 200) {
      throw Exception("Erreur lors du chargement des races");
    }

    final data = response.data;
    if (data is! List) {
      throw Exception("Format de réponse inattendu");
    }

    return data.cast<String>();
  }

  @override
  Future<List<String>> getAvailableSymptoms() async {
    final dio = makeTheHeader();
    final response = await dio.get(
      "${dotenv.env['BASE_URL']}/notprotected/chatbot/symptoms",
    );

    if (response.statusCode != 200) {
      throw Exception("Erreur lors du chargement des symptômes");
    }

    final data = response.data;
    if (data is! List) {
      throw Exception("Format de réponse inattendu");
    }

    return data.cast<String>();
  }
}
