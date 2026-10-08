CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, org_id TEXT, data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_records_kind ON records(kind,updated_at);
CREATE INDEX IF NOT EXISTS idx_records_org ON records(org_id,kind);
CREATE TABLE IF NOT EXISTS audit (id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, kind TEXT, record_id TEXT, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS integrations (name TEXT PRIMARY KEY, state TEXT NOT NULL, last_check TEXT, details TEXT);
