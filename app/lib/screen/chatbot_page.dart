import 'package:app/model/chatbot_models.dart';
import 'package:app/shared/chatbot_bloc/chatbot_bloc.dart';
import 'package:app/widget/custom_scaffold.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../model/DiseaseResult.dart';

class ChatbotPage extends StatefulWidget {
  const ChatbotPage({super.key});

  @override
  State<ChatbotPage> createState() => _ChatbotPageState();
}

class _ChatbotPageState extends State<ChatbotPage> {
  final TextEditingController _raceController = TextEditingController();
  final TextEditingController _feedbackController = TextEditingController();
  List<String> selectedSymptoms = [];
  String? selectedRace;

  // Couleurs cohérentes avec le thème Veg'N Bio
  static const Color primaryGreen = Color(0xFF4CAF50);
  static const Color lightGreen = Color(0xFFE8F5E8);
  static const Color accentGreen = Color(0xFF2E7D32);
  static const Color warningRed = Color(0xFFE57373);
  static const Color warningOrange = Color(0xFFFFB74D);
  static const Color infoBlue = Color(0xFF64B5F6);
  static const Color lightRed = Color(0xFFFFEBEE);
  static const Color lightBlue = Color(0xFFE3F2FD);

  @override
  void initState() {
    super.initState();
    context.read<ChatbotBloc>().add(LoadChatbotDataEvent());
  }

  @override
  void dispose() {
    _raceController.dispose();
    _feedbackController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      title: '🐕 Chatbot Vétérinaire',
      body: BlocConsumer<ChatbotBloc, ChatbotState>(
        listener: (context, state) {
          if (state.status == ChatbotStatus.error) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.errorMessage ?? 'Une erreur est survenue'),
                backgroundColor: warningRed,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            );
          } else if (state.status == ChatbotStatus.reportSent) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Merci pour votre retour !'),
                backgroundColor: primaryGreen,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.all(Radius.circular(10)),
                ),
              ),
            );
            Navigator.of(context).pop(); // Fermer le dialog
          }
        },
        builder: (context, state) {
          if (state.status == ChatbotStatus.loading) {
            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(primaryGreen),
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildRaceSelection(state),
                const SizedBox(height: 20),
                _buildSymptomsSelection(state),
                const SizedBox(height: 20),
                _buildDiagnoseButton(state),
                const SizedBox(height: 30),
                if (state.diagnoseResponse != null) _buildResults(state),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildRaceSelection(ChatbotState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Race de votre animal',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: accentGreen,
          ),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: selectedRace,
          decoration: InputDecoration(
            hintText: 'Sélectionnez une race',
            hintStyle: TextStyle(color: Colors.grey[600]),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: primaryGreen, width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: accentGreen, width: 2),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey[300]!, width: 1),
            ),
            filled: true,
            fillColor: Colors.white,
          ),
          items: state.availableRaces.map((race) {
            return DropdownMenuItem(
              value: race,
              child: Text(race, style: const TextStyle(color: Colors.black87)),
            );
          }).toList(),
          onChanged: (value) {
            setState(() {
              selectedRace = value;
            });
          },
        ),
      ],
    );
  }

  Widget _buildSymptomsSelection(ChatbotState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Symptômes observés',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: accentGreen,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          runSpacing: 8,
          children: state.availableSymptoms.map((symptom) {
            final isSelected = selectedSymptoms.contains(symptom);
            return FilterChip(
              label: Text(
                symptom,
                style: TextStyle(
                  color: isSelected ? Colors.white : accentGreen,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    selectedSymptoms.add(symptom);
                  } else {
                    selectedSymptoms.remove(symptom);
                  }
                });
              },
              selectedColor: primaryGreen,
              backgroundColor: lightGreen,
              checkmarkColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected ? primaryGreen : Colors.grey[300]!,
                  width: 1.5,
                ),
              ),
              elevation: isSelected ? 2 : 0,
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildDiagnoseButton(ChatbotState state) {
    final canDiagnose = selectedRace != null && selectedSymptoms.isNotEmpty;
    final isLoading = state.status == ChatbotStatus.diagnosing;

    return Center(
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(25),
          boxShadow: canDiagnose && !isLoading
              ? [
            BoxShadow(
              color: primaryGreen.withOpacity(0.3),
              spreadRadius: 2,
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ]
              : null,
        ),
        child: ElevatedButton(
          onPressed: canDiagnose && !isLoading ? _performDiagnose : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: primaryGreen,
            foregroundColor: Colors.white,
            disabledBackgroundColor: Colors.grey[300],
            padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(25),
            ),
            elevation: 0,
          ),
          child: isLoading
              ? const SizedBox(
            width: 24,
            height: 24,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          )
              : const Text(
            'Obtenir un diagnostic',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
        ),
      ),
    );
  }

  Widget _buildResults(ChatbotState state) {
    final response = state.diagnoseResponse!;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: lightGreen,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    '🩺',
                    style: TextStyle(fontSize: 24),
                  ),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Diagnostic vétérinaire',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: accentGreen,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            if (response.possibleDiseases.isNotEmpty) ...[
              ...response.possibleDiseases.map((disease) => _buildDiseaseCard(disease)),
            ] else ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: lightBlue,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: infoBlue.withOpacity(0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: infoBlue, size: 24),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Aucune maladie spécifique identifiée avec ces symptômes.',
                        style: TextStyle(color: Colors.black87),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: response.shouldConsultVet ? lightRed : lightBlue,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: response.shouldConsultVet
                      ? warningRed.withOpacity(0.3)
                      : infoBlue.withOpacity(0.3),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    response.shouldConsultVet ? Icons.warning_amber : Icons.info_outline,
                    color: response.shouldConsultVet ? warningRed : infoBlue,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      response.generalAdvice,
                      style: const TextStyle(
                        color: Colors.black87,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Boutons d'action
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showReportDialog(response.sessionId),
                    icon: const Icon(Icons.report_problem_outlined, size: 18),
                    label: const Text('Signaler une erreur'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: warningOrange,
                      side: BorderSide(color: warningOrange),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _resetDiagnosis,
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Nouveau diagnostic'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: infoBlue,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      elevation: 2,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDiseaseCard(DiseaseResult disease) {
    Color urgencyColor;
    Color backgroundColor;
    IconData urgencyIcon;

    switch (disease.urgency.toUpperCase()) {
      case 'HIGH':
        urgencyColor = warningRed;
        backgroundColor = lightRed;
        urgencyIcon = Icons.priority_high;
        break;
      case 'MEDIUM':
        urgencyColor = warningOrange;
        backgroundColor = const Color(0xFFFFF8E1);
        urgencyIcon = Icons.warning_amber;
        break;
      default:
        urgencyColor = primaryGreen;
        backgroundColor = lightGreen;
        urgencyIcon = Icons.check_circle_outline;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: urgencyColor.withOpacity(0.3), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: urgencyColor.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(urgencyIcon, color: urgencyColor, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  disease.name,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: urgencyColor,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: urgencyColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${disease.probability}%',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            disease.description,
            style: TextStyle(
              color: Colors.grey[700],
              fontSize: 13,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            disease.advice,
            style: const TextStyle(
              color: Colors.black87,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  void _performDiagnose() {
    if (selectedRace != null && selectedSymptoms.isNotEmpty) {
      context.read<ChatbotBloc>().add(
        DiagnoseChatbotEvent(
          race: selectedRace!,
          symptoms: selectedSymptoms,
        ),
      );
    }
  }

  void _resetDiagnosis() {
    setState(() {
      selectedRace = null;
      selectedSymptoms.clear();
    });
    context.read<ChatbotBloc>().add(ResetChatbotEvent());
  }

  void _showReportDialog(String sessionId) {
    _feedbackController.clear();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Row(
          children: [
            Icon(Icons.report_problem, color: warningOrange),
            SizedBox(width: 8),
            Text(
              'Signaler une erreur',
              style: TextStyle(color: accentGreen, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _feedbackController,
              decoration: InputDecoration(
                hintText: 'Décrivez le problème...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: primaryGreen, width: 2),
                ),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            style: TextButton.styleFrom(
              foregroundColor: Colors.grey[600],
            ),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              if (_feedbackController.text.isNotEmpty) {
                context.read<ChatbotBloc>().add(
                  ReportErrorEvent(
                    sessionId: sessionId,
                    feedback: _feedbackController.text,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Envoyer'),
          ),
        ],
      ),
    );
  }
}