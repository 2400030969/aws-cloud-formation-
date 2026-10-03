# CloudStack backend

Spring Boot REST API for the local CloudStack demonstration. Java 25+, Maven 3.9+, and no external services are required.

## Run

```powershell
mvn spring-boot:run
```

API: `http://localhost:8080/api`

H2 console: `http://localhost:8080/h2-console`

JDBC URL: `jdbc:h2:mem:cloudstack`; username `sa`; blank password.

The in-memory database is recreated on restart and seeded with two demo users, three templates, and three simulated deployments. Demo credentials are documented in the root README; passwords and login are intentionally simplified for academic use only.

Controllers expose user, template, and deployment endpoints. `TemplateValidationService` performs basic structure checks; `DeploymentSimulationService` records a local simulated lifecycle and never contacts AWS.
