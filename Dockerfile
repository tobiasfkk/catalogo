FROM openjdk:21

COPY . /usr/src/myapp

WORKDIR /usr/src/myapp

RUN ./mvnw clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/catalogo-backend-0.0.1-SNAPSHOT.jar"]

