
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:vegbio/service/user_me_data_source/user_me_data_source.dart';

import '../../model/UserMe.dart';
import '../../utils/dio_service.dart';

class ApiUserMeDataSource implements UserMeDataSource {
  @override
  Future<UserMe> getUserMe() async {
    final dio =  await makeTheHeaderWithAutoRefresh();
    final response = await dio.get("${dotenv.env['BASE_URL']}/user/me");

    if (response.statusCode != 200) {
      final apiMessage = response.data["message"] ?? "Unknown error occurred.";
      throw Exception("Error ${response.statusCode}: $apiMessage");
    }

    return UserMe.fromJson(response.data);
  }

}