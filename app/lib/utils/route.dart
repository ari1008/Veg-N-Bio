import 'package:app/utils/app_route_enum.dart';
import 'package:go_router/go_router.dart';

import '../screen/login.page.dart';
import '../screen/register.page.dart';


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
  ],
);