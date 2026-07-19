package pl.atelierbypt.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.NonNull;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import pl.atelierbypt.backend.service.CustomUserDetailsService;
import pl.atelierbypt.backend.service.JwtService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
    throws ServletException, IOException {

       String authorizationHeader = request.getHeader("Authorization");

       if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
           filterChain.doFilter(request, response);
           return;
       }

       String token = authorizationHeader.substring(7);
       String username = jwtService.extractUsername(token);
       UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

       boolean isValid = jwtService.isTokenValid(token, userDetails);
       if (!isValid) {
           throw new BadCredentialsException("Invalid token");
       }

       UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
               userDetails, null, userDetails.getAuthorities()
       );
       authentication.setDetails(new WebAuthenticationDetails(request));
       SecurityContextHolder.getContext().setAuthentication(authentication);
       filterChain.doFilter(request, response);
    }
}
