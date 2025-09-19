import 'package:bloc/bloc.dart';
import 'package:meta/meta.dart';

import '../../model/user.dart';
import '../../service/repository/auth_repository.dart';
import '../../utils/session_manager.dart';

part 'user_login_event.dart';

part 'user_login_state.dart';

class UserLoginBloc extends Bloc<UserLoginEvent, UserLoginState> {
  final AuthRepository authRepository;

  UserLoginBloc({required this.authRepository})
      : super(const UserLoginState()) {
    on<UserLoginWithCredentialsEvent>(_onUserLogin);
    on<UserLogoutEvent>(_onUserLogout);
    on<UserRefreshTokenEvent>(_onRefreshToken);
    on<UserRegisterEvent>(_onUserRegister);
  }

  Future<void> _onUserLogin(
    UserLoginWithCredentialsEvent event,
    Emitter<UserLoginState> emit,
  ) async {
    emit(state.copyWith(status: UserLoginStatus.loading));
    try {
      final connectionDto = await authRepository.loginUser(
        event.username,
        event.password,
      );

      await SessionManager.instance.saveTokens(
        accessToken: connectionDto.accessToken,
        refreshToken: connectionDto.refreshToken,
        expiresIn: connectionDto.expiresIn,
      );
      emit(state.copyWith(status: UserLoginStatus.loggingSuccess));
    } catch (error) {
      emit(state.copyWith(
        status: UserLoginStatus.loggedError,
        errorMessage: error.toString(),
      ));
    }
  }

  Future<void> _onUserLogout(
    UserLogoutEvent event,
    Emitter<UserLoginState> emit,
  ) async {
    emit(state.copyWith(status: UserLoginStatus.loading));
    try {
      await authRepository.logoutUser(event.refreshToken);
      await SessionManager.instance.clear();
      emit(state.copyWith(status: UserLoginStatus.loggedOut));
    } catch (error) {
      emit(state.copyWith(
        status: UserLoginStatus.loggedOutError,
        errorMessage: error.toString(),
      ));
    }
  }

  Future<void> _onRefreshToken(
    UserRefreshTokenEvent event,
    Emitter<UserLoginState> emit,
  ) async {
    emit(state.copyWith(status: UserLoginStatus.loading));
    try {
      final connectionDto =
          await authRepository.refreshToken(event.refreshToken);
      await SessionManager.instance.saveTokens(
        accessToken: connectionDto.accessToken,
        refreshToken: connectionDto.refreshToken,
        expiresIn: connectionDto.expiresIn,
      );
      emit(state.copyWith(status: UserLoginStatus.refreshSuccess));
    } catch (error) {
      emit(state.copyWith(
        status: UserLoginStatus.refreshError,
        errorMessage: error.toString(),
      ));
    }
  }

  Future<void> _onUserRegister(
    UserRegisterEvent event,
    Emitter<UserLoginState> emit,
  ) async {
    emit(state.copyWith(status: UserLoginStatus.loading));
    try {
      await authRepository.register(User(
        email: event.email,
        username: event.username,
        firstname: event.firstname,
        lastname: event.lastname,
        password: event.password,
      ));

      emit(state.copyWith(status: UserLoginStatus.registrationSuccess));
    } catch (error) {
      emit(state.copyWith(
        status: UserLoginStatus.registrationError,
        errorMessage: error.toString(),
      ));
    }
  }
}
