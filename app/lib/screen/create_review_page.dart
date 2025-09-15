import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../model/ResourceType.dart';
import '../model/CreateReview.dart';
import '../shared/review_bloc/review_bloc.dart';
import '../shared/review_bloc/review_state.dart';
import '../shared/review_bloc/review_event.dart';
import '../shared/user_me_bloc/user_me_bloc.dart';
import '../utils/app_route_enum.dart';
import '../widget/custom_scaffold.dart';
import '../widget/review_form.dart';

class CreateReviewPage extends StatefulWidget {
  final ResourceType resourceType;
  final String resourceId;
  final String? resourceName;

  const CreateReviewPage({
    Key? key,
    required this.resourceType,
    required this.resourceId,
    this.resourceName,
  }) : super(key: key);

  @override
  State<CreateReviewPage> createState() => _CreateReviewPageState();
}

class _CreateReviewPageState extends State<CreateReviewPage> {
  String? _currentUserId;

  @override
  void initState() {
    super.initState();
    _initializeUser();
  }

  void _initializeUser() {
    final userMeState = context.read<UserMeBloc>().state;
    if (userMeState.userMe != null) {
      _currentUserId = userMeState.userMe!.id;
      _checkIfUserCanReview();
    } else {
      context.read<UserMeBloc>().add(FetchUserMeEvent());
    }
  }

  void _checkIfUserCanReview() {
    if (_currentUserId != null) {
      context.read<ReviewBloc>().add(CheckUserReviewEvent(
        userId: _currentUserId!,
        resourceType: widget.resourceType,
        resourceId: widget.resourceId,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return CustomScaffold(
      title: 'Nouvel avis',
      body: MultiBlocListener(
        listeners: [
          BlocListener<UserMeBloc, UserMeState>(
            listener: (context, state) {
              if (state.status == UserMeStatus.loaded && state.userMe != null) {
                setState(() {
                  _currentUserId = state.userMe!.id;
                });
                _checkIfUserCanReview();
              } else if (state.status == UserMeStatus.error) {
                _showErrorDialog('Erreur lors de la récupération de vos informations utilisateur');
              }
            },
          ),

          BlocListener<ReviewBloc, ReviewState>(
            listener: (context, state) {
              if (state.status == ReviewStatus.created) {
                _showSuccessAndReturn();
              } else if (state.status == ReviewStatus.createFailure) {
                _showErrorSnackBar(state.contextualErrorMessage);
              }
            },
          ),
        ],
        child: BlocBuilder<ReviewBloc, ReviewState>(
          builder: (context, reviewState) {
            return BlocBuilder<UserMeBloc, UserMeState>(
              builder: (context, userState) {
                if (userState.status == UserMeStatus.loading) {
                  return _buildLoadingState();
                }

                if (userState.status == UserMeStatus.error) {
                  return _buildErrorState(
                    'Impossible de récupérer vos informations',
                        () => context.read<UserMeBloc>().add(FetchUserMeEvent()),
                  );
                }

                if (userState.userMe == null) {
                  return _buildLoginRequiredState();
                }

                if (reviewState.userHasReviewed) {
                  return _buildAlreadyReviewedState();
                }

                return _buildReviewForm(reviewState);
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 16),
          Text('Chargement...'),
        ],
      ),
    );
  }

  Widget _buildErrorState(String message, VoidCallback onRetry) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red.shade400,
            ),
            const SizedBox(height: 16),
            Text(
              'Erreur',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoginRequiredState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.login,
              size: 64,
              color: Theme.of(context).primaryColor,
            ),
            const SizedBox(height: 16),
            Text(
              'Connexion requise',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Vous devez être connecté pour laisser un avis',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.go(AppRoute.login.path),
              icon: const Icon(Icons.login),
              label: const Text('Se connecter'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlreadyReviewedState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.check_circle,
              size: 64,
              color: Colors.green.shade400,
            ),
            const SizedBox(height: 16),
            Text(
              'Avis déjà laissé',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Vous avez déjà laissé un avis pour cette ressource',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.pop(),
              icon: const Icon(Icons.arrow_back),
              label: const Text('Retour'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewForm(ReviewState reviewState) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: ReviewForm(
        resourceType: widget.resourceType,
        resourceId: widget.resourceId,
        userId: _currentUserId!,
        resourceName: widget.resourceName,
        isLoading: reviewState.isCreating,
        onSubmit: _submitReview,
        onCancel: () => context.pop(),
      ),
    );
  }

  void _submitReview(CreateReview createReview) {
    context.read<ReviewBloc>().add(CreateReviewEvent(createReview));
  }

  void _showSuccessAndReturn() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              Icons.check_circle,
              color: Colors.white,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Avis créé avec succès !',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Text(
                    'Il sera publié après modération',
                    style: TextStyle(
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: Colors.green.shade600,
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );

    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        context.pop();
      }
    });
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              Icons.error,
              color: Colors.white,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: Colors.red.shade600,
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        action: SnackBarAction(
          label: 'Réessayer',
          textColor: Colors.white,
          onPressed: () {
          },
        ),
      ),
    );
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Erreur'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}

extension CreateReviewNavigation on BuildContext {
  void goToCreateReview({
    required ResourceType resourceType,
    required String resourceId,
    String? resourceName,
  }) {
    go(AppRoute.createReview.path, extra: {
      'resourceType': resourceType,
      'resourceId': resourceId,
      'resourceName': resourceName,
    });
  }
}