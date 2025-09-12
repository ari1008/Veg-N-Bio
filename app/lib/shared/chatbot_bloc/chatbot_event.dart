part of 'chatbot_bloc.dart';


@immutable
abstract class ChatbotEvent {}

class LoadChatbotDataEvent extends ChatbotEvent {}

class DiagnoseChatbotEvent extends ChatbotEvent {
  final String race;
  final List<String> symptoms;

  DiagnoseChatbotEvent({required this.race, required this.symptoms});
}

class ReportErrorEvent extends ChatbotEvent {
  final String sessionId;
  final String feedback;
  final String? actualDiagnosis;

  ReportErrorEvent({
    required this.sessionId,
    required this.feedback,
    this.actualDiagnosis,
  });
}

class ResetChatbotEvent extends ChatbotEvent {}