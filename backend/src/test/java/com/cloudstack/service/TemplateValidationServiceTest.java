package com.cloudstack.service;

import com.cloudstack.dto.ApiDtos.ValidationResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TemplateValidationServiceTest {
    private final TemplateValidationService service = new TemplateValidationService();

    @Test
    void acceptsTemplateWithVersionAndAtLeastOneAwsResource() {
        String yaml = """
                AWSTemplateFormatVersion: '2010-09-09'
                Resources:
                  Bucket:
                    Type: AWS::S3::Bucket
                """;

        ValidationResponse response = service.validate(yaml);

        assertTrue(response.valid());
        assertTrue(response.errors().isEmpty());
    }

    @Test
    void rejectsEmptyTemplate() {
        ValidationResponse response = service.validate("  ");

        assertFalse(response.valid());
        assertEquals("YAML content cannot be empty.", response.errors().get(0));
    }

    @Test
    void reportsMissingVersionAndResourceType() {
        ValidationResponse response = service.validate("Resources:\n  Bucket:\n    Properties: {}");

        assertFalse(response.valid());
        assertTrue(response.errors().contains("Missing AWSTemplateFormatVersion."));
        assertTrue(response.errors().contains("Resources must contain at least one named AWS resource and an AWS:: type."));
    }
}
