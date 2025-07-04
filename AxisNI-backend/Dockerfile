# ---------- Build Stage ----------
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml first to leverage Docker cache
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Make sure the wrapper is executable
RUN chmod +x mvnw

# Download dependencies (layer caching)
RUN ./mvnw dependency:go-offline

# Copy the rest of the source
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# ---------- Runtime Stage ----------
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/chartapp-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose the Spring Boot port
EXPOSE 8080

# Run the jar
CMD ["java", "-jar", "app.jar"]
