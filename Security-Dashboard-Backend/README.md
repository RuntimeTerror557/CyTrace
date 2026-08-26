\# Module 5 - Security Dashboard Backend



\## Overview



The Security Dashboard Backend provides REST APIs for centralized

security monitoring and visualization.



It provides information about:



\- Email activity

\- Threat distribution

\- Risk trends

\- Recent investigations

\- Incident statistics



\## Technology Stack



\- Node.js

\- Express.js

\- CORS

\- REST API

\- JSON



\## Project Structure



Security-Dashboard-Backend/

│

├── data/

│   └── dashboardData.js

│

├── routes/

│   └── dashboardRoutes.js

│

├── server.js

├── package.json

└── package-lock.json



\## API Endpoints



\### Health Check



GET /api/health



\### Dashboard Overview



GET /api/dashboard/overview



\### Threat Distribution



GET /api/dashboard/threats



\### Risk Trends



GET /api/dashboard/trends



\### Risk Trends with Filtering



GET /api/dashboard/trends?days=7



\### Recent Investigations



GET /api/dashboard/recent



\### Filter Investigations



GET /api/dashboard/recent?risk=High



GET /api/dashboard/recent?status=Open



\### Incident Statistics



GET /api/dashboard/incidents



\### Complete Dashboard Summary



GET /api/dashboard/summary



\## Current Implementation



The current framework uses mock security data.



The data layer can later be replaced with a

database such as Supabase or PostgreSQL.



\## Future Enhancements



\- Database integration

\- Real-time dashboard updates

\- Authentication

\- Role-based access control

\- Advanced threat analytics

\- Real-time incident monitoring

\- Integration with Email Investigation

\- Integration with Header Forensics

\- Integration with AI Threat Detection

\- Integration with Incident Management

