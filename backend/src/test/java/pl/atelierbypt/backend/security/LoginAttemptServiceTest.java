package pl.atelierbypt.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pl.atelierbypt.backend.exception.LoginRateLimitExceededException;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoginAttemptServiceTest {

    private static final String USERNAME = "admin";
    private static final String CLIENT_ADDRESS = "203.0.113.10";

    private MutableClock applicationClock;
    private LoginAttemptService loginAttemptService;

    @BeforeEach
    void setUp() {
        applicationClock = new MutableClock(
                Instant.parse("2026-07-30T10:00:00Z"),
                ZoneOffset.UTC
        );
        loginAttemptService = new LoginAttemptService(
                applicationClock,
                5,
                15,
                15
        );
    }

    @Test
    void shouldBlockLoginOnFifthFailedAttempt() {
        for (int attempt = 1; attempt < 5; attempt++) {
            loginAttemptService.recordFailedLogin(
                    USERNAME,
                    CLIENT_ADDRESS
            );
        }

        assertThatThrownBy(() ->
                loginAttemptService.recordFailedLogin(
                        USERNAME,
                        CLIENT_ADDRESS
                ))
                .isInstanceOf(LoginRateLimitExceededException.class)
                .hasMessage(
                        "Zbyt wiele nieudanych prób logowania. "
                                + "Spróbuj ponownie za 15 min."
                )
                .extracting("retryAfterSeconds")
                .isEqualTo(900L);
    }

    @Test
    void shouldKeepLoginBlockedUntilLockExpires() {
        reachFailedAttemptLimit();

        assertThatThrownBy(() ->
                loginAttemptService.ensureLoginAllowed(
                        USERNAME,
                        CLIENT_ADDRESS
                ))
                .isInstanceOf(LoginRateLimitExceededException.class);

        applicationClock.advance(Duration.ofMinutes(15));

        assertThatCode(() ->
                loginAttemptService.ensureLoginAllowed(
                        USERNAME,
                        CLIENT_ADDRESS
                ))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldClearFailedAttemptsAfterSuccessfulLogin() {
        for (int attempt = 1; attempt < 5; attempt++) {
            loginAttemptService.recordFailedLogin(
                    USERNAME,
                    CLIENT_ADDRESS
            );
        }

        loginAttemptService.recordSuccessfulLogin(
                USERNAME,
                CLIENT_ADDRESS
        );

        assertThatCode(() ->
                loginAttemptService.recordFailedLogin(
                        USERNAME,
                        CLIENT_ADDRESS
                ))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldTrackDifferentClientAddressesSeparately() {
        reachFailedAttemptLimit();

        assertThatCode(() ->
                loginAttemptService.ensureLoginAllowed(
                        USERNAME,
                        "203.0.113.11"
                ))
                .doesNotThrowAnyException();
    }

    private void reachFailedAttemptLimit() {
        for (int attempt = 1; attempt <= 5; attempt++) {
            try {
                loginAttemptService.recordFailedLogin(
                        USERNAME,
                        CLIENT_ADDRESS
                );
            } catch (LoginRateLimitExceededException ignored) {
                // The fifth failed attempt starts the temporary lock.
            }
        }
    }

    private static final class MutableClock extends Clock {

        private Instant currentInstant;
        private final ZoneId zone;

        private MutableClock(Instant currentInstant, ZoneId zone) {
            this.currentInstant = currentInstant;
            this.zone = zone;
        }

        private void advance(Duration duration) {
            currentInstant = currentInstant.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return zone;
        }

        @Override
        public Clock withZone(ZoneId requestedZone) {
            return new MutableClock(currentInstant, requestedZone);
        }

        @Override
        public Instant instant() {
            return currentInstant;
        }
    }
}
