# Keycloak (Quarkus)
FROM quay.io/keycloak/keycloak:25.0.0

# Copie ton export dans le dossier d'import attendu
# ⚠️ Nom de fichier recommandé : <realm>-realm.json (voir doc)
COPY realms/myrealm-realm.json /opt/keycloak/data/import/myrealm-realm.json

# Passera en mode prod avec import du realm au démarrage
# Les paramètres DB/Admin seront fournis via variables d'env
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", "--import-realm"]


