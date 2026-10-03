package com.cloudstack.controller;

import com.cloudstack.dto.ApiDtos.DeploymentRequest;
import com.cloudstack.exception.ResourceNotFoundException;
import com.cloudstack.model.Deployment;
import com.cloudstack.repository.DeploymentRepository;
import com.cloudstack.service.DeploymentSimulationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/deployments")
public class DeploymentController {
    private final DeploymentRepository deployments;
    private final DeploymentSimulationService simulationService;
    public DeploymentController(DeploymentRepository deployments, DeploymentSimulationService simulationService) {
        this.deployments = deployments; this.simulationService = simulationService;
    }
    @GetMapping
    public List<Deployment> getAll() { return deployments.findAllByOrderByCreatedDateDesc(); }
    @GetMapping("/{id}")
    public Deployment getOne(@PathVariable Long id) {
        return deployments.findById(id).orElseThrow(() -> new ResourceNotFoundException("Deployment not found."));
    }
    @PostMapping
    public Deployment simulate(@Valid @RequestBody DeploymentRequest request) { return simulationService.simulate(request); }
}
