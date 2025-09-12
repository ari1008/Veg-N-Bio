part of 'user_me_bloc.dart';

enum UserMeStatus {
  initial,
  loading,
  loaded,
  error,
}

final class UserMeState {
  final UserMeStatus status;
  final UserMe? userMe;
  final String? errorMessage;

  const UserMeState({
    this.status = UserMeStatus.initial,
    this.userMe,
    this.errorMessage,
  });

  UserMeState copyWith({
    UserMeStatus? status,
    UserMe? userMe,
    String? errorMessage,
  }) {
    return UserMeState(
      status: status ?? this.status,
      userMe: userMe ?? this.userMe,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}