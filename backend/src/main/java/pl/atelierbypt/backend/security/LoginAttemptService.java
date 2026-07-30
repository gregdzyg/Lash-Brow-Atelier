package pl.atelierbypt.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import pl.atelierbypt.backend.exception.LoginRateLimitExceededException;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class LoginAttemptService {

    private final Clock applicationClock;
    private final int maximumFailedAttempts;
    private final Duration attemptWindow;
    private final Duration lockDuration;
    private final ConcurrentMap<LoginAttemptKey, LoginAttemptState> attempts =
            new ConcurrentHashMap<>();

    public LoginAttemptService(
            Clock applicationClock,
            @Value("${app.security.login.max-failed-attempts}")
            int maximumFailedAttempts,
            @Value("${app.security.login.attempt-window-minutes}")
            long attemptWindowMinutes,
            @Value("${app.security.login.lock-duration-minutes}")
            long lockDurationMinutes
    ) {
        if (maximumFailedAttempts < 1
                || attemptWindowMinutes < 1
                || lockDurationMinutes < 1) {
            throw new IllegalArgumentException(
                    "Login rate limit values must be positive."
            );
        }

        this.applicationClock = applicationClock;
        this.maximumFailedAttempts = maximumFailedAttempts;
        this.attemptWindow = Duration.ofMinutes(attemptWindowMinutes);
        this.lockDuration = Duration.ofMinutes(lockDurationMinutes);
    }

    public void ensureLoginAllowed(
            String username,
            String clientAddress
    ) {
        LoginAttemptKey key = createKey(username, clientAddress);
        LoginAttemptState state = attempts.get(key);

        if (state == null) {
            return;
        }

        Instant now = applicationClock.instant();

        if (state.isBlockedAt(now)) {
            throw createRateLimitException(now, state.blockedUntil());
        }

        if (state.hasExpiredAt(now, attemptWindow)) {
            attempts.remove(key, state);
        }
    }

    public void recordFailedLogin(
            String username,
            String clientAddress
    ) {
        LoginAttemptKey key = createKey(username, clientAddress);
        Instant now = applicationClock.instant();

        LoginAttemptState updatedState = attempts.compute(
                key,
                (ignoredKey, currentState) ->
                        createUpdatedState(currentState, now)
        );

        if (updatedState.isBlockedAt(now)) {
            throw createRateLimitException(
                    now,
                    updatedState.blockedUntil()
            );
        }
    }

    public void recordSuccessfulLogin(
            String username,
            String clientAddress
    ) {
        attempts.remove(createKey(username, clientAddress));
    }

    private LoginAttemptState createUpdatedState(
            LoginAttemptState currentState,
            Instant now
    ) {
        if (currentState == null
                || currentState.hasExpiredAt(now, attemptWindow)) {
            return new LoginAttemptState(1, now, null);
        }

        if (currentState.isBlockedAt(now)) {
            return currentState;
        }

        int failedAttempts = currentState.failedAttempts() + 1;
        Instant blockedUntil = failedAttempts >= maximumFailedAttempts
                ? now.plus(lockDuration)
                : null;

        return new LoginAttemptState(
                failedAttempts,
                currentState.windowStartedAt(),
                blockedUntil
        );
    }

    private LoginAttemptKey createKey(
            String username,
            String clientAddress
    ) {
        String normalizedUsername = username == null
                ? ""
                : username.strip().toLowerCase(Locale.ROOT);
        String normalizedClientAddress = clientAddress == null
                ? ""
                : clientAddress.strip();

        return new LoginAttemptKey(
                normalizedUsername,
                normalizedClientAddress
        );
    }

    private LoginRateLimitExceededException createRateLimitException(
            Instant now,
            Instant blockedUntil
    ) {
        long remainingMilliseconds = Math.max(
                1,
                Duration.between(now, blockedUntil).toMillis()
        );
        long retryAfterSeconds = Math.max(
                1,
                (remainingMilliseconds + 999) / 1000
        );
        long retryAfterMinutes = Math.max(
                1,
                (retryAfterSeconds + 59) / 60
        );

        return new LoginRateLimitExceededException(
                "Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za "
                        + retryAfterMinutes
                        + " min.",
                retryAfterSeconds
        );
    }

    private record LoginAttemptKey(
            String username,
            String clientAddress
    ) {
    }

    private record LoginAttemptState(
            int failedAttempts,
            Instant windowStartedAt,
            Instant blockedUntil
    ) {
        private boolean isBlockedAt(Instant now) {
            return blockedUntil != null && now.isBefore(blockedUntil);
        }

        private boolean hasExpiredAt(
                Instant now,
                Duration attemptWindow
        ) {
            if (blockedUntil != null) {
                return !now.isBefore(blockedUntil);
            }

            return !now.isBefore(windowStartedAt.plus(attemptWindow));
        }
    }
}
