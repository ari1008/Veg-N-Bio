import 'package:formz/formz.dart';

enum PasswordValidationError { empty, tooShort, invalidFormat }
class Password extends FormzInput<String, PasswordValidationError> {
  const Password.pure() : super.pure('');
  const Password.dirty([String value = '']) : super.dirty(value);

  static final _passwordRegExp = RegExp(
      r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^\-])[A-Za-z\d@$!%*?&.#^\-]{8,}$');

  @override
  PasswordValidationError? validator(String value) {
    if (value.isEmpty) return PasswordValidationError.empty;
    if (value.length < 8) return PasswordValidationError.tooShort;
    return _passwordRegExp.hasMatch(value) ? null : PasswordValidationError.invalidFormat;
  }
}