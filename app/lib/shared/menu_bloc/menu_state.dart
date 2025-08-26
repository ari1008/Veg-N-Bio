part of 'menu_bloc.dart';

enum MenuStatus {
  initial,
  loading,
  loadSuccess,
  loadError,
}


final class MenuState {
  final MenuStatus status;
  final String? errorMessage;
  final List<Dish> menuItems;

  const MenuState({
    this.status = MenuStatus.initial,
    this.errorMessage,
    this.menuItems = const [],
  });

  MenuState copyWith({
    MenuStatus? status,
    String? errorMessage,
    List<Dish>? menuItems,
  }) {
    return MenuState(
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
      menuItems: menuItems ?? this.menuItems,
    );
  }
}
