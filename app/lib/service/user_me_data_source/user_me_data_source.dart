

import '../../model/UserMe.dart';

abstract class UserMeDataSource {
  Future<UserMe> getUserMe();
}