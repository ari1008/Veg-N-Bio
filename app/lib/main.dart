import 'package:app/service/auth_data_source/api_auth_data_source.dart';
import 'package:app/service/chatbot_data_source/api_chatbot_data_source.dart';
import 'package:app/service/menu_data_source/api_menu_data_source.dart';
import 'package:app/service/repository/auth_repository.dart';
import 'package:app/service/repository/chatbot_repository.dart';
import 'package:app/service/repository/menu_repository.dart';
import 'package:app/service/repository/review_repository.dart';
import 'package:app/service/repository/user_me_repository.dart';
import 'package:app/service/review_data_source/api_review_data_source.dart';
import 'package:app/service/user_me_data_source/api_user_me_data_source.dart';
import 'package:app/shared/chatbot_bloc/chatbot_bloc.dart';
import 'package:app/shared/menu_bloc/menu_bloc.dart';
import 'package:app/shared/review_bloc/review_bloc.dart';
import 'package:app/shared/user_login_bloc/user_login_bloc.dart';
import 'package:app/shared/user_me_bloc/user_me_bloc.dart';
import 'package:app/shared/user_validation_bloc/user_validation_bloc.dart';
import 'package:app/utils/route.dart';
import 'package:app/utils/session_manager.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SessionManager.instance.init();
  await dotenv.load(fileName: '.env');
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<ReviewBloc>(
          create: (_) => ReviewBloc(
            reviewRepository: ReviewRepository(
              remoteDataSource: ApiReviewDataSource(),
            ),
          ),
        ),
        BlocProvider<ChatbotBloc>(
          create: (_) => ChatbotBloc(
            chatbotRepository: ChatbotRepository(
              remoteDataSource: ApiChatbotDataSource(),
            ),
          ),
        ),
        BlocProvider<UserMeBloc>(
          create: (_) => UserMeBloc(
            userMeRepository: UserMeRepository(
              remoteDataSource: ApiUserMeDataSource(),
            ),
          ),
        ),
        BlocProvider<UserLoginBloc>(
          create: (_) => UserLoginBloc(
            authRepository: AuthRepository(
              remoteDataSource: ApiAuthDataSource(),
            ),
          ),
        ),
        BlocProvider<UserValidationBloc>(
          create: (_) => UserValidationBloc(),
        ),
        BlocProvider<MenuBloc>(
          create: (_) => MenuBloc(
            menuRepository: MenuRepository(
              remoteDataSource: ApiMenuDataSource(),
            ),
          ),
        ),
      ],
      child: MaterialApp.router(
        routerConfig: router,
        title: 'WL Tracker',
        theme: ThemeData.light().copyWith(
          scaffoldBackgroundColor: Colors.white,
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.white,
            iconTheme: IconThemeData(color: Colors.black),
            titleTextStyle: TextStyle(
              color: Colors.black,
              fontSize: 20,
              fontWeight: FontWeight.w600,
            ),
          ),
          inputDecorationTheme: const InputDecorationTheme(
            labelStyle: TextStyle(color: Colors.black),
            enabledBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.black45),
            ),
            focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.deepPurple),
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.deepPurple,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          textButtonTheme: TextButtonThemeData(
            style: TextButton.styleFrom(
              foregroundColor: Colors.deepPurple,
            ),
          ),
          textTheme: const TextTheme(
            bodyLarge: TextStyle(color: Colors.black),
            bodyMedium: TextStyle(color: Colors.black),
          ),
        ),
      ),
    );
  }
}