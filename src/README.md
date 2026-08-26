# Email Threat Detection Backend — Module 2: Email Investigation

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create your Supabase project** at https://supabase.com, then in the SQL Editor run the contents of `schema.sql`.

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project settings (Project Settings → API).

4. **Run the server**
   ```bash
   npm start
   ```
   Or with auto-reload during development:
   ```bash
   npm install -D nodemon
   npm run dev
   ```

## Test it

Upload a raw `.eml` file:
```bash
curl -X POST http://localhost:3000/api/emails \
  -F "file=@sample.eml"
```

Fetch the parsed record:
```bash
curl http://localhost:3000/api/emails/{email_id}
```

List all investigated emails:
```bash
curl http://localhost:3000/api/emails
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/emails | Upload and parse a raw .eml file |
| GET | /api/emails/:id | Get full parsed record (headers, body, attachments, links) |
| GET | /api/emails | List all investigated emails |
| GET | /health | Health check |

## Next module

Once this is working and validated against real .eml samples, build **Module 3: Email Header Forensics**, which reads `parsed_headers` from the `emails` table to run SPF/DKIM/DMARC validation.
