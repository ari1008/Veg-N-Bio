class UserMe{
  final String username;
  final String lastName;
  final String firstName;
  final String email;
  final String role;
  final int fidelity;
  UserMe({
    required this.username,
    required this.lastName,
    required this.firstName,
    required this.email,
    required this.role,
    required this.fidelity,
  });

  factory UserMe.fromJson(Map<String, dynamic> json) {
    return UserMe(
      username: json['username'],
      lastName: json['lastName'],
      firstName: json['firstName'],
      email: json['email'],
      role: json['role'],
      fidelity: json['fidelity'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'lastName': lastName,
      'firstName': firstName,
      'email': email,
      'role': role,
      'fidelity': fidelity,
    };
  }
}