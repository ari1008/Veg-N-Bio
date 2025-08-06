import 'package:bloc/bloc.dart';
import 'package:formz/formz.dart';
import 'package:meta/meta.dart';

import '../../validator/confirmpassword.dart';
import '../../validator/email.dart';
import '../../validator/lastname.dart';
import '../../validator/name.dart';
import '../../validator/password.dart';
import '../../validator/username.dart';

part 'user_validation_event.dart';
part 'user_validation_state.dart';

class UserValidationBloc
    extends Bloc<UserValidationEvent, UserValidationState> {
  UserValidationBloc() : super(const UserValidationState()) {
    on<UsernameChanged>(_onUsernameChanged);
    on<EmailChanged>(_onEmailChanged);
    on<PasswordChanged>(_onPasswordChanged);
    on<FirstnameChanged>(_onFirstnameChanged);
    on<LastnameChanged>(_onLastnameChanged);
  }

  void _onUsernameChanged(
      UsernameChanged event, Emitter<UserValidationState> emit) {
    final username = Username.dirty(event.username);
    emit(state.copyWith(
      username: username,
      formStatus: username.isNotValid
          ? UserValidationStatus.invalid
          : UserValidationStatus.success,
    ));
  }

  void _onEmailChanged(EmailChanged event, Emitter<UserValidationState> emit) {
    final email = Email.dirty(event.email);
    emit(state.copyWith(
      email: email,
      formStatus: email.isNotValid
          ? UserValidationStatus.invalid
          : UserValidationStatus.success,
    ));
  }

  void _onPasswordChanged(
      PasswordChanged event, Emitter<UserValidationState> emit) {
    final password = Password.dirty(event.password);
    emit(state.copyWith(
      password: password,
      formStatus: password.isNotValid
          ? UserValidationStatus.invalid
          : UserValidationStatus.success,
    ));
  }

  void _onFirstnameChanged(FirstnameChanged event, Emitter<UserValidationState> emit) {
    final firstName = FirstName.dirty(event.firstname);
    emit(state.copyWith(
      firstName: firstName,
      formStatus: firstName.isValid
          ? UserValidationStatus.success
          : UserValidationStatus.invalid,
    ));
  }

  void _onLastnameChanged(LastnameChanged event, Emitter<UserValidationState> emit) {
    final lastName = LastName.dirty(event.lastname);
    emit(state.copyWith(
      lastName: lastName,
      formStatus: lastName.isValid
          ? UserValidationStatus.success
          : UserValidationStatus.invalid,
    ));
  }


}
