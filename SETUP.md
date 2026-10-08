# JELIX v3.1 — Built-in Owner HQ login

## Deploy
1. Replace the repository contents with this package (including the new `public/` directory) and commit to GitHub `main`. Do **not** upload secrets or a `.env` file.
2. In Cloudflare D1 `jelix-production` → Console, run the existing `migrations/0001_init.sql` if not already applied. Then run `migrations/0002_login_attempts.sql` (creates login rate-limit table).
3. In Cloudflare Workers → `jelix` → Settings → Variables and Secrets, add these four values. **Use Secret type for all except OWNER_EMAIL**:
   - `OWNER_EMAIL`: your administrator email address.
   - `OWNER_PASSWORD_SALT`: a random 32-byte hexadecimal value.
   - `OWNER_PASSWORD_HASH`: PBKDF2-SHA256 password digest, 310,000 iterations, 32 bytes, base64url encoded.
   - `SESSION_SECRET`: a distinct random 32-byte hexadecimal value.
4. Generate the three random values locally in Node.js (Windows PowerShell with Node installed):

```powershell
node -e "const c=require('node:crypto'); const p=process.argv[1]; if(!p||p.length<16)throw Error('Use a password of at least 16 characters'); const salt=c.randomBytes(32).toString('hex'); const hash=c.pbkdf2Sync(p,salt,310000,32,'sha256').toString('base64url'); console.log('OWNER_PASSWORD_SALT='+salt+'\nOWNER_PASSWORD_HASH='+hash+'\nSESSION_SECRET='+c.randomBytes(32).toString('hex'))" "YOUR_LONG_UNIQUE_PASSWORD"
```

**Warning:** entering a password as a shell argument may leave it in local shell history/process logs. Prefer running the command on your trusted computer and clear command history, or adapt it to prompt for a password interactively. Never paste the password or secret values into ChatGPT, GitHub, or screenshots.

5. Deploy Worker from GitHub. Open `https://YOUR-WORKER.workers.dev/owner-login.html` and sign in. Existing `owner-hq.html` and `v3.html` redirect unauthenticated visitors to login.
6. Test sign-out, bad password, direct unauthenticated API access, and that `/src/worker.js`, `/migrations/0001_init.sql`, `/.git/config`, and `/wrangler.jsonc` return 404 (or no sensitive content).

## Notes
- Built-in login is **owner-only**, not a customer identity system. The cookie is HttpOnly, Secure, SameSite=Strict, signed with HMAC and expires after 8 hours. Rotate `SESSION_SECRET` to invalidate all existing sessions.
- Login attempts are limited to 10 failed attempts per source IP per rolling 15 minutes (using D1); consider Cloudflare WAF/rate limiting for additional abuse protection.
- Static assets are now published only from `public/`; Worker source, SQL migrations, `.git`, and config are excluded.
- Existing classic Owner HQ widgets still save demo data to localStorage; v3 Business Operations uses D1. Do not store sensitive customer data until access controls have been reviewed and tested.
- `owner-login.html` and its JS are public by design; Owner HQ and API routes are protected by the Worker.
- For production, consider MFA, recovery procedures, revocable server-side sessions, audit logging for sign-ins, security review and customer-specific authentication.
