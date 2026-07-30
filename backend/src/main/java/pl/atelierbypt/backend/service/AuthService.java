package pl.atelierbypt.backend.service;


import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.LoginRequest;
import pl.atelierbypt.backend.dto.LoginResponse;
import pl.atelierbypt.backend.enums.UserRole;
import pl.atelierbypt.backend.security.LoginAttemptService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager  authenticationManager;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;

    public LoginResponse login(
            LoginRequest loginRequest,
            String clientAddress
    ) {
        String username = loginRequest.username();
        loginAttemptService.ensureLoginAllowed(
                username,
                clientAddress
        );

        Authentication authentication;

        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            username,
                            loginRequest.password()
                    )
            );
        } catch (BadCredentialsException exception) {
            loginAttemptService.recordFailedLogin(
                    username,
                    clientAddress
            );
            throw exception;
        }

        loginAttemptService.recordSuccessfulLogin(
                username,
                clientAddress
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        String authority = userDetails.getAuthorities().iterator().next().getAuthority();
        UserRole role = UserRole.valueOf(authority.replace("ROLE_", ""));

        return new LoginResponse(token, userDetails.getUsername(), role);
    }
}
