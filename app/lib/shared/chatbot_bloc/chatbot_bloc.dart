import 'package:app/model/chatbot_models.dart';
import 'package:bloc/bloc.dart';
import 'package:meta/meta.dart';

import '../../model/DiagnoseResponse.dart';
import '../../model/ReportErrorRequest.dart';
import '../../service/repository/chatbot_repository.dart';

part 'chatbot_event.dart';
part 'chatbot_state.dart';

class ChatbotBloc extends Bloc<ChatbotEvent, ChatbotState> {
  final ChatbotRepository chatbotRepository;

  ChatbotBloc({required this.chatbotRepository}) : super(const ChatbotState()) {
    on<LoadChatbotDataEvent>(_loadChatbotData);
    on<DiagnoseChatbotEvent>(_diagnose);
    on<ReportErrorEvent>(_reportError);
    on<ResetChatbotEvent>(_resetChatbot);
  }

  Future<void> _loadChatbotData(
      LoadChatbotDataEvent event,
      Emitter<ChatbotState> emit,
      ) async {
    emit(state.copyWith(status: ChatbotStatus.loading));

    try {
      final races = await chatbotRepository.getAvailableRaces();
      final symptoms = await chatbotRepository.getAvailableSymptoms();

      emit(state.copyWith(
        status: ChatbotStatus.dataLoaded,
        availableRaces: races,
        availableSymptoms: symptoms,
      ));
    } catch (error) {
      emit(state.copyWith(
        status: ChatbotStatus.error,
        errorMessage: error.toString(),
      ));
    }
  }

  Future<void> _diagnose(
      DiagnoseChatbotEvent event,
      Emitter<ChatbotState> emit,
      ) async {
    emit(state.copyWith(status: ChatbotStatus.diagnosing));

    try {
      final request = DiagnoseRequest(
        race: event.race,
        symptoms: event.symptoms,
      );

      final response = await chatbotRepository.diagnose(request);

      emit(state.copyWith(
        status: ChatbotStatus.diagnosed,
        diagnoseResponse: response,
      ));
    } catch (error) {
      emit(state.copyWith(
        status: ChatbotStatus.error,
        errorMessage: error.toString(),
      ));
    }
  }

  Future<void> _reportError(
      ReportErrorEvent event,
      Emitter<ChatbotState> emit,
      ) async {
    try {
      final request = ReportErrorRequest(
        sessionId: event.sessionId,
        feedback: event.feedback,
        actualDiagnosis: event.actualDiagnosis,
      );

      await chatbotRepository.reportError(request);

      emit(state.copyWith(status: ChatbotStatus.reportSent));
    } catch (error) {
      emit(state.copyWith(
        status: ChatbotStatus.error,
        errorMessage: error.toString(),
      ));
    }
  }

  Future<void> _resetChatbot(
      ResetChatbotEvent event,
      Emitter<ChatbotState> emit,
      ) async {
    emit(state.copyWith(
      status: ChatbotStatus.dataLoaded,
      diagnoseResponse: null,
      errorMessage: null,
    ));
  }
}