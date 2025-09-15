enum AppRoute{
  login('/screen'),
  register('/register'),
  home('/'),
  menu('/menu'),
  chatbot('/chatbot'),
  createReview('/create_review');

  final String path;
  const AppRoute(this.path);
}