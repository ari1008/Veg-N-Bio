

import '../../model/dish.dart';

abstract class MenuDataSource {
  Future<List<Dish>> fetchMenuItems();
}