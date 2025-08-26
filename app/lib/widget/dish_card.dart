import 'package:flutter/material.dart';
import '../model/dish.dart';

class DishCard extends StatelessWidget {
  final Dish dish;
  final VoidCallback? onTap;
  final VoidCallback? onAdd;
  final bool dense;
  final bool showAllergens;
  final bool showAvailability;
  final int maxAllergensToShow;
  final Widget? trailing;

  const DishCard({
    super.key,
    required this.dish,
    this.onTap,
    this.onAdd,
    this.dense = false,
    this.showAllergens = true,
    this.showAvailability = true,
    this.maxAllergensToShow = 4,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final priceText = "${dish.price.toStringAsFixed(2)} €";

    return Card(
      elevation: 1.5,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.all(dense ? 10 : 14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: dense ? 16 : 18,
                child: Text(
                  _categoryEmoji(dish.category),
                  style: TextStyle(fontSize: dense ? 14 : 16),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Titre + prix
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            dish.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          priceText,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),

                    // Catégorie + disponibilité
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Chip(
                          label: Text(_categoryLabelFr(dish.category)),
                          visualDensity: const VisualDensity(horizontal: -4, vertical: -4),
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          side: BorderSide.none,
                        ),
                        if (showAvailability)
                          Chip(
                            label: Text(dish.available ? "Disponible" : "Indisponible"),
                            backgroundColor: dish.available
                                ? Theme.of(context).colorScheme.secondaryContainer
                                : Theme.of(context).colorScheme.errorContainer,
                            labelStyle: TextStyle(
                              color: dish.available
                                  ? Theme.of(context).colorScheme.onSecondaryContainer
                                  : Theme.of(context).colorScheme.onErrorContainer,
                            ),
                            visualDensity: const VisualDensity(horizontal: -4, vertical: -4),
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            side: BorderSide.none,
                          ),
                      ],
                    ),

                    // Description
                    if (!dense && (dish.description?.isNotEmpty ?? false)) ...[
                      const SizedBox(height: 6),
                      Text(
                        dish.description!,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).textTheme.bodySmall?.color,
                        ),
                      ),
                    ],

                    // Allergènes
                    if (showAllergens && dish.allergens.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: -6,
                        children: _buildAllergenChips(context, dish.allergens, maxAllergensToShow),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (trailing != null) trailing!,
                  if (onAdd != null) ...[
                    const SizedBox(height: 4),
                    IconButton(
                      tooltip: "Ajouter",
                      onPressed: onAdd,
                      icon: const Icon(Icons.add_circle_outline),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------- Helpers (définis DANS la classe) ----------

  List<Widget> _buildAllergenChips(
      BuildContext context,
      List<String> allergens,
      int maxShow,
      ) {
    final chips = <Widget>[];

    // On montre au plus maxShow allergènes, puis un "+N" si nécessaire
    final toShow = allergens.take(maxShow).toList();
    for (final a in toShow) {
      chips.add(
        Chip(
          label: Text(_allergenLabelFr(a), style: const TextStyle(fontSize: 12)),
          visualDensity: const VisualDensity(horizontal: -4, vertical: -4),
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          side: BorderSide.none,
        ),
      );
    }

    final remaining = allergens.length - toShow.length;
    if (remaining > 0) {
      chips.add(
        Chip(
          label: Text("+$remaining", style: const TextStyle(fontSize: 12)),
          visualDensity: const VisualDensity(horizontal: -4, vertical: -4),
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          side: BorderSide.none,
        ),
      );
    }

    return chips; // ✅ toujours retourner une liste
  }

  String _categoryEmoji(DishCategory c) {
    switch (c) {
      case DishCategory.entree:
        return "🥗";
      case DishCategory.plat:
        return "🍽️";
      case DishCategory.dessert:
        return "🍰";
      case DishCategory.boisson:
        return "🥤";
    }
  }

  String _categoryLabelFr(DishCategory c) {
    switch (c) {
      case DishCategory.entree:
        return "Entrée";
      case DishCategory.plat:
        return "Plat";
      case DishCategory.dessert:
        return "Dessert";
      case DishCategory.boisson:
        return "Boisson";
    }
  }

  String _allergenLabelFr(String code) {
    const map = {
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
    return map[code] ?? code;
  }
}
