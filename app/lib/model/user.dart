class User {
  final String email;
  final String? password;
  final String username;
  final String firstname;
  final String lastname;
  final String role;

  const User({
    required this.email,
    this.password, // nullable
    required this.username,
    required this.firstname,
    required this.lastname,
    this.role = "CUSTOMER"
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      email: json['email'] as String,
      password: json['password'] as String?,
      username: json['username'] as String,
      firstname: json['firstName'] as String,
      lastname: json['lastName'] as String,
      role: json['role'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'email': email,
      'username': username,
      'firstName': firstname,
      'lastName': lastname,
      'role': role,
    };

    if (password != null && password!.isNotEmpty) {
      data['password'] = password;
    }

    return data;
  }
}