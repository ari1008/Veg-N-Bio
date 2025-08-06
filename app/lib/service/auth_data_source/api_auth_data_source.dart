import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../../model/connection_dto.dart';
import '../../model/user.dart';
import '../../utils/dio_service.dart';
import 'auth_data_source.dart';

class ApiAuthDataSource implements AuthDataSource {
  @override
  Future<ConnectionDto> loginUser(String username, String password) async {
      final dio = makeTheHeader();
      final response = await dio.post(
        "${dotenv.env['BASE_URL']}/authentification/login",
        data: {
          "username": username,
          "password": password,
          "role": "CUSTOMER"
        },
      );
      final statusCode = response.statusCode;
      if (statusCode != 200) {
        final apiMessage = response.data["message"] ?? "Unknown error occurred.";
        throw Exception("Error $statusCode: $apiMessage");
      }
      return ConnectionDto.fromJson(response.data);

  }

  @override
  Future<bool> logoutUser(String refreshToken) async {
    final dio = makeTheHeader();
    final response = await dio.post(
      "${dotenv.env['BASE_URL']}/authentification/logout",
      data: {
        "refreshToken": refreshToken,
      },
    );
    final statusCode = response.statusCode;
    if (statusCode != 204) {
      final apiMessage = response.data["message"] ?? "Unknown error occurred.";
      throw Exception("Error $statusCode: $apiMessage");
    }
    return true;
  }

  @override
  Future<ConnectionDto> refreshToken(String refreshToken) async {
    final dio = makeTheHeader();
    final response =
        await dio.get("${dotenv.env['BASE_URL']}/authentification/refreshToken", data: {
      "refreshToken": refreshToken,
    });

    if (response.statusCode != 200) {
      final apiMessage = response.data["message"] ?? "Unknown error occurred.";
      throw Exception("Error ${response.statusCode}: $apiMessage");
    }

    return ConnectionDto.fromJson(response.data);
  }

  @override
  Future<bool> register(User user) async {
      final dio = makeTheHeader();
      final response = await dio.post(
        "${dotenv.env['BASE_URL']}/authentification",
        data: user.toJson(),
      );
      final statusCode = response.statusCode;
      if (statusCode != 201) {
        final apiMessage = response.data["message"] ?? "Unknown error occurred.";
        throw Exception("Error $statusCode: $apiMessage");
      }

      return true;

  }

}
