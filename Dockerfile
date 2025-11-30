# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copiar pom.xml
COPY pom.xml .

# Download dependencies
RUN mvn dependency:resolve

# Copiar código fonte
COPY src ./src

# Build da aplicação
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar o JAR do stage anterior
COPY --from=builder /app/target/projetocatalogo-*.jar app.jar

# Expor porta
EXPOSE 8080

# Definir variáveis de ambiente
ENV SPRING_PROFILES_ACTIVE=prod

# Executar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
