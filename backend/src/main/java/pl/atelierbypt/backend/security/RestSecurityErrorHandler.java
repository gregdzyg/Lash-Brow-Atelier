package pl.atelierbypt.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import pl.atelierbypt.backend.dto.error.ErrorResponse;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RestSecurityErrorHandler
        implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authenticationException
    ) throws IOException {
        writeError(
                request,
                response,
                HttpStatus.UNAUTHORIZED,
                "Brak lub nieprawidłowe dane uwierzytelniające."
        );
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {
        writeError(
                request,
                response,
                HttpStatus.FORBIDDEN,
                "Brak uprawnień do wykonania tej operacji."
        );
    }

    public void writeUnauthorizedTokenError(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        writeError(
                request,
                response,
                HttpStatus.UNAUTHORIZED,
                "Token wygasł lub jest nieprawidłowy."
        );
    }

    private void writeError(
            HttpServletRequest request,
            HttpServletResponse response,
            HttpStatus status,
            String message
    ) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        objectMapper.writeValue(
                response.getOutputStream(),
                new ErrorResponse(
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        request.getRequestURI()
                )
        );
    }
}
