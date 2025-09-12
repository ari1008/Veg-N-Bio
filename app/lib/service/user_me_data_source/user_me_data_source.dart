
import 'package:app/model/UserMe.dart';

abstract class UserMeDataSource {
  Future<UserMe> getUserMe();
}