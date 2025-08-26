enum AppRoute{
  login('/screen'),
  register('/register'),
  home('/'),
  menu('/menu');

  final String path;
  const AppRoute(this.path);
}