package com.cloudstack.dto;

import com.cloudstack.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class ApiDtos {
    private ApiDtos() {}
    public record RegisterRequest(@NotBlank String name, @Email @NotBlank String email, @NotBlank String password) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record UserResponse(Long id, String name, String email, User.Role role) {
        public static UserResponse from(User user) {
            return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
        }
    }
    public record ValidationResponse(boolean valid, java.util.List<String> errors) {}
    public record DeploymentRequest(@NotBlank String stackName, @NotNull Long templateId, @NotBlank String environment,
                                    @NotBlank String region) {}
}
