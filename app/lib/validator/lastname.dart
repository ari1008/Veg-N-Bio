import 'package:formz/formz.dart';

import 'name.dart';

class LastName extends FormzInput<String, NameValidationError> {
  const LastName.pure() : super.pure('');
  const LastName.dirty([String value = '']) : super.dirty(value);

  static final _nameRegExp = RegExp(r"^[a-zà-öù-ÿA-ZÀ-ÖÙ-Ý' -]*$");


  @override
  NameValidationError? validator(String value) {
    if (value.isEmpty) return NameValidationError.empty;
    if (value.length > 50) return NameValidationError.invalidLength;
    return _nameRegExp.hasMatch(value) ? null : NameValidationError.invalidFormat;
  }
}