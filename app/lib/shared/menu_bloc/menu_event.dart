part of 'menu_bloc.dart';

@immutable
sealed class MenuEvent {
  const MenuEvent();
}


class FetchMenuEvent extends MenuEvent {
  const FetchMenuEvent();
}
