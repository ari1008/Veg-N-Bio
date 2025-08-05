class AppException implements Exception {
  final String? message;
  AppException({this.message});

  static AppException from(dynamic exception) {
    if (exception is AppException) return exception;
    return UnknownException();
  }
}

class UnknownException extends AppException {
  UnknownException() : super(message: 'An unknown error occurred');
}

class AuthException extends AppException {
  AuthException({super.message});
}


class RoleNotFoundException extends AppException {
  RoleNotFoundException() : super(message: 'Role not found');
}

class UpdateUserException extends AppException {
  UpdateUserException({super.message});
}