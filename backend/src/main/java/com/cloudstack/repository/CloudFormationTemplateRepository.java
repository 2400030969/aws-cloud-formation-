package com.cloudstack.repository;

import com.cloudstack.model.CloudFormationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CloudFormationTemplateRepository extends JpaRepository<CloudFormationTemplate, Long> {}
