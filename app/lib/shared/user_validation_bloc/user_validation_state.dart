part of 'user_validation_bloc.dart';
@immutable
sealed class UserValidationEvent {}

class UsernameChanged extends UserValidationEvent {
  final String username;
  UsernameChanged(this.username);
}

class EmailChanged extends UserValidationEvent {
  final String email;
  EmailChanged(this.email);
}

class LastnameChanged extends UserValidationEvent {
  final String lastname;
  LastnameChanged(this.lastname);
}

class FirstnameChanged extends UserValidationEvent {
  final String firstname;
  FirstnameChanged(this.firstname);
}

class PasswordChanged extends UserValidationEvent {
  final String password;
  PasswordChanged(this.password);
}

class ConfirmPasswordChanged extends UserValidationEvent {
  final String confirmPassword;
  ConfirmPasswordChanged(this.confirmPassword);
}

