package com.cloudstack.controller;

import com.cloudstack.dto.ApiDtos.ValidationResponse;
import com.cloudstack.exception.ResourceNotFoundException;
import com.cloudstack.model.CloudFormationTemplate;
import com.cloudstack.repository.CloudFormationTemplateRepository;
import com.cloudstack.service.TemplateValidationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {
    private final CloudFormationTemplateRepository templates;
    private final TemplateValidationService validationService;
    public TemplateController(CloudFormationTemplateRepository templates, TemplateValidationService validationService) {
        this.templates = templates; this.validationService = validationService;
    }

    @GetMapping
    public List<CloudFormationTemplate> getAll() { return templates.findAll(); }

    @GetMapping("/{id}")
    public CloudFormationTemplate getOne(@PathVariable Long id) { return findTemplate(id); }

    @PostMapping
    public CloudFormationTemplate create(@RequestBody CloudFormationTemplate template) {
        template.setId(null);
        validateTemplateInput(template);
        if (template.getVersion() == null || template.getVersion().isBlank()) template.setVersion("v1.0");
        if (template.getStatus() == null || template.getStatus().isBlank()) template.setStatus("Active");
        return templates.save(template);
    }

    @PutMapping("/{id}")
    public CloudFormationTemplate update(@PathVariable Long id, @RequestBody CloudFormationTemplate changes) {
        CloudFormationTemplate existing = findTemplate(id);
        validateTemplateInput(changes);
        existing.setName(changes.getName());
        existing.setDescription(changes.getDescription());
        existing.setEnvironment(changes.getEnvironment());
        existing.setYamlContent(changes.getYamlContent());
        existing.setVersion(changes.getVersion() == null || changes.getVersion().isBlank() ? existing.getVersion() : changes.getVersion());
        existing.setStatus(changes.getStatus() == null || changes.getStatus().isBlank() ? "Active" : changes.getStatus());
        return templates.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        templates.delete(findTemplate(id));
    }

    @PostMapping("/{id}/validate")
    public ValidationResponse validate(@PathVariable Long id) {
        return validationService.validate(findTemplate(id).getYamlContent());
    }

    private CloudFormationTemplate findTemplate(Long id) {
        return templates.findById(id).orElseThrow(() -> new ResourceNotFoundException("Template not found."));
    }

    private void validateTemplateInput(CloudFormationTemplate template) {
        if (template.getName() == null || template.getName().isBlank()) throw new IllegalArgumentException("Template name is required.");
        if (template.getEnvironment() == null || template.getEnvironment().isBlank()) throw new IllegalArgumentException("Environment is required.");
        if (template.getYamlContent() == null || template.getYamlContent().isBlank()) throw new IllegalArgumentException("YAML content is required.");
    }
}
