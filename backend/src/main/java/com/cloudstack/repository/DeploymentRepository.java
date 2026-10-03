package com.cloudstack.repository;

import com.cloudstack.model.Deployment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeploymentRepository extends JpaRepository<Deployment, Long> {
    List<Deployment> findAllByOrderByCreatedDateDesc();
}
