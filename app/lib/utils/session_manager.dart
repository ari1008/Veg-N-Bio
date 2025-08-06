import 'package:shared_preferences/shared_preferences.dart';

class SessionManager {
  SessionManager._internal();
  static final SessionManager instance = SessionManager._internal();

  late SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  String? get accessToken  => _prefs.getString('accessToken');
  String? get refreshToken => _prefs.getString('refreshToken');
  int?    get expiresIn    => _prefs.getInt('expiresIn');

  Future<bool> get isTokenExpiredAsync async {
    final prefs = await SharedPreferences.getInstance();
    final expiry = prefs.getInt('expiresIn');
    if (expiry == null) return true;
    return DateTime.now().millisecondsSinceEpoch >= expiry;
  }


  Future<bool> isUserLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final accessToken = prefs.getString('accessToken');
    final refreshToken = prefs.getString('refreshToken');
    final expiresIn = prefs.getInt('expiresIn');
    final isExpired = expiresIn == null
        ? true
        : DateTime.now().millisecondsSinceEpoch >= expiresIn;

    return accessToken != null && refreshToken != null && !isExpired;
  }

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    required int expiresIn,
  }) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final expiry = now + expiresIn * 1000;
    await _prefs.setString('accessToken', accessToken);
    await _prefs.setString('refreshToken', refreshToken);
    await _prefs.setInt('expiresIn', expiry);
  }


  Future<void> removeTokens() async {
    await _prefs.remove('accessToken');
    await _prefs.remove('refreshToken');
    await _prefs.remove('expiresIn');
  }

  Future<void> clear() async => _prefs.clear();
}