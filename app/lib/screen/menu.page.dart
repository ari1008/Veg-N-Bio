import 'package:app/model/dish.dart';
import 'package:app/shared/menu_bloc/menu_bloc.dart';
import 'package:app/widget/custom_scaffold.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

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
    if (state.status == MenuStatus.loading ||
        state.status == MenuStatus.initial) {
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
            onRetry: () => context
                .read<MenuBloc>()
                .add(const FetchMenuEvent()),
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

class _DishTile extends StatelessWidget {
  final Dish dish;
  const _DishTile({required this.dish});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1.5,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(child: Text(_categoryEmoji(dish.category))),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          dish.name,
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
                        '${dish.price.toStringAsFixed(2)} €',
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
                        label: Text(_categoryLabelFr(dish.category)),
                        visualDensity:
                        const VisualDensity(horizontal: -4, vertical: -4),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        side: BorderSide.none,
                      ),
                      Chip(
                        label:
                        Text(dish.available ? 'Disponible' : 'Indisponible'),
                        backgroundColor: dish.available
                            ? Theme.of(context).colorScheme.secondaryContainer
                            : Theme.of(context).colorScheme.errorContainer,
                        labelStyle: TextStyle(
                          color: dish.available
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

                  if ((dish.description ?? '').isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      dish.description!,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.copyWith(color: Colors.black54),
                    ),
                  ],

                  if (dish.allergens.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: -6,
                      children: _buildAllergenChips(dish.allergens),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
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
        .map((a) => Chip(
      label: Text(labels[a] ?? a, style: const TextStyle(fontSize: 12)),
      visualDensity:
      const VisualDensity(horizontal: -4, vertical: -4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      side: BorderSide.none,
    ))
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