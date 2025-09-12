part of 'user_me_bloc.dart';

@immutable
sealed class UserMeEvent {
  const UserMeEvent();
}


class FetchUserMeEvent extends UserMeEvent {
  const FetchUserMeEvent();
}
