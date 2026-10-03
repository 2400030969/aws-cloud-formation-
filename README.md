# CloudStack – AWS CloudFormation Platform Template Standardization

CloudStack is a local, academic full-stack application that demonstrates how reusable AWS CloudFormation templates can standardize infrastructure across Development, Testing, and Production.

> **Simulation only:** CloudStack does not connect to AWS or create cloud resources. The deployment workflow is a locally generated simulation recorded in an in-memory H2 database. Its GitHub-style repository view is static demonstration data.

## Problem statement

Infrastructure that is configured separately by each team or environment can become inconsistent and difficult to maintain. CloudFormation templates provide a repeatable way to describe infrastructure. This project demonstrates creating and managing reusable template definitions, checking their basic structure, and walking through a simulated deployment lifecycle.

## Objectives

- Demonstrate reusable templates for Development, Testing, and Production.
- Provide a React dashboard backed by a Spring Boot REST API.
- Persist users, template definitions, and deployment simulations in H2.
- Validate basic CloudFormation YAML structure locally without calling AWS.
- Keep the source easy to understand and demonstrate in a B.Tech viva.

## Technologies

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite, JavaScript, React Router, CSS |
| Backend | Java 25, Spring Boot 3.5, Spring Web, Spring Data JPA, Maven |
| Database | H2 in-memory database |
| Local development | VS Code, Git, Node.js/npm, JDK 25+, Maven 3.9+ |

No Docker, AWS SDK, online database, cloud host, or GitHub API is needed.

## Architecture

```text
Browser (React at localhost:5173)
            │ REST / JSON
            ▼
Spring Boot API (localhost:8080)
            │ Spring Data JPA
            ▼
H2 in-memory database (cloudstack)
```

The H2 console is available at `http://localhost:8080/h2-console`. Use JDBC URL `jdbc:h2:mem:cloudstack`, username `sa`, and an empty password. The database is recreated when the backend restarts.

## Features

- Login and registration with a basic local demo account flow.
- Dashboard counts calculated from live API responses.
- Create, read, edit, and delete CloudFormation template records.
- Lightweight local checks for a format version, `Resources` section, and an AWS resource type.
- Template details with metadata and a resource type summary.
- Deployment simulation showing progress steps and recording a completed run.
- Deployment history, including stack, template, environment, region, status, and date.
- GitHub-style repository overview with illustrative files and commit details.
- Responsive sidebar navigation, profile view, and user-friendly API errors.

## Project structure

```text
cloudstack/
├── frontend/
│   ├── src/
│   │   ├── components/       # Shared navigation and page components
│   │   ├── pages/            # Dashboard, template, deployment, auth, and profile pages
│   │   ├── services/         # REST API client and local YAML checks
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── README.md
├── backend/
│   ├── src/main/java/com/cloudstack/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── exception/
│   │   ├── model/
│   │   ├── repository/
│   │   └── service/
│   ├── src/main/resources/application.properties
│   ├── pom.xml
│   └── README.md
└── README.md
```

## Database design

| Entity | Important fields |
| --- | --- |
| `User` | `id`, `name`, `email`, `password`, `role` (`USER` or `ADMIN`) |
| `CloudFormationTemplate` | `id`, `name`, `description`, `environment`, `yamlContent`, `version`, `status`, `createdDate`, `updatedDate` |
| `Deployment` | `id`, `stackName`, `templateId`, `templateName`, `environment`, `region`, `status`, `createdDate` |

The deployment keeps the template ID and name as a simple snapshot reference rather than requiring a JPA relationship. Sample data is inserted automatically when the application starts: two demo users, three templates, and three completed simulated deployments.

Demo login:

- Admin: `admin@cloudstack.local` / `admin123`
- User: `user@cloudstack.local` / `user123`

Passwords are kept simple for this academic demonstration. Do not use real credentials or treat this authentication as production-ready.

## REST API

The API base URL is `http://localhost:8080/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/users/register` | Create a local demo account |
| `POST` | `/users/login` | Verify demo credentials |
| `GET` | `/users/{id}` | Get a user profile (password excluded) |
| `GET` | `/templates` | List template records |
| `GET` | `/templates/{id}` | Get one template |
| `POST` | `/templates` | Create a template |
| `PUT` | `/templates/{id}` | Update a template |
| `DELETE` | `/templates/{id}` | Delete a template |
| `POST` | `/templates/{id}/validate` | Validate the saved YAML structure |
| `GET` | `/deployments` | List deployment simulations (newest first) |
| `GET` | `/deployments/{id}` | Get one simulation record |
| `POST` | `/deployments` | Simulate deployment and save its result |

Example create-template JSON:

```json
{
  "name": "Standard Web Infrastructure",
  "description": "Reusable development baseline",
  "environment": "Development",
  "version": "v1.0",
  "yamlContent": "AWSTemplateFormatVersion: '2010-09-09'\nResources:\n  StandardBucket:\n    Type: AWS::S3::Bucket"
}
```

Example deployment JSON:

```json
{
  "stackName": "platform-dev",
  "templateId": 1,
  "environment": "Development",
  "region": "us-east-1"
}
```

## Run locally

Requirements: JDK 25 or newer, Maven 3.9+, and Node.js/npm.

### Start the backend

```powershell
cd cloudstack/backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080`. Spring Boot permits API requests from the Vite development server at `http://localhost:5173`.

### Start the frontend

Open another terminal:

```powershell
cd cloudstack/frontend
npm install
npm run dev
```

Open `http://localhost:5173`, sign in using either demo account, or register a new local account.

## How simulation and validation work

The frontend first calls the saved-template validation endpoint. The simulation then displays seven illustrative progress steps and submits a request to `POST /api/deployments`. The backend verifies the template exists, briefly saves an `IN_PROGRESS` record, and updates that record to `CREATE_COMPLETE`. This is a local API/database workflow only; the listed VPC, subnet, security group, EC2, and S3 steps are examples, not actual AWS operations.

Validation is deliberately lightweight. It checks for non-empty YAML, `AWSTemplateFormatVersion`, a `Resources` section, and at least one named resource with an `AWS::` type. It is not a complete YAML parser or AWS CloudFormation validator.

The GitHub view displays the repository name `cloudstack-templates`, branch `main`, three illustrative YAML filenames, and the sample commit message “Updated CloudFormation template.” It does not access GitHub.

## Future enhancement

A future version could add an opt-in integration with real AWS CloudFormation, with secure credential handling, explicit deployment approvals, and validation using AWS tooling. That functionality is intentionally **not implemented** in this demo.
