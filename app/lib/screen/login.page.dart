import 'package:app/shared/user_login_bloc/user_login_bloc.dart';
import 'package:app/utils/app_route_enum.dart';
import 'package:app/widget/custom_scaffold.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    final TextEditingController usernameController = TextEditingController();
    final TextEditingController passwordController = TextEditingController();

    return CustomScaffold(
      title: 'Connexion',
      body: BlocListener<UserLoginBloc, UserLoginState>(
        listener: (context, state) {
          if (state.status == UserLoginStatus.loggingSuccess) {
            context.go(AppRoute.login.path);
          } else if (state.status == UserLoginStatus.loggedError) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text("Mot de passe ou nom d'utilisateur incorrect")),
            );
          }
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextField(
                controller: usernameController,
                style: const TextStyle(color: Colors.black),
                decoration: const InputDecoration(
                  labelText: 'Username',
                  labelStyle: TextStyle(color: Colors.black),
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.black45),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.green),
                  ),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: passwordController,
                obscureText: true,
                style: const TextStyle(color: Colors.black),
                decoration: const InputDecoration(
                  labelText: 'Mot de passe',
                  labelStyle: TextStyle(color: Colors.black),
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.black45),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.green),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  final username = usernameController.text;
                  final password = passwordController.text;

                  context.read<UserLoginBloc>().add(
                    UserLoginWithCredentialsEvent(
                      username: username,
                      password: password,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                ),
                child: const Text('Se connecter'),
              ),
              TextButton(
                onPressed: () {
                  context.go(AppRoute.register.path);
                },
                child: const Text(
                  'Créer un compte',
                  style: TextStyle(color: Colors.green),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}