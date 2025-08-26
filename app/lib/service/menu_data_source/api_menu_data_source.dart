

import 'package:app/model/dish.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../../utils/dio_service.dart';
import 'menu_data_source.dart';

class ApiMenuDataSource implements MenuDataSource {
  @override
  Future<List<Dish>> fetchMenuItems() async {
    final dio = makeTheHeader();
    final response = await dio.get(
      "${dotenv.env['BASE_URL']}/notprotected/menu",
    );

    if (response.statusCode != 200) {
      final data = response.data;
      final apiMessage = (data is Map && data["message"] is String)
          ? data["message"] as String
          : "Unknown error occurred.";
      throw Exception("Error ${response.statusCode}: $apiMessage");
    }

    final data = response.data;
    if (data is! List) {
      throw Exception("Unexpected payload: expected a JSON array.");
    }

    return data
        .map((e) => Dish.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }
}