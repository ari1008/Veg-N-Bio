enum AppRoute{
  login('/screen'),
  register('/register'),
  home('/');

  final String path;
  const AppRoute(this.path);
}