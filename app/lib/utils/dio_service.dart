import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:vegbio/utils/session_manager.dart';
import '../app_exception.dart';
import '../service/auth_data_source/api_auth_data_source.dart';
import '../service/repository/auth_repository.dart';
import '../utils/app_route_enum.dart';


BuildContext? _globalContext;

void setGlobalContext(BuildContext context) {
  _globalContext = context;
}


void _redirectToLogin() {
  if (_globalContext != null) {
    SessionManager.instance.clearTokens();
    _globalContext!.go(AppRoute.login.path);
    ScaffoldMessenger.of(_globalContext!).showSnackBar(
      const SnackBar(content: Text("Session expirée, reconnectez-vous")),
    );
  }
}

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
        _redirectToLogin();
        throw AuthException();
      }
    } else {
      _redirectToLogin();
      throw AuthException();
    }
  }

  final token = prefs.getString('accessToken');
  final dio = makeTheHeader();

  dio.interceptors.add(InterceptorsWrapper(
    onError: (error, handler) {
      if (error.response?.statusCode == 401) {
        _redirectToLogin();
      }
      handler.next(error);
    },
  ));

  if (token != null && token.isNotEmpty) {
    dio.options.headers['Authorization'] = 'Bearer $token';
  }

  return dio;
}