import 'package:app/model/dish.dart';
import 'package:app/service/repository/menu_repository.dart';
import 'package:bloc/bloc.dart';
import 'package:meta/meta.dart';

part 'menu_event.dart';
part 'menu_state.dart';

class MenuBloc extends Bloc<MenuEvent, MenuState> {
  final MenuRepository menuRepository;


  MenuBloc({
    required this.menuRepository,
}) : super(const MenuState()) {
    on<FetchMenuEvent>(_fetchMenu);
  }


  Future<void> _fetchMenu(
    FetchMenuEvent event,
    Emitter<MenuState> emit,
  ) async {
    emit(state.copyWith(status: MenuStatus.loading));
    try {
      final menuItems = await menuRepository.fetchMenuItems();
      emit(state.copyWith(
        status: MenuStatus.loadSuccess,
        menuItems: menuItems,
      ));
    } catch (error) {
      emit(state.copyWith(
        status: MenuStatus.loadError,
        errorMessage: error.toString(),
      ));
    }
  }
}
