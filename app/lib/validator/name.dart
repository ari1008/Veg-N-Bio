import 'package:formz/formz.dart';

enum NameValidationError { empty, invalidLength, invalidFormat }
class FirstName extends FormzInput<String, NameValidationError> {
  const FirstName.pure() : super.pure('');
  const FirstName.dirty([String value = '']) : super.dirty(value);

  static final _nameRegExp = RegExp(r"^[a-zà-öù-ÿA-ZÀ-ÖÙ-Ý' -]*$");


  @override
  NameValidationError? validator(String value) {
    if (value.isEmpty) return NameValidationError.empty;
    if (value.length < 2) return NameValidationError.invalidLength;
    return _nameRegExp.hasMatch(value) ? null : NameValidationError.invalidFormat;
  }
}