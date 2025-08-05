import '../../model/connection_dto.dart';
import '../../model/user.dart';

abstract class AuthDataSource {
  Future<bool> register(User user);
  Future<ConnectionDto> loginUser(String username, String password);
  Future<bool> logoutUser(String refreshToken);
  Future<ConnectionDto> refreshToken(String refreshToken);

}