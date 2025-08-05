part of 'user_login_bloc.dart';

enum UserLoginStatus {
  initial,
  loading,
  loggingSuccess,
  loggedError,
  loggedOut,
  loggedOutError,
  failure,
  tokenRefreshed,
  tokenRefreshError,
  updatingUserError,
  updatingUserSuccess, refreshSuccess, refreshError, registrationSuccess, registrationError,
}

final class UserLoginState {
  final UserLoginStatus status;
  final String? errorMessage;

  const UserLoginState({
    this.status = UserLoginStatus.initial,
    this.errorMessage,
  });

  UserLoginState copyWith({
    UserLoginStatus? status,
    String? errorMessage,
  }) {
    return UserLoginState(
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}