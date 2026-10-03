package com.cloudstack.controller;

import com.cloudstack.dto.ApiDtos.LoginRequest;
import com.cloudstack.dto.ApiDtos.RegisterRequest;
import com.cloudstack.dto.ApiDtos.UserResponse;
import com.cloudstack.exception.ResourceNotFoundException;
import com.cloudstack.model.User;
import com.cloudstack.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository users;
    public UserController(UserRepository users) { this.users = users; }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        if (users.findByEmail(request.email()).isPresent()) throw new IllegalArgumentException("An account with this email already exists.");
        return UserResponse.from(users.save(new User(request.name(), request.email(), request.password(), User.Role.USER)));
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request) {
        User user = users.findByEmail(request.email())
                .filter(candidate -> candidate.getPassword().equals(request.password()))
                .orElseThrow(() -> new IllegalArgumentException("Email or password is incorrect."));
        return UserResponse.from(user);
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return users.findById(id).map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }
}
