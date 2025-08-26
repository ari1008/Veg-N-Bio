// dish.dart

class Dish {
  final String id;
  final String name;
  final String? description;
  final double price;
  final DishCategory category;
  final bool available;
  final List<String> allergens;

  const Dish({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.category,
    required this.available,
    List<String>? allergens,
  }) : allergens = allergens ?? const [];

  Dish copyWith({
    String? id,
    String? name,
    String? description,
    double? price,
    DishCategory? category,
    bool? available,
    List<String>? allergens,
  }) {
    return Dish(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      category: category ?? this.category,
      available: available ?? this.available,
      allergens: allergens ?? List<String>.from(this.allergens),
    );
  }

  factory Dish.fromJson(Map<String, dynamic> json) {
    return Dish(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: _parsePrice(json['price']),
      category: DishCategoryX.parse(json['category']),
      available: (json['available'] as bool?) ?? false,
      allergens: (json['allergens'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'price': price,
    'category': category.toJson(), // "ENTREE" | "PLAT" | "DESSERT" | "BOISSON"
    'available': available,
    'allergens': allergens,
  };
}

enum DishCategory { entree, plat, dessert, boisson }

extension DishCategoryX on DishCategory {
  String toJson() {
    switch (this) {
      case DishCategory.entree:
        return 'ENTREE';
      case DishCategory.plat:
        return 'PLAT';
      case DishCategory.dessert:
        return 'DESSERT';
      case DishCategory.boisson:
        return 'BOISSON';
    }
  }

  static DishCategory parse(dynamic value) {
    final v = value?.toString().toUpperCase();
    switch (v) {
      case 'ENTREE':
        return DishCategory.entree;
      case 'PLAT':
        return DishCategory.plat;
      case 'DESSERT':
        return DishCategory.dessert;
      case 'BOISSON':
        return DishCategory.boisson;
      default:
        throw ArgumentError('Unknown DishCategory: $value');
    }
  }
}

double _parsePrice(dynamic value) {
  if (value is num) return value.toDouble();
  if (value is String) return double.parse(value);
  throw ArgumentError('Invalid price type: $value');
}
