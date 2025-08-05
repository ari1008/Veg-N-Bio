class ConnectionDto {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;

  ConnectionDto({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
  });

  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'expiresIn': expiresIn,
    };
  }

  factory ConnectionDto.fromJson(Map<String, dynamic> json) {
    return ConnectionDto(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresIn: json['expiresIn'] as int,
    );
  }

  String get token => accessToken;
  String get refresh => refreshToken;
  int get expiration => expiresIn;
}