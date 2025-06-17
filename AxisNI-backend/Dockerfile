# Use Eclipse Temurin (OpenJDK) 21 image
FROM eclipse-temurin:21-jdk

# Set working directory
WORKDIR /app

# Copy everything from local into container
COPY . .

# Give mvnw permission to execute
RUN chmod +x mvnw

# Build the project
RUN ./mvnw clean package -DskipTests

# Expose the port Spring Boot uses
EXPOSE 8080

# Run the JAR file
CMD ["java", "-jar", "target/chartapp-backend-0.0.1-SNAPSHOT.jar"]
