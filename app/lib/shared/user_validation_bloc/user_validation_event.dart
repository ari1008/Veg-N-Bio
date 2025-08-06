part of 'user_validation_bloc.dart';


enum UserValidationStatus {
  pure,
  valid,
  invalid,
  submitting,
  success,
  failure,
}

class UserValidationState {
  final Username username;
  final Email email;
  final Password password;
  final FirstName firstName;
  final LastName lastName;
  final ConfirmPassword confirmPassword;
  final UserValidationStatus formStatus;

  const UserValidationState({
    this.username = const Username.pure(),
    this.email = const Email.pure(),
    this.password = const Password.pure(),
    this.firstName = const FirstName.pure(),
    this.lastName = const LastName.pure(),
    this.confirmPassword = const ConfirmPassword.pure(),
    this.formStatus = UserValidationStatus.pure,
  });

  UserValidationState copyWith({
    Username? username,
    Email? email,
    Password? password,
    FirstName? firstName,
    LastName? lastName,
    ConfirmPassword? confirmPassword,
    UserValidationStatus? formStatus,
  }) {
    return UserValidationState(
      username: username ?? this.username,
      email: email ?? this.email,
      password: password ?? this.password,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      confirmPassword: confirmPassword ?? this.confirmPassword,
      formStatus: formStatus ?? this.formStatus,
    );
  }

  UserValidationStatus _validateForm({
    required Username username,
    required Email email,
    required Password password,
    required ConfirmPassword confirmPassword,
    required FirstName firstName,
    required LastName lastName,
  }) {
    return Formz.validate([
      username,
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
    ])
        ? UserValidationStatus.success
        : UserValidationStatus.invalid;
  }

}

