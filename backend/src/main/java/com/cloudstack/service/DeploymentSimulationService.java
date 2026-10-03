package com.cloudstack.service;

import com.cloudstack.dto.ApiDtos.DeploymentRequest;
import com.cloudstack.exception.ResourceNotFoundException;
import com.cloudstack.model.CloudFormationTemplate;
import com.cloudstack.model.Deployment;
import com.cloudstack.repository.CloudFormationTemplateRepository;
import com.cloudstack.repository.DeploymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeploymentSimulationService {
    private final CloudFormationTemplateRepository templateRepository;
    private final DeploymentRepository deploymentRepository;

    public DeploymentSimulationService(CloudFormationTemplateRepository templateRepository, DeploymentRepository deploymentRepository) {
        this.templateRepository = templateRepository; this.deploymentRepository = deploymentRepository;
    }

    @Transactional
    public Deployment simulate(DeploymentRequest request) {
        CloudFormationTemplate template = templateRepository.findById(request.templateId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found."));
        Deployment deployment = new Deployment(request.stackName(), template.getId(), template.getName(),
                request.environment(), request.region(), "IN_PROGRESS");
        deploymentRepository.saveAndFlush(deployment);
        deployment.setStatus("CREATE_COMPLETE");
        return deploymentRepository.save(deployment);
    }
}
