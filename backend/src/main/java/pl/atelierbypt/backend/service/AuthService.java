package pl.atelierbypt.backend.service;


import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.LoginRequest;
import pl.atelierbypt.backend.dto.LoginResponse;
import pl.atelierbypt.backend.enums.UserRole;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager  authenticationManager;
    private final JwtService jwtService;
    public LoginResponse login(LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        String authority = userDetails.getAuthorities().iterator().next().getAuthority();
        UserRole role = UserRole.valueOf(authority.replace("ROLE_", ""));

        return new LoginResponse(token, userDetails.getUsername(), role);
    }
}
