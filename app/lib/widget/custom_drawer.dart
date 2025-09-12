import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../shared/user_login_bloc/user_login_bloc.dart';
import '../utils/app_route_enum.dart';

class CustomDrawer extends StatelessWidget {
  final void Function(String) onItemTap;

  const CustomDrawer({super.key, required this.onItemTap});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: BlocBuilder<UserLoginBloc, UserLoginState>(
        builder: (context, state) {
          final isConnected = state.status == UserLoginStatus.loggingSuccess;

          return ListView(
            padding: EdgeInsets.zero,
            children: [
              const DrawerHeader(
                decoration: BoxDecoration(color: Colors.green),
                child: Text(
                  'Menu',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),

              if (isConnected) ...[
                _buildItem(context, Icons.person, 'User Info', AppRoute.home.path),
                _buildItem(context, Icons.chat, 'ChatBot Veto', AppRoute.chatbot.path),
              ] else ...[
                _buildItem(context, Icons.login, 'Login', AppRoute.login.path),
              ],

              if (!isConnected)
                _buildItem(context, Icons.app_registration, 'Register', AppRoute.register.path),

              _buildItem(context, Icons.ac_unit, 'Menu', AppRoute.menu.path),
            ],
          );
        },
      ),
    );
  }

  Widget _buildItem(
      BuildContext context,
      IconData icon,
      String label,
      String routeName,
      ) {
    return ListTile(
      leading: Icon(icon),
      title: Text(label),
      onTap: () {
        final currentRoute = GoRouter.of(context)
            .routerDelegate
            .currentConfiguration
            .uri
            .toString();
        if (currentRoute == routeName) {
          Navigator.pop(context);
          return;
        }

        Navigator.pop(context);
        SchedulerBinding.instance.addPostFrameCallback((_) {
          if (context.mounted) {
            context.go(routeName);
            onItemTap(label);
          }
        });
      },
    );
  }
}
