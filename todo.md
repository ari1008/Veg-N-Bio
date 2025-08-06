todo
Il reste a faire le bloc de validation sur flutter 


a faire les auths
📱 Application Mobile Client
📋 Menus
GET /menus – Liste des menus disponibles

GET /menus/{id} – Détail d’un menu (avec allergènes)

🧠 Chatbot vétérinaire
POST /chatbot/diagnose – Fournir race + symptômes pour obtenir diagnostic

POST /chatbot/report – Remonter une erreur (reporting)

🛎️ Réservations
POST /reservations – Réserver une salle ou un restaurant

GET /reservations/me – Voir mes réservations

DELETE /reservations/{id} – Annuler ma réservation

🎂 Événements
GET /events – Voir les événements disponibles (conférences, anniversaires, etc.)

POST /events/register – S’inscrire à un événement

🛵 Livraison
POST /orders – Commander un plateau repas

GET /orders/me – Suivre mes commandes

✍️ Avis & Signalements
POST /comments – Commenter un menu, un restaurant, etc.

POST /ratings – Noter un service

POST /reports – Signaler un problème

GET /comments/{resource} – Voir les commentaires liés à une ressource (menu, événement…)

🖥️ Interface Web Restaurateur
💸 Système de caisse
GET /cash-register/summary – Voir le résumé des ventes

POST /cash-register/entry – Ajouter une entrée (vente)

GET /cash-register/entries – Liste des ventes

📆 Gestion d’événements
POST /events – Créer un événement

PATCH /events/{id} – Modifier un événement

DELETE /events/{id} – Supprimer un événement

GET /events/my – Voir les événements du restaurant

🗓️ Planification des services
GET /schedules – Voir le planning des services

POST /schedules – Ajouter/modifier une disponibilité

✅ Autres
🧾 Référentiels
GET /restaurants – Liste des restaurants et leurs infos (salles, horaires, etc.)

GET /allergens – Liste des allergènes disponibles