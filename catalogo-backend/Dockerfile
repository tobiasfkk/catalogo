# Multi-stage build para otimizar tamanho da imagem
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copiar arquivos de dependência primeiro (para cache de layers)
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Baixar dependências (layer cacheável)
RUN ./mvnw dependency:go-offline -B

# Copiar código fonte
COPY src ./src

# Build da aplicação
RUN ./mvnw clean package -DskipTests -B

# Imagem final otimizada
FROM eclipse-temurin:21-jre-alpine

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copiar JAR da stage anterior
COPY --from=builder /app/target/catalogo-backend-*.jar app.jar

# Definir usuário
USER appuser

# Configurações JVM otimizadas
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

