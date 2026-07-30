package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import pl.atelierbypt.backend.dto.LoginRequest;
import pl.atelierbypt.backend.dto.LoginResponse;
import pl.atelierbypt.backend.enums.UserRole;
import pl.atelierbypt.backend.security.LoginAttemptService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String USERNAME = "admin";
    private static final String PASSWORD = "secret-password";
    private static final String CLIENT_ADDRESS = "203.0.113.10";

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private LoginAttemptService loginAttemptService;
    @Mock
    private Authentication authentication;

    private AuthService authService;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                authenticationManager,
                jwtService,
                loginAttemptService
        );
        loginRequest = new LoginRequest(USERNAME, PASSWORD);
    }

    @Test
    void shouldClearFailedAttemptsAfterSuccessfulAuthentication() {
        UserDetails userDetails = User.withUsername(USERNAME)
                .password(PASSWORD)
                .roles("ADMIN")
                .build();

        when(authenticationManager.authenticate(any(
                UsernamePasswordAuthenticationToken.class
        ))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("jwt-token");

        LoginResponse response =
                authService.login(loginRequest, CLIENT_ADDRESS);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.username()).isEqualTo(USERNAME);
        assertThat(response.role()).isEqualTo(UserRole.ADMIN);
        verify(loginAttemptService).ensureLoginAllowed(
                USERNAME,
                CLIENT_ADDRESS
        );
        verify(loginAttemptService).recordSuccessfulLogin(
                USERNAME,
                CLIENT_ADDRESS
        );
        verify(loginAttemptService, never()).recordFailedLogin(
                USERNAME,
                CLIENT_ADDRESS
        );
    }

    @Test
    void shouldRecordFailedAttemptWhenCredentialsAreInvalid() {
        when(authenticationManager.authenticate(any(
                UsernamePasswordAuthenticationToken.class
        ))).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() ->
                authService.login(loginRequest, CLIENT_ADDRESS))
                .isInstanceOf(BadCredentialsException.class);

        verify(loginAttemptService).ensureLoginAllowed(
                USERNAME,
                CLIENT_ADDRESS
        );
        verify(loginAttemptService).recordFailedLogin(
                USERNAME,
                CLIENT_ADDRESS
        );
        verify(loginAttemptService, never()).recordSuccessfulLogin(
                USERNAME,
                CLIENT_ADDRESS
        );
    }
}
