import 'package:app/shared/user_login_bloc/user_login_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../utils/session_manager.dart';

class LogoutButton extends StatelessWidget {
  const LogoutButton({super.key});

  void _onPressed(BuildContext context) {
    context.read<UserLoginBloc>().add(UserLogoutEvent(
        refreshToken: SessionManager.instance.refreshToken ?? '')
    );
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => _onPressed(context),
      style: ElevatedButton.styleFrom(
        foregroundColor: Colors.white,
        backgroundColor: Colors.red,
      ),
      child: const Text('Logout'),
    );
  }
}
