import 'package:bloc/bloc.dart';
import 'package:meta/meta.dart';

import '../../model/UserMe.dart';
import '../../service/repository/user_me_repository.dart';

part 'user_me_event.dart';
part 'user_me_state.dart';

class UserMeBloc extends Bloc<UserMeEvent, UserMeState> {
  final UserMeRepository userMeRepository;

  UserMeBloc({required this.userMeRepository}) : super(const UserMeState()) {
    on<FetchUserMeEvent>(_onFetchUserMe);
  }

  Future<void> _onFetchUserMe(
      FetchUserMeEvent event, Emitter<UserMeState> emit) async {
    emit(state.copyWith(status: UserMeStatus.loading));
    try {
      final userMe = await userMeRepository.fetchUserMe();
      emit(state.copyWith(status: UserMeStatus.loaded, userMe: userMe));
    } catch (e) {
      emit(state.copyWith(
          status: UserMeStatus.error, errorMessage: e.toString()));
    }
  }
}
