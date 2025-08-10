
FROM gradle:8.9-jdk17  AS build
WORKDIR /workspace
COPY settings.gradle.kts build.gradle.kts  ./
COPY gradle ./gradle
RUN --mount=type=cache,target=/home/gradle/.gradle \
    gradle --no-daemon build -x test || true

COPY src ./src
RUN --mount=type=cache,target=/home/gradle/.gradle \
    gradle --no-daemon clean bootJar -x test


RUN cp "$(ls -1 build/libs/*.jar | head -n 1)" /workspace/app.jar

FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash spring
USER spring

# Copie du jar
COPY --from=build /workspace/app.jar /app/app.jar

# Env par défaut
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080 \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75 -XX:+AlwaysActAsServerClassMachine"

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD curl -fsS "http://localhost:${SERVER_PORT}/actuator/health" || exit 1

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
