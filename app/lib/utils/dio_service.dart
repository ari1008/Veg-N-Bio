import 'package:app/service/auth_data_source/api_auth_data_source.dart';
import 'package:app/service/repository/auth_repository.dart';
import 'package:app/utils/session_manager.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../app_exception.dart';

Dio makeTheHeader() {
  final dio = Dio();
  dio.options.headers['Content-Type'] = 'application/json';
  return dio;
}

Future<Dio> makeTheHeaderWithAutoRefresh() async {
  final prefs = await SharedPreferences.getInstance();
  final expiry = prefs.getInt('expiresIn');
  final isExpired = expiry == null || DateTime.now().millisecondsSinceEpoch >= expiry;

  if (isExpired) {
    final refresh = prefs.getString('refreshToken');

    if (refresh != null && refresh.isNotEmpty) {
      try {
        final connectionDto = await AuthRepository(
          remoteDataSource: ApiAuthDataSource(),
        ).refreshToken(refresh);

        await SessionManager.instance.saveTokens(
          accessToken: connectionDto.accessToken,
          refreshToken: connectionDto.refreshToken,
          expiresIn: connectionDto.expiresIn,
        );
      } catch (e) {
        throw AuthException();
      }
    } else {
      throw AuthException();
    }
  }

  final token = prefs.getString('accessToken');
  final dio = makeTheHeader();

  if (token != null && token.isNotEmpty) {
    dio.options.headers['Authorization'] = 'Bearer $token';
  }

  return dio;
}