part of 'chatbot_bloc.dart';


enum ChatbotStatus {
  initial,
  loading,
  dataLoaded,
  diagnosing,
  diagnosed,
  error,
  reportSent
}

@immutable
class ChatbotState {
  const ChatbotState({
    this.status = ChatbotStatus.initial,
    this.availableRaces = const [],
    this.availableSymptoms = const [],
    this.diagnoseResponse,
    this.errorMessage,
  });

  final ChatbotStatus status;
  final List<String> availableRaces;
  final List<String> availableSymptoms;
  final DiagnoseResponse? diagnoseResponse;
  final String? errorMessage;

  ChatbotState copyWith({
    ChatbotStatus? status,
    List<String>? availableRaces,
    List<String>? availableSymptoms,
    DiagnoseResponse? diagnoseResponse,
    String? errorMessage,
  }) {
    return ChatbotState(
      status: status ?? this.status,
      availableRaces: availableRaces ?? this.availableRaces,
      availableSymptoms: availableSymptoms ?? this.availableSymptoms,
      diagnoseResponse: diagnoseResponse ?? this.diagnoseResponse,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}