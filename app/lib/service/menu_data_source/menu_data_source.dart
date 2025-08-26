

import 'package:app/model/dish.dart';

abstract class MenuDataSource {
  Future<List<Dish>> fetchMenuItems();
}