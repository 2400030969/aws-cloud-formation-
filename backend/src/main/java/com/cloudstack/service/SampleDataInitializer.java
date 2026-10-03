package com.cloudstack.service;

import com.cloudstack.model.CloudFormationTemplate;
import com.cloudstack.model.Deployment;
import com.cloudstack.model.User;
import com.cloudstack.repository.CloudFormationTemplateRepository;
import com.cloudstack.repository.DeploymentRepository;
import com.cloudstack.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SampleDataInitializer {
    private static final String SAMPLE_YAML = """
            AWSTemplateFormatVersion: '2010-09-09'
            Description: Standard Web Infrastructure
            Parameters:
              EnvironmentName:
                Type: String
                Default: Dev
            Resources:
              StandardVPC:
                Type: AWS::EC2::VPC
                Properties:
                  CidrBlock: 10.0.0.0/16
                  Tags:
                    - Key: Name
                      Value: !Sub "${EnvironmentName}-VPC"
              StandardBucket:
                Type: AWS::S3::Bucket
                Properties:
                  Tags:
                    - Key: Environment
                      Value: !Ref EnvironmentName
            Outputs:
              VPCId:
                Value: !Ref StandardVPC
            """;

    @Bean
    CommandLineRunner loadSampleData(UserRepository users, CloudFormationTemplateRepository templates,
                                     DeploymentRepository deployments) {
        return args -> {
            if (users.count() == 0) {
                users.save(new User("CloudStack Admin", "admin@cloudstack.local", "admin123", User.Role.ADMIN));
                users.save(new User("Demo User", "user@cloudstack.local", "user123", User.Role.USER));
            }
            if (templates.count() == 0) {
                CloudFormationTemplate dev = templates.save(new CloudFormationTemplate(
                        "Standard Web Infrastructure", "Reusable VPC and storage baseline for development.", "Development", SAMPLE_YAML, "v1.0"));
                CloudFormationTemplate test = templates.save(new CloudFormationTemplate(
                        "Standard Application Infrastructure", "Consistent application resources for testing.", "Testing",
                        SAMPLE_YAML.replace("Standard Web Infrastructure", "Standard Application Infrastructure"), "v1.2"));
                CloudFormationTemplate prod = templates.save(new CloudFormationTemplate(
                        "Production Web Infrastructure", "Production environment baseline with reusable resources.", "Production",
                        SAMPLE_YAML.replace("Standard Web Infrastructure", "Production Web Infrastructure"), "v2.0"));
                if (deployments.count() == 0) {
                    deployments.save(new Deployment("platform-dev", dev.getId(), dev.getName(), "Development", "us-east-1", "CREATE_COMPLETE"));
                    deployments.save(new Deployment("platform-test", test.getId(), test.getName(), "Testing", "us-east-1", "CREATE_COMPLETE"));
                    deployments.save(new Deployment("platform-prod", prod.getId(), prod.getName(), "Production", "us-east-1", "CREATE_COMPLETE"));
                }
            }
        };
    }
}
