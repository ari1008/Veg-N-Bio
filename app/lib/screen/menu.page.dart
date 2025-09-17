import 'package:app/model/dish.dart';
import 'package:app/model/Review.dart';
import 'package:app/shared/menu_bloc/menu_bloc.dart';
import 'package:app/shared/review_bloc/review_bloc.dart';
import 'package:app/shared/review_bloc/review_state.dart';
import 'package:app/shared/review_bloc/review_event.dart';
import 'package:app/shared/user_me_bloc/user_me_bloc.dart';
import 'package:app/widget/custom_scaffold.dart';
import 'package:app/widget/review_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../model/ResourceType.dart';
import '../model/ReviewListData.dart';
import '../model/ReviewStats.dart';
import '../utils/app_route_enum.dart';
import '../utils/tuple2.dart';
import '../widget/compact_rating.dart';
import '../widget/compact_review_card.dart';
import '../widget/review_form_modal.dart';

class MenuPage extends StatefulWidget {
  const MenuPage({super.key});

  @override
  State<MenuPage> createState() => _MenuPageState();
}

class _MenuPageState extends State<MenuPage> {
  final _scroll = ScrollController();
  bool _showFab = false;

  @override
  void initState() {
    super.initState();
    context.read<MenuBloc>().add(const FetchMenuEvent());
    _scroll.addListener(() {
      final shouldShow = _scroll.position.pixels > 300;
      if (shouldShow != _showFab) {
        setState(() => _showFab = shouldShow);
      }
    });
  }

  Future<void> _refresh() async {
    context.read<ReviewBloc>().add(const SetCurrentDishEvent(null));
    context.read<MenuBloc>().add(const FetchMenuEvent());
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Menu actualisé')),
    );
  }

  Future<void> _scrollToTopAndRefresh() async {
    if (_scroll.hasClients) {
      await _scroll.animateTo(
        0,
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeOutCubic,
      );
    }
    await _refresh();
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomScaffold(
      title: 'Menu',
      body: BlocConsumer<MenuBloc, MenuState>(
        listenWhen: (prev, curr) =>
        prev.status != curr.status && curr.status == MenuStatus.loadError,
        listener: (context, state) {
          if (state.status == MenuStatus.loadError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.errorMessage ?? 'Erreur inconnue')),
            );
          }
        },
        builder: (context, state) {
          return RefreshIndicator(
            onRefresh: _refresh,
            child: _buildContent(state),
          );
        },
      ),
    );
  }

  Widget _buildContent(MenuState state) {
    if (state.status == MenuStatus.loading || state.status == MenuStatus.initial) {
      return ListView(
        controller: _scroll,
        physics: const AlwaysScrollableScrollPhysics(),
        children: const [
          SizedBox(height: 200),
          Center(child: CircularProgressIndicator()),
          SizedBox(height: 400),
        ],
      );
    }

    if (state.status == MenuStatus.loadError) {
      return ListView(
        controller: _scroll,
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const SizedBox(height: 120),
          _ErrorView(
            message: state.errorMessage ?? 'Impossible de charger le menu',
            onRetry: () => context.read<MenuBloc>().add(const FetchMenuEvent()),
          ),
          const SizedBox(height: 400),
        ],
      );
    }

    final items = state.menuItems ?? const <Dish>[];

    if (items.isEmpty) {
      return ListView(
        controller: _scroll,
        physics: const AlwaysScrollableScrollPhysics(),
        children: const [
          SizedBox(height: 120),
          Center(child: Text('Aucun plat disponible')),
          SizedBox(height: 400),
        ],
      );
    }

    return Stack(
      children: [
        ListView.separated(
          controller: _scroll,
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) => _DishTile(dish: items[index]),
        ),
        Positioned(
          right: 16,
          bottom: 16,
          child: AnimatedScale(
            scale: _showFab ? 1 : 0,
            duration: const Duration(milliseconds: 180),
            child: AnimatedOpacity(
              opacity: _showFab ? 1 : 0,
              duration: const Duration(milliseconds: 180),
              child: FloatingActionButton.extended(
                onPressed: _scrollToTopAndRefresh,
                icon: const Icon(Icons.arrow_upward_rounded),
                label: const Text('Haut & actualiser'),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 12),
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
}

class _DishTile extends StatefulWidget {
  final Dish dish;
  const _DishTile({required this.dish});

  @override
  State<_DishTile> createState() => _DishTileState();
}

class _DishTileState extends State<_DishTile> {
  bool _showReviews = false;

  ReviewStats? _cachedStats;
  List<Review> _cachedReviews = [];
  bool _isLoadingStats = false;
  bool _isLoadingReviews = false;
  bool _hasLoadedStats = false;
  bool _hasLoadedReviews = false;
  String? _errorMessage;
  bool _userHasReviewed = false;
  bool _hasCheckedUserReview = false;

  @override
  void initState() {
    super.initState();
    _loadStatsIfNeeded();
  }

  void _loadStatsIfNeeded() {
    if (!_hasLoadedStats && !_isLoadingStats) {
      _loadStats();
    }
  }

  Future<void> _loadStats() async {
    if (_isLoadingStats) return;

    setState(() {
      _isLoadingStats = true;
      _errorMessage = null;
    });

    final dishIdStr = widget.dish.id!.toString();
    final reviewRepository = context.read<ReviewBloc>().reviewRepository;

    try {
      final stats = await reviewRepository.getReviewStats(
        ResourceType.DISH,
        dishIdStr,
      );

      if (mounted) {
        setState(() {
          _cachedStats = stats;
          _isLoadingStats = false;
          _hasLoadedStats = true;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _isLoadingStats = false;
          _errorMessage = error.toString();
        });
      }
    }
  }

  Future<void> _loadReviews() async {
    if (_isLoadingReviews) return;

    setState(() {
      _isLoadingReviews = true;
      _errorMessage = null;
    });

    final dishIdStr = widget.dish.id!.toString();
    final reviewRepository = context.read<ReviewBloc>().reviewRepository;

    try {
      final paginated = await reviewRepository.getReviews(
        ResourceType.DISH,
        dishIdStr,
        page: 0,
        size: 3,
      );

      if (mounted) {
        setState(() {
          _cachedReviews = paginated.content;
          _isLoadingReviews = false;
          _hasLoadedReviews = true;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _isLoadingReviews = false;
          _errorMessage = error.toString();
        });
      }
    }
  }

  Future<void> _checkUserReview() async {
    final userState = context.read<UserMeBloc>().state;
    if (userState.userMe == null || _hasCheckedUserReview) return;

    final dishIdStr = widget.dish.id!.toString();
    final reviewRepository = context.read<ReviewBloc>().reviewRepository;

    try {
      final hasReviewed = await reviewRepository.userHasReviewed(
        userState.userMe!.id,
        ResourceType.DISH,
        dishIdStr,
      );

      if (mounted) {
        setState(() {
          _userHasReviewed = hasReviewed;
          _hasCheckedUserReview = true;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _userHasReviewed = false;
          _hasCheckedUserReview = true;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1.5,
      child: Column(
        children: [
          _buildDishHeader(),
          _buildReviewSection(),
        ],
      ),
    );
  }

  Widget _buildDishHeader() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(child: Text(_categoryEmoji(widget.dish.category))),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        widget.dish.name,
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.w600),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${widget.dish.price.toStringAsFixed(2)} €',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 8,
                  children: [
                    Chip(
                      label: Text(_categoryLabelFr(widget.dish.category)),
                      visualDensity:
                      const VisualDensity(horizontal: -4, vertical: -4),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      side: BorderSide.none,
                    ),
                    Chip(
                      label: Text(widget.dish.available ? 'Disponible' : 'Indisponible'),
                      backgroundColor: widget.dish.available
                          ? Theme.of(context).colorScheme.secondaryContainer
                          : Theme.of(context).colorScheme.errorContainer,
                      labelStyle: TextStyle(
                        color: widget.dish.available
                            ? Theme.of(context).colorScheme.onSecondaryContainer
                            : Theme.of(context).colorScheme.onErrorContainer,
                      ),
                      visualDensity:
                      const VisualDensity(horizontal: -4, vertical: -4),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      side: BorderSide.none,
                    ),
                  ],
                ),
                if ((widget.dish.description ?? '').isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    widget.dish.description!,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: Colors.black54),
                  ),
                ],
                if (widget.dish.allergens.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: -6,
                    children: _buildAllergenChips(widget.dish.allergens),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewSection() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Theme.of(context)
                .colorScheme
                .surfaceVariant
                .withOpacity(0.3),
            border: Border(
              top: BorderSide(
                color: Theme.of(context).dividerColor.withOpacity(0.5),
              ),
            ),
          ),
          child: Row(
            children: [
              if (_isLoadingStats) ...[
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                const SizedBox(width: 8),
                const Text('Chargement...'),
              ] else if (_cachedStats != null && _cachedStats!.totalReviews > 0) ...[
                CompactRating(
                  averageRating: _cachedStats!.averageRating,
                  totalReviews: _cachedStats!.totalReviews,
                  starSize: 16,
                ),
              ] else ...[
                Row(
                  children: [
                    Icon(Icons.star_border, size: 16, color: Colors.grey.shade400),
                    const SizedBox(width: 4),
                    Text(
                      'Aucun avis',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ],
              const Spacer(),
              if (_cachedStats != null && _cachedStats!.totalReviews > 0) ...[
                TextButton.icon(
                  onPressed: _toggleReviews,
                  icon: Icon(
                    _showReviews ? Icons.expand_less : Icons.expand_more,
                    size: 18,
                  ),
                  label: Text(
                    _showReviews ? 'Masquer' : 'Voir avis',
                    style: const TextStyle(fontSize: 12),
                  ),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
                const SizedBox(width: 8),
              ],
              _buildRateButton(),
            ],
          ),
        ),

        if (_showReviews) ...[
          if (_isLoadingReviews) ...[
            const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator()),
            ),
          ] else if (_errorMessage != null) ...[
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Erreur: $_errorMessage',
                style: TextStyle(color: Colors.red.shade600),
                textAlign: TextAlign.center,
              ),
            ),
          ] else if (_cachedReviews.isEmpty) ...[
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text('Aucun avis disponible pour ce plat',
                  textAlign: TextAlign.center),
            ),
          ] else ...[
            Column(
              children: [
                ..._cachedReviews.take(3).map(
                      (review) => CompactReviewCard(
                    review: review,
                    onTap: _showAllReviews,
                  ),
                ),
                if (_cachedReviews.length > 3)
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: TextButton(
                      onPressed: _showAllReviews,
                      child: Text(
                        'Voir tous les avis (${_cachedReviews.length})',
                        style: const TextStyle(fontSize: 12),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ],
    );
  }

  void _toggleReviews() {
    setState(() => _showReviews = !_showReviews);

    if (_showReviews) {
      if (!_hasLoadedReviews) {
        _loadReviews();
      }
      _checkUserReview();
    }
  }

  Widget _buildRateButton() {
    return BlocBuilder<UserMeBloc, UserMeState>(
      builder: (context, userState) {
        if (userState.userMe == null) {
          return ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('Connectez-vous pour laisser un avis'),
                  action: SnackBarAction(
                    label: 'Se connecter',
                    onPressed: () => context.go(AppRoute.login.path),
                  ),
                ),
              );
            },
            icon: const Icon(Icons.login, size: 16),
            label: const Text('Se connecter', style: TextStyle(fontSize: 12)),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          );
        }

        if (_userHasReviewed) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.green.shade100,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.green.shade300),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_circle, size: 14, color: Colors.green.shade700),
                const SizedBox(width: 4),
                Text(
                  'Noté',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.green.shade700,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          );
        }

        return ElevatedButton.icon(
          onPressed: _showReviewForm,
          icon: const Icon(Icons.star, size: 16),
          label: const Text('Noter', style: TextStyle(fontSize: 12)),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
        );
      },
    );
  }

  void _showReviewForm() {
    final userState = context.read<UserMeBloc>().state;
    if (userState.userMe == null) return;

    final dishIdStr = widget.dish.id!.toString();

    ReviewFormModal.show(
      context: context,
      resourceType: ResourceType.DISH,
      resourceId: dishIdStr,
      userId: userState.userMe!.id,
      resourceName: widget.dish.name,
      onSubmit: (createReview) async {
        Navigator.of(context).pop();

        try {
          final reviewRepository = context.read<ReviewBloc>().reviewRepository;
          await reviewRepository.createReview(createReview);

          setState(() {
            _hasLoadedStats = false;
            _hasLoadedReviews = false;
            _hasCheckedUserReview = false;
          });

          _loadStats();
          if (_showReviews) {
            _loadReviews();
          }
          _checkUserReview();

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Avis ajouté avec succès!')),
          );
        } catch (error) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erreur: ${error.toString()}')),
          );
        }
      },
    );
  }

  void _showAllReviews() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DishReviewsPage(dish: widget.dish),
      ),
    );
  }

  List<Widget> _buildAllergenChips(List<String> allergens) {
    const labels = {
      "GLUTEN": "Gluten",
      "CRUSTACEANS": "Crustacés",
      "EGGS": "Œufs",
      "FISH": "Poisson",
      "PEANUTS": "Arachides",
      "SOYBEANS": "Soja",
      "MILK": "Lait",
      "NUTS": "Fruits à coque",
      "CELERY": "Céleri",
      "MUSTARD": "Moutarde",
      "SESAME_SEEDS": "Graines de sésame",
      "SULPHITES": "Sulfites",
      "LUPIN": "Lupin",
      "MOLLUSCS": "Mollusques",
    };
    return allergens
        .map(
          (a) => Chip(
        label: Text(labels[a] ?? a, style: const TextStyle(fontSize: 12)),
        visualDensity:
        const VisualDensity(horizontal: -4, vertical: -4),
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        side: BorderSide.none,
      ),
    )
        .toList();
  }

  String _categoryEmoji(DishCategory c) {
    switch (c) {
      case DishCategory.entree:
        return '🥗';
      case DishCategory.plat:
        return '🍽️';
      case DishCategory.dessert:
        return '🍰';
      case DishCategory.boisson:
        return '🥤';
    }
  }

  String _categoryLabelFr(DishCategory c) {
    switch (c) {
      case DishCategory.entree:
        return 'Entrée';
      case DishCategory.plat:
        return 'Plat';
      case DishCategory.dessert:
        return 'Dessert';
      case DishCategory.boisson:
        return 'Boisson';
    }
  }
}

class _DishReviewsPage extends StatefulWidget {
  final Dish dish;
  const _DishReviewsPage({required this.dish});

  @override
  State<_DishReviewsPage> createState() => _DishReviewsPageState();
}

class _DishReviewsPageState extends State<_DishReviewsPage> {
  @override
  void initState() {
    super.initState();
    final dishIdStr = widget.dish.id!.toString();
    final bloc = context.read<ReviewBloc>();

    bloc.add(SetCurrentDishEvent(dishIdStr));
    bloc.add(LoadReviewStatsEvent(
      resourceType: ResourceType.DISH,
      resourceId: dishIdStr,
    ));
    bloc.add(LoadDishReviewsEvent(dishId: dishIdStr, size: 20));
  }

  @override
  Widget build(BuildContext context) {
    final dishIdStr = widget.dish.id!.toString();

    return CustomScaffold(
      title: 'Avis - ${widget.dish.name}',
      body: Column(
        children: [
          BlocSelector<ReviewBloc, ReviewState, ReviewStats?>(
            selector: (state) =>
            state.currentDishId == dishIdStr ? state.stats : null,
            builder: (context, stats) {
              if (stats == null) return const SizedBox.shrink();
              return Container(
                padding: const EdgeInsets.all(16),
                color: Theme.of(context)
                    .colorScheme
                    .surfaceVariant
                    .withOpacity(0.3),
                child: Row(
                  children: [
                    Expanded(
                      child: CompactRating(
                        averageRating: stats.averageRating,
                        totalReviews: stats.totalReviews,
                        starSize: 20,
                      ),
                    ),
                    Text(
                      '${stats.totalReviews} avis',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ],
                ),
              );
            },
          ),

          Expanded(
            child: BlocSelector<ReviewBloc, ReviewState, ReviewListData>(
              selector: (state) {
                final isCurrentDish = state.currentDishId == dishIdStr;
                return ReviewListData(
                  reviews: isCurrentDish ? state.reviews : const [],
                  isLoading: isCurrentDish ? state.isLoading : false,
                  hasError: isCurrentDish ? state.hasError : false,
                  shouldShow: true,
                  errorMessage: isCurrentDish ? state.errorMessage : null,
                );
              },
              builder: (context, data) {
                if (data.isLoading && data.reviews.isEmpty) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (data.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Erreur: ${data.errorMessage ?? "Erreur inconnue"}',
                            style: TextStyle(color: Colors.red.shade600),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: () {
                              final bloc = context.read<ReviewBloc>();
                              bloc.add(SetCurrentDishEvent(dishIdStr));
                              bloc.add(
                                  LoadDishReviewsEvent(dishId: dishIdStr, size: 20));
                            },
                            icon: const Icon(Icons.refresh),
                            label: const Text('Réessayer'),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                if (data.reviews.isEmpty) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text(
                        'Aucun avis pour ce plat',
                        style: TextStyle(fontSize: 16),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    final bloc = context.read<ReviewBloc>();
                    bloc.add(SetCurrentDishEvent(dishIdStr));
                    bloc.add(LoadDishReviewsEvent(dishId: dishIdStr, size: 20));
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.all(8),
                    itemCount: data.reviews.length,
                    itemBuilder: (context, index) {
                      return ReviewCard(
                        review: data.reviews[index],
                        margin: const EdgeInsets.symmetric(vertical: 4),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}