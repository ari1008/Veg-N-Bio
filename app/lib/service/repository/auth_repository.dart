import 'package:app/model/connection_dto.dart';
import 'package:app/service/auth_data_source/auth_data_source.dart';

import '../../model/user.dart';

class AuthRepository {

  final AuthDataSource remoteDataSource;
  AuthRepository({
    required this.remoteDataSource,
  });

  Future<bool> register(User user) async {
    return await remoteDataSource.register(user);
  }

  Future<ConnectionDto> loginUser(String username, String password) async {
    return await remoteDataSource.loginUser(username, password);
  }

  Future<bool> logoutUser(String refreshToken) async {
    return await remoteDataSource.logoutUser(refreshToken);
  }

  Future<ConnectionDto> refreshToken(String refreshToken) async {
    return await remoteDataSource.refreshToken(refreshToken);
  }
}