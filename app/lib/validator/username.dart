enum UsernameValidationError { empty, invalidLength, invalidFormat }
class Username extends FormzInput<String, UsernameValidationError> {
  const Username.pure() : super.pure('');
  const Username.dirty([String value = '']) : super.dirty(value);

  static final _usernameRegExp = RegExp(r'^[a-zA-Z0-9_]+$');

  @override
  UsernameValidationError? validator(String value) {
    if (value.isEmpty) return UsernameValidationError.empty;
    if (value.length < 3 || value.length > 30) return UsernameValidationError.invalidLength;
    if (!_usernameRegExp.hasMatch(value)) return UsernameValidationError.invalidFormat;
    return null;
  }
}