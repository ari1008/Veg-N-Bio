import 'package:app/screen/menu.page.dart';
import 'package:app/utils/app_route_enum.dart';
import 'package:go_router/go_router.dart';

import '../screen/chatbot_page.dart';
import '../screen/login.page.dart';
import '../screen/register.page.dart';
import '../screen/user_me_screen.page.dart';


final GoRouter router = GoRouter(
  initialLocation: AppRoute.login.path,
  routes: [
    GoRoute(
      path: AppRoute.login.path,
        builder: (context, state) => const LoginPage(),
      ),
    GoRoute(
      path: AppRoute.register.path,
      builder: (context, state) => const RegisterPage(),
    ),
    GoRoute(
      path: AppRoute.menu.path,
      builder: (context, state) => const MenuPage(),
    ),
    GoRoute(
    path: AppRoute.chatbot.path,
    builder: (context, state) => const ChatbotPage(),
    ),
    GoRoute(
      path: AppRoute.home.path,
      builder: (context, state) => const UserMePage(),
    )
  ],
);