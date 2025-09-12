enum AppRoute{
  login('/screen'),
  register('/register'),
  home('/'),
  menu('/menu'),
  chatbot('/chatbot');

  final String path;
  const AppRoute(this.path);
}