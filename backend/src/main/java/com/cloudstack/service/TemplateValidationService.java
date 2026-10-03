package com.cloudstack.service;

import com.cloudstack.dto.ApiDtos.ValidationResponse;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class TemplateValidationService {
    private static final Pattern RESOURCE = Pattern.compile("(?m)^\\s{2}[A-Za-z][A-Za-z0-9]*:\\s*$");

    public ValidationResponse validate(String yaml) {
        List<String> errors = new ArrayList<>();
        if (yaml == null || yaml.isBlank()) {
            errors.add("YAML content cannot be empty.");
            return new ValidationResponse(false, errors);
        }
        if (!yaml.contains("AWSTemplateFormatVersion:")) errors.add("Missing AWSTemplateFormatVersion.");
        if (!Pattern.compile("(?m)^Resources\\s*:\\s*$").matcher(yaml).find()) {
            errors.add("Missing Resources section.");
        } else {
            String resources = yaml.substring(yaml.indexOf("Resources:") + "Resources:".length());
            if (!RESOURCE.matcher(resources).find() || !resources.contains("Type: AWS::")) {
                errors.add("Resources must contain at least one named AWS resource and an AWS:: type.");
            }
        }
        return new ValidationResponse(errors.isEmpty(), errors);
    }
}
