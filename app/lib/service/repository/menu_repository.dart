

import '../../model/dish.dart';
import '../menu_data_source/api_menu_data_source.dart';

class MenuRepository {

  final ApiMenuDataSource remoteDataSource;
  MenuRepository({
    required this.remoteDataSource,
  });


  Future<List<Dish>> fetchMenuItems() async {
    return await remoteDataSource.fetchMenuItems();
  }
}