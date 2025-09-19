

import '../../model/UserMe.dart';
import '../user_me_data_source/api_user_me_data_source.dart';

class UserMeRepository {

  final ApiUserMeDataSource remoteDataSource;
  UserMeRepository({
    required this.remoteDataSource,
  });


  Future<UserMe> fetchUserMe() async {
    return await remoteDataSource.getUserMe();
  }

}