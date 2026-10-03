package com.cloudstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class CloudFormationTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(length = 1000)
    private String description;
    @Column(nullable = false)
    private String environment;
    @Lob
    @Column(nullable = false)
    private String yamlContent;
    private String version = "v1.0";
    private String status = "Active";
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    @PrePersist
    void onCreate() { createdDate = LocalDateTime.now(); updatedDate = createdDate; }
    @PreUpdate
    void onUpdate() { updatedDate = LocalDateTime.now(); }

    public CloudFormationTemplate() {}
    public CloudFormationTemplate(String name, String description, String environment, String yamlContent, String version) {
        this.name = name; this.description = description; this.environment = environment;
        this.yamlContent = yamlContent; this.version = version; this.status = "Active";
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public String getYamlContent() { return yamlContent; }
    public void setYamlContent(String yamlContent) { this.yamlContent = yamlContent; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public LocalDateTime getUpdatedDate() { return updatedDate; }
}
