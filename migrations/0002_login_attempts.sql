CREATE TABLE IF NOT EXISTS login_attempts (ip_hash TEXT NOT NULL, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_at ON login_attempts(ip_hash, at);
