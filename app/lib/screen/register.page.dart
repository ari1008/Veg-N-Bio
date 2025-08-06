import 'package:app/shared/user_login_bloc/user_login_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../shared/user_validation_bloc/user_validation_bloc.dart';
import '../utils/app_route_enum.dart';
import '../validator/confirmpassword.dart';
import '../widget/custom_scaffold.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();

  final usernameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();

  void _submitForm(BuildContext context) {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<UserLoginBloc>().add(
          UserRegisterEvent(
            username: usernameController.text,
            email: emailController.text,
            password: passwordController.text,
            firstname: firstNameController.text,
            lastname: lastNameController.text,
          )
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      title: "Créer un compte",
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: BlocConsumer<UserLoginBloc, UserLoginState>(
          listener: (context, state) {
            if (state.status == UserLoginStatus.registrationSuccess) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Utilisateur créé avec succès !")),
              );
              context.go(AppRoute.login.path);
            } else if (state.status == UserLoginStatus.registrationError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.errorMessage ?? "Erreur")),
              );
            }
          },
          builder: (context, state) {
            final isLoading = state.status == UserLoginStatus.loading;

            return BlocBuilder<UserValidationBloc, UserValidationState>(
              builder: (context, validationState) {
                final isFormValid = validationState.formStatus == UserValidationStatus.success;

                return Form(
                  key: _formKey,
                  child: ListView(
                    children: [
                      TextFormField(
                        controller: usernameController,
                        decoration: const InputDecoration(labelText: "Nom d'utilisateur"),
                        onChanged: (value) => context
                            .read<UserValidationBloc>()
                            .add(UsernameChanged(value)),
                        validator: (_) => validationState.username.isNotValid
                            ? "Nom d'utilisateur trop court"
                            : null,
                      ),
                      TextFormField(
                        controller: emailController,
                        decoration: const InputDecoration(labelText: "Email"),
                        onChanged: (value) => context
                            .read<UserValidationBloc>()
                            .add(EmailChanged(value)),
                        validator: (_) => validationState.email.isNotValid
                            ? "Email invalide"
                            : null,
                      ),
                      TextFormField(
                        controller: confirmPasswordController,
                        obscureText: true,
                        decoration: const InputDecoration(labelText: "Confirmer le mot de passe"),
                        onChanged: (value) => context
                            .read<UserValidationBloc>()
                            .add(ConfirmPasswordChanged(value)),
                        validator: (_) {
                          final confirm = context.read<UserValidationBloc>().state.confirmPassword;
                          if (confirm.isPure) return null;
                          if (confirm.error == ConfirmPasswordValidationError.empty) {
                            return "Confirmation requise";
                          }
                          if (confirm.error == ConfirmPasswordValidationError.mismatch) {
                            return "Les mots de passe ne correspondent pas";
                          }
                          return null;
                        },
                      ),
                      TextFormField(
                        controller: firstNameController,
                        decoration: const InputDecoration(labelText: "Prénom"),
                        onChanged: (value) => context
                            .read<UserValidationBloc>()
                            .add(FirstnameChanged(value)),
                        validator: (_) => validationState.firstName.isNotValid
                            ? "Prénom invalide"
                            : null,
                      ),
                      TextFormField(
                        controller: lastNameController,
                        decoration: const InputDecoration(labelText: "Nom"),
                        onChanged: (value) => context
                            .read<UserValidationBloc>()
                            .add(LastnameChanged(value)),
                        validator: (_) => validationState.lastName.isNotValid
                            ? "Nom invalide"
                            : null,
                      ),

                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: isLoading || !isFormValid
                            ? null
                            : () {
                          if (_formKey.currentState?.validate() ?? false) {
                            _submitForm(context);
                          }
                        },
                        child: isLoading
                            ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                            : const Text("S'inscrire"),
                      ),
                      TextButton(
                        onPressed: () {
                          context.go(AppRoute.login.path);
                        },
                        child: const Text(
                          'Se connecter',
                          style: TextStyle(color: Colors.purple),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  @override
  void dispose() {
    usernameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    firstNameController.dispose();
    lastNameController.dispose();
    super.dispose();
  }
}