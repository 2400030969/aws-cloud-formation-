package com.cloudstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Deployment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String stackName;
    @Column(nullable = false)
    private Long templateId;
    private String templateName;
    private String environment;
    private String region;
    private String status;
    private LocalDateTime createdDate;

    @PrePersist
    void onCreate() { createdDate = LocalDateTime.now(); }

    public Deployment() {}
    public Deployment(String stackName, Long templateId, String templateName, String environment, String region, String status) {
        this.stackName = stackName; this.templateId = templateId; this.templateName = templateName;
        this.environment = environment; this.region = region; this.status = status;
    }
    public Long getId() { return id; }
    public String getStackName() { return stackName; }
    public void setStackName(String stackName) { this.stackName = stackName; }
    public Long getTemplateId() { return templateId; }
    public void setTemplateId(Long templateId) { this.templateId = templateId; }
    public String getTemplateName() { return templateName; }
    public void setTemplateName(String templateName) { this.templateName = templateName; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedDate() { return createdDate; }
}
