class UserMe{
  final String id;
  final String username;
  final String lastName;
  final String firstName;
  final String email;
  final String role;
  final int fidelity;
  UserMe({
    required this.id,
    required this.username,
    required this.lastName,
    required this.firstName,
    required this.email,
    required this.role,
    required this.fidelity,
  });

  factory UserMe.fromJson(Map<String, dynamic> json) {
    return UserMe(
      id: json['id'],
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
      'id': id,
      'username': username,
      'lastName': lastName,
      'firstName': firstName,
      'email': email,
      'role': role,
      'fidelity': fidelity,
    };
  }
}