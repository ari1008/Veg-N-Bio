part of 'user_login_bloc.dart';

@immutable
sealed class UserLoginEvent {
  const UserLoginEvent();
}

class UserLoginWithCredentialsEvent extends UserLoginEvent {
  final String username;
  final String password;

  const UserLoginWithCredentialsEvent({
    required this.username,
    required this.password,
  });
}

class UserLogoutEvent extends UserLoginEvent {
  final String refreshToken;

  const UserLogoutEvent({
    required this.refreshToken,
  });
}

class UserRefreshTokenEvent extends UserLoginEvent {
  final String refreshToken;

  const UserRefreshTokenEvent({
    required this.refreshToken,
  });
}

class UserRegisterEvent extends UserLoginEvent {
  final String email;
  final String password;
  final String username;
  final String firstname;
  final String lastname;

  const UserRegisterEvent({
    required this.email,
    required this.password,
    required this.username,
    required this.firstname,
    required this.lastname,
  });
}