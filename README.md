## AI-Powered Worker Productivity Dashboard

A production-ready full-stack web application for monitoring worker productivity in manufacturing facilities using AI-powered CCTV camera events.

## Architecture Overview

### System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   AI-Powered    │         │                  │         │                 │
│  CCTV Cameras   │────────▶│  Node/Express Backend │────────▶│    MongoDB      │
│  (Edge Devices) │  JSON   │                  │         │    Database     │
└─────────────────┘ Events  └──────────────────┘         └─────────────────┘
                                     │
                                     │ REST API
                                     ▼
                            ┌──────────────────┐
                            │  React Frontend  │
                            │    Dashboard     │
                            └──────────────────┘
```

### Component Breakdown

**Edge Devices (AI CCTV Cameras):**
- Computer vision models detect worker activities
- Generate structured JSON events
- Send events to backend API via HTTP POST

**Backend (Node/Express):**
- Ingests AI events via REST API
- Computes real-time productivity metrics
- Provides endpoints for dashboard data
- Handles duplicate detection and event ordering

**Alternate Backend (Node.js/Express):**
- Available in `backend-js/`
- Mirrors legacy FastAPI routes and logic exactly
- Uses MongoDB with Mongoose for schema compatibility
- Same request/response shapes and status codes

**Database (MongoDB):**
- Stores worker and workstation metadata
- Persists all AI events
- Enables historical analysis

**Frontend (React):**
- Real-time dashboard with metrics
- Worker and workstation views
- Live activity feed
- Responsive industrial design

## Local Development

### Environment Variables

The backend uses `dotenv` and looks for the following variables (you can copy and rename `.env.example`):

```env
# backend/.env
MONGO_URL=mongodb://localhost:27017        # default database server
DB_NAME=AI_Dashboard                       # database name
PORT=3001                                  # server port
CORS_ORIGINS=*
```

You can also create a system-wide `.env` file at the project root; the backend will read the first one it finds.

### Frontend Environment Variables

The frontend is a React + Vite application that needs to know where the backend API is located. Copy `frontend/.env.example` to `frontend/.env.local`:

```env
# frontend/.env.local
VITE_BACKEND_URL=http://localhost:3001    # backend API URL
```

> 📝 **Important:** In Vite, environment variables must be prefixed with `VITE_` to be accessible in the browser via `import.meta.env`.

When deployed, update this to point to your production backend (e.g. a Render service URL).

### Running MongoDB

You need a running MongoDB instance for the API to connect. A couple of easy options:

1. **Docker Compose**
   ```bash
   cd backend
   docker-compose up -d          # starts mongodb + backend in development mode
   ```
   A `backend/docker-compose.yml` file is included for convenience.

2. **Local install or Atlas**
   - Install MongoDB locally and run `mongod`.
   - Or use a hosted cluster (e.g. MongoDB Atlas) and set `MONGO_URL` accordingly.

> ⚠️ The error below appears when no MongoDB server is reachable:
>
> ```text
> Mongo connection error: MongooseServerSelectionError: connect ECONNREFUSED ::1:27017
> ```
>
> Make sure the database is running and `MONGO_URL` points to the correct host.

### Docker Compose (optional)

A sample compose file lives in `backend/docker-compose.yml`:

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build:
      context: .
    depends_on:
      - mongo
    environment:
      - MONGO_URL=mongodb://mongo:27017
      - DB_NAME=AI_Dashboard
      - PORT=3001
      - CORS_ORIGINS=*
    volumes:
      - .:/usr/src/app
    working_dir: /usr/src/app
    command: npm run dev
    ports:
      - "3001:3001"

volumes:
  mongo_data:
```

### Quick Start (Local Development)

To run the entire stack locally:

**Terminal 1 — Start MongoDB + Backend:**
```bash
cd backend
docker-compose up
```
This starts MongoDB on port 27017 and the Express server on port 3001.

**Terminal 2 — Start Frontend:**
```bash
cd frontend
npm install         # if first run
npm run dev
```
This starts the Vite dev server on port 3000, with live reload enabled.

Then open http://localhost:3000 in your browser.

If you're not using Docker Compose, ensure:
- MongoDB is running (locally or on Atlas with IP whitelisted)
- `backend/.env` has the correct `MONGO_URL` and `PORT=3001`
- `frontend/.env.local` has `VITE_BACKEND_URL=http://localhost:3001`

### Deploying to Render

Render is a popular platform for hosting Node.js web services, but it does **not** provide a bundled MongoDB server. To launch the backend you must:

1. **Provision a database** (MongoDB Atlas, mLab, or another hosted cluster).
   - Copy the connection string into `MONGO_URL` (set as an environment variable on Render).
2. **Set environment variables** in the Render dashboard (the same ones listed in "Environment Variables" above).
   - Render automatically injects a `PORT` variable; the application logs a message showing which port it bound to.  The server now binds to the port immediately during startup so that logs like `No open ports detected` do not appear even if the database connection is still pending.
   - The `ECONNREFUSED ::1:27017` error occurs when the service attempts to connect to `localhost`; on Render there is no server listening, so make sure `MONGO_URL` points to a reachable host.
3. **View logs** via the Render dashboard (`Logs` tab) or the CLI `render logs service-name --since 1h`.
   - `console.log` and `console.error` output from `app.js` appear there.
   - The repeated message `No open ports detected` is Render's way of telling you the process exited before binding a port. It usually means the app crashed (e.g. because Mongo was unavailable).

To improve reliability you can add retry logic or a startup script that waits for the database. The current code already prints environment values on failure to aid debugging.

#### Frontend on Render

The frontend is a static site built with Vite and React. To deploy it:

1. Create a **new Render service** for the frontend (separate from the backend service).
2. Use `npm run build` as the build command and `dist/` as the publish directory.
3. Set the environment variable `VITE_BACKEND_URL` to your backend service URL:
   - If backend is at `https://ai-worker-backend.onrender.com`, set `VITE_BACKEND_URL=https://ai-worker-backend.onrender.com`
   - This tells the frontend where to send API requests.
4. Deploy and Render will serve the built static files; requests to `/api/*` will be proxied by the frontend's Vite config to the backend.

> 💡 Tip: If both frontend and backend are on Render, set `VITE_BACKEND_URL` to your backend service's full URL. The frontend will make cross-origin requests to it.



## Database Schema

### Collections

#### 1. Workers Collection
```javascript
{
  \"worker_id\": \"W1\",           // Unique identifier
  \"name\": \"Marco Rossi\",       // Worker name
  \"role\": \"Assembly Specialist\", // Job role
  \"image_url\": \"https://...\"   // Profile image
}
```

#### 2. Workstations Collection
```javascript
{
  \"station_id\": \"S1\",          // Unique identifier
  \"name\": \"Assembly Unit A\",   // Station name
  \"station_type\": \"Assembly\",  // Type of station
  \"image_url\": \"https://...\"   // Station image
}
```

#### 3. AI Events Collection
```javascript
{
  \"timestamp\": \"2026-01-15T10:15:00Z\", // ISO 8601 format
  \"worker_id\": \"W1\",           // Reference to worker
  \"workstation_id\": \"S3\",      // Reference to workstation
  \"event_type\": \"working\",     // working | idle | absent | product_count
  \"confidence\": 0.93,          // AI model confidence (0-1)
  \"count\": 0                   // Units produced (for product_count events)
}
```

### Indexes (Recommended for Production)
- `ai_events.timestamp` (descending) - for time-based queries
- `ai_events.worker_id` - for worker-specific metrics
- `ai_events.workstation_id` - for station-specific metrics
- Compound index: `{worker_id: 1, timestamp: -1}` - for worker timelines

## Metrics Definitions

### Assumptions

1. **Time Calculation:** Each event represents a 30-minute time window
2. **Working State:** \"working\" events indicate active production time
3. **Idle State:** \"idle\" events indicate non-productive time at station
4. **Production Events:** \"product_count\" events aggregate units produced during work periods
5. **Shift Duration:** Calculations assume 8-hour shifts for utilization percentages

### Worker-Level Metrics

**Total Active Time:**
```
Sum of all \"working\" events × 0.5 hours
```

**Total Idle Time:**
```
Sum of all \"idle\" events × 0.5 hours
```

**Utilization Percentage:**
```
(Total Active Time / (Total Active Time + Total Idle Time)) × 100
```

**Total Units Produced:**
```
Sum of \"count\" field in all \"product_count\" events
```

**Units Per Hour:**
```
Total Units Produced / Total Active Time
```

**Status:** Based on most recent event (active | idle | offline)

### Workstation-Level Metrics

**Occupancy Time:**
```
Sum of all \"working\" events at station × 0.5 hours
```

**Utilization Percentage:**
```
(Occupancy Time / (8 hours × 6 workers)) × 100
Maximum possible time = 48 worker-hours per shift
```

**Total Units Produced:**
```
Sum of all \"product_count\" events at station
```

**Throughput Rate:**
```
Total Units Produced / Occupancy Time (units per hour)
```

### Factory-Level Metrics

**Total Productive Time:**
```
Sum of all \"working\" events across all workers × 0.5 hours
```

**Total Production Count:**
```
Sum of all \"product_count\" events across factory
```

**Average Production Rate:**
```
Total Production Count / 8 hours (factory shift duration)
```

**Average Utilization:**
```
(Total \"working\" events / Total events) × 100
```

**Worker Status Counts:**
- Active: Workers with recent \"working\" events
- Idle: Workers with recent \"idle\" events (not in active set)
- Offline: Workers with no recent events

## Edge Case Handling

### 1. Intermittent Connectivity

**Problem:** Edge devices may lose network connection, buffering events locally.

**Solutions:**
- **Event Buffering:** Edge devices queue events with local timestamps
- **Batch Upload:** On reconnection, send events in batches with original timestamps
- **Backend Handling:** Accept out-of-order events (see below)
- **Status Indicators:** Dashboard shows last event timestamp per device
- **Timeout Logic:** Workers marked \"offline\" if no events for >15 minutes

**Implementation:**
```python
# Backend accepts events with any timestamp
# Metrics recalculated on-demand using all stored events
# No real-time state assumptions
```

### 2. Duplicate Events

**Problem:** Network retries or device errors may send the same event multiple times.

**Solutions:**
- **Event Fingerprinting:** Create unique hash from (timestamp, worker_id, workstation_id, event_type)
- **Database Constraints:** Unique index on fingerprint field
- **Idempotent Inserts:** Backend checks for existing events before insertion
- **Client-Side IDs:** Edge devices generate UUIDs for each event

**Implementation:**
```python
# Option 1: Hash-based deduplication
event_hash = hashlib.sha256(
    f\"{timestamp}{worker_id}{workstation_id}{event_type}\".encode()
).hexdigest()

# Option 2: Check before insert
existing = await db.ai_events.find_one({
    \"timestamp\": timestamp,
    \"worker_id\": worker_id,
    \"workstation_id\": workstation_id,
    \"event_type\": event_type
})
if not existing:
    await db.ai_events.insert_one(event)
```

### 3. Out-of-Order Timestamps

**Problem:** Events may arrive at backend in non-chronological order.

**Solutions:**
- **No Ordering Assumption:** Metrics computed from all events, not sequentially
- **Query-Time Sorting:** Sort by timestamp when fetching for display
- **Time Window Aggregation:** Use time ranges (hourly/shift) not sequential processing
- **Eventual Consistency:** Accept that live feed may show events slightly out of order

**Implementation:**
```python
# All metrics queries aggregate without assuming order
events = await db.ai_events.find({}).sort(\"timestamp\", -1)

# Calculations are time-window based
working_time = count_events_in_window(
    start=shift_start,
    end=shift_end,
    event_type=\"working\"
) * 0.5
```

## Model Management Strategies

### 1. Model Versioning

**Strategy:** Track which AI model version generated each event.

**Implementation:**
```javascript
// Enhanced event schema
{
  \"timestamp\": \"2026-01-15T10:15:00Z\",
  \"worker_id\": \"W1\",
  \"workstation_id\": \"S3\",
  \"event_type\": \"working\",
  \"confidence\": 0.93,
  \"count\": 0,
  \"model_version\": \"yolov8-worker-v2.3.1\",  // NEW
  \"device_id\": \"camera-floor-2-east\",       // NEW
  \"metadata\": {                             // NEW
    \"inference_time_ms\": 45,
    \"gpu_utilization\": 0.72
  }
}
```

**Benefits:**
- Compare performance across model versions
- Rollback capabilities if new model performs poorly
- A/B testing of models on different cameras
- Audit trail for compliance

**Database Query:**
```python
# Analyze metrics by model version
pipeline = [
    {\"$group\": {
        \"_id\": \"$model_version\",
        \"avg_confidence\": {\"$avg\": \"$confidence\"},
        \"event_count\": {\"$sum\": 1}
    }}
]
results = await db.ai_events.aggregate(pipeline).to_list()
```

### 2. Model Drift Detection

**Strategy:** Monitor statistical shifts in model outputs indicating degraded performance.

**Metrics to Track:**
- **Confidence Score Distribution:** Alert if average confidence drops below threshold
- **Event Type Distribution:** Sudden changes in working/idle ratios
- **Temporal Patterns:** Unusual activity patterns (e.g., no \"idle\" events for hours)
- **Per-Camera Performance:** Compare metrics across cameras to isolate issues

**Implementation:**
```python
# Daily drift monitoring job
async def detect_model_drift():
    # 1. Compare recent confidence scores to baseline
    recent = await db.ai_events.find({
        \"timestamp\": {\"$gte\": datetime.now() - timedelta(days=1)}
    }).to_list()
    
    recent_confidence = np.mean([e[\"confidence\"] for e in recent])
    baseline_confidence = 0.92  # Historical average
    
    if recent_confidence < baseline_confidence - 0.05:
        alert(\"Model confidence degraded\")
    
    # 2. Check event distribution
    event_counts = Counter(e[\"event_type\"] for e in recent)
    if event_counts[\"idle\"] / len(recent) > 0.4:  # >40% idle unusual
        alert(\"Unusual idle rate detected\")
    
    # 3. Per-camera analysis
    by_camera = defaultdict(list)
    for event in recent:
        by_camera[event[\"device_id\"]].append(event)
    
    for camera_id, events in by_camera.items():
        avg_conf = np.mean([e[\"confidence\"] for e in events])
        if avg_conf < 0.80:
            alert(f\"Camera {camera_id} showing low confidence\")
```

**Dashboard Integration:**
- Model health metrics panel
- Confidence score trends over time
- Anomaly detection alerts

### 3. Retraining Triggers

**Strategy:** Automated and manual triggers for model retraining.

**Automated Triggers:**
1. **Scheduled Retraining:** Monthly/quarterly with new production data
2. **Drift-Based:** Trigger when drift metrics exceed thresholds
3. **Performance-Based:** Retrain if accuracy drops below SLA
4. **Data Volume:** Every N thousand new labeled events

**Manual Triggers:**
1. **Layout Changes:** Factory floor reconfiguration
2. **New Equipment:** Different machinery or workstations
3. **Seasonal Changes:** Lighting, clothing, shift patterns
4. **Quality Issues:** Inspectors report misclassifications

**Retraining Workflow:**
```
1. Event Collection Phase (Continuous)
   └─▶ Store all events with human validation flags
   
2. Trigger Detection
   └─▶ Drift threshold exceeded OR manual request
   
3. Data Preparation
   └─▶ Export events marked for training
   └─▶ Balance classes (working/idle/absent)
   └─▶ Apply data augmentation
   
4. Model Training
   └─▶ Train new model version on GPU cluster
   └─▶ Validate on held-out test set
   └─▶ Compare to current model performance
   
5. Staged Rollout
   └─▶ Deploy to 1 camera (canary)
   └─▶ Monitor for 24 hours
   └─▶ Compare metrics to other cameras
   └─▶ Gradual rollout to 10% → 50% → 100%
   
6. Feedback Loop
   └─▶ Collect edge cases from new model
   └─▶ Queue for next retraining cycle
```

**Implementation:**
```python
# Retraining decision engine
class RetrainingEngine:
    def should_retrain(self):
        # Check multiple conditions
        drift_detected = self.check_drift()
        low_performance = self.check_performance()
        scheduled = self.check_schedule()
        manual_request = self.check_manual_flags()
        
        return any([drift_detected, low_performance, 
                   scheduled, manual_request])
    
    def trigger_retraining(self):
        # Export training data
        events = await db.ai_events.find({
            \"human_validated\": True,
            \"timestamp\": {\"$gte\": last_training_date}
        })
        
        # Launch training job (e.g., Kubernetes Job, AWS Batch)
        training_job = {
            \"model_type\": \"yolov8\",
            \"dataset_version\": \"v2.4.0\",
            \"hyperparameters\": {...},
            \"gpu_type\": \"A100\",
            \"output_path\": \"s3://models/yolov8-worker-v2.4.0/\"
        }
        
        launch_training_job(training_job)
```

## Scalability

### Scaling from 5 Cameras → 100+ Cameras

**Current Setup (5-10 cameras):**
- Single Node/Express server
- Single MongoDB instance
- Vertical scaling sufficient

**Medium Scale (10-100 cameras):**

1. **Backend Scaling:**
   - Horizontal scaling: Multiple Node/Express instances behind load balancer
   - Event ingestion rate: ~50 events/sec with load balancing
   - Separate services: Ingestion service vs Metrics computation service

2. **Database Optimization:**
   - MongoDB replica set for read scaling
   - Separate read/write connections
   - Time-series collections for events (MongoDB 5.0+)
   - Data retention policies (archive old events to cold storage)

3. **Caching Layer:**
   - Redis for computed metrics (5-minute TTL)
   - Reduce database load for dashboard queries

4. **Architecture:**
```
                    ┌──────────────┐
    100 Cameras ───▶│ Load Balancer│
                    └──────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐       ┌─────────┐       ┌─────────┐
   │ FastAPI │       │ FastAPI │       │ FastAPI │
   │Instance1│       │Instance2│       │Instance3│
   └─────────┘       └─────────┘       └─────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                    ┌─────────────┐
                    │   MongoDB   │
                    │ Replica Set │
                    └─────────────┘
```

**Large Scale (100+ cameras, multi-site):**

1. **Message Queue Architecture:**
   - Kafka or RabbitMQ for event ingestion
   - Decouple event ingestion from processing
   - Handle 1000+ events/sec

2. **Microservices:**
   - Event Ingestion Service
   - Metrics Computation Service
   - Notification Service
   - API Gateway for frontend

3. **Database Sharding:**
   - Shard by site or date range
   - Time-series optimized storage
   - Separate hot (recent) and cold (historical) data

4. **Multi-Site Architecture:**
   - Regional deployments with site-local databases
   - Central aggregation for global metrics
   - Edge computing for local processing

5. **Advanced Architecture:**
```
┌─────────────────── Site A (50 cameras) ───────────────────┐
│  Cameras → Kafka → Event Processor → MongoDB (Local)      │
│                          ↓                                 │
│                   Site Dashboard                           │
└────────────────────────────┬───────────────────────────────┘
                             │ Replication
┌─────────────────── Site B (50 cameras) ───────────────────┐
│  Cameras → Kafka → Event Processor → MongoDB (Local)      │
│                          ↓                                 │
│                   Site Dashboard                           │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Central Data Lake   │
                  │  (S3, Snowflake)     │
                  └──────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Global Analytics    │
                  │     Dashboard        │
                  └──────────────────────┘
```

**Performance Targets:**
- **10 cameras:** <100ms API response, 50 events/sec
- **100 cameras:** <200ms API response, 500 events/sec
- **1000 cameras:** <500ms API response, 5000 events/sec (with queue)

**Cost Optimization:**
- Use spot instances for non-critical processing
- Implement data retention policies (keep 90 days hot, archive older)
- Compress archived events
- Use CDN for static frontend assets

## Running the Application

### Prerequisites
- Docker and Docker Compose
- Node.js 16+ and Yarn
- Python 3.9+

### Local Development

1. **Clone and Navigate:**
```bash
git clone <repository-url>
cd <project-directory>
```

2. **Install Backend Dependencies:**

   ```bash
   cd backend-js
   npm install
   ```
   > The Node.js/Express server is the primary backend; the legacy Python
   > folder has been removed from active use.

3. **Install Frontend Dependencies:**
```bash
cd frontend
yarn install
```

4. **Start MongoDB:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Configure Environment:**
```bash
# Node backend (.env in backend-js)
# copy from backend-js/.env.example
MONGO_URL=mongodb://localhost:27017
DB_NAME=factory_productivity
PORT=3001
CORS_ORIGINS=*

# frontend (.env)
REACT_APP_BACKEND_URL=http://localhost:3000/api    # adjust if backend runs elsewhere
```
6. **Start Backend:**

   ```bash
   cd backend-js
   npm run dev    # uses nodemon to restart on changes
   ```

   The Python implementation has been retired; all remaining routes are
   available via this Express server on port 3001 by default.

7. **Start Frontend:**
```bash
cd frontend
yarn start
```

8. **Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/api
- API Docs: http://localhost:8001/docs

### Docker Deployment

1. **Build Images:**
```bash
docker-compose build
```

2. **Start Services:**
```bash
docker-compose up -d
```

3. **View Logs:**
```bash
docker-compose logs -f
```

4. **Stop Services:**
```bash
docker-compose down
```

### Data Seeding

The database is automatically seeded on first startup. To manually reset data:

**Via API:**
```bash
curl -X POST http://localhost:8001/api/seed
```

**Response:**
```json
{
  \"status\": \"success\",
  \"message\": \"Database seeded\",
  \"workers_count\": 6,
  \"workstations_count\": 6,
  \"events_count\": 240
}
```

### Testing Event Ingestion

**Send a test event:**
```bash
curl -X POST http://localhost:8001/api/events \
  -H \"Content-Type: application/json\" \
  -d '{
    \"timestamp\": \"2026-01-15T10:15:00Z\",
    \"worker_id\": \"W1\",
    \"workstation_id\": \"S3\",
    \"event_type\": \"working\",
    \"confidence\": 0.93,
    \"count\": 0
  }'
```

**Send a production event:**
```bash
curl -X POST http://localhost:8001/api/events \
  -H \"Content-Type: application/json\" \
  -d '{
    \"timestamp\": \"2026-01-15T10:45:00Z\",
    \"worker_id\": \"W1\",
    \"workstation_id\": \"S3\",
    \"event_type\": \"product_count\",
    \"confidence\": 0.95,
    \"count\": 15
  }'
```

## API Endpoints

### Event Ingestion
- `POST /api/events` - Ingest AI event
- `POST /api/seed` - Reset and seed database

### Metrics
- `GET /api/metrics/factory` - Factory-level metrics
- `GET /api/metrics/workers` - All worker metrics
- `GET /api/metrics/workstations` - All workstation metrics

### Events
- `GET /api/events/recent?limit=20` - Recent events with worker/station names

## Technology Stack

**Backend:**
- Node.js with Express (JavaScript backend)
- Mongoose (MongoDB ODM)
- JavaScript/Node 16+

**Frontend:**
- React 19
- React Router
- Recharts (Data visualization)
- Lucide React (Icons)
- Tailwind CSS
- Axios

**Database:**
- MongoDB 5.0+

**DevOps:**
- Docker & Docker Compose
- Supervisor (Process management)

## Project Structure

```
/app/
├── backend-js/            # primary Node/Express API
│   ├── app.js             # entry point
│   ├── controllers/       # route logic
│   ├── models/            # Mongoose schemas
│   ├── routes/            # express routers
│   └── .env.example       # sample env vars
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main app component
│   │   ├── index.css     # Global styles
│   │   ├── components/
│   │   │   └── Layout.js # Sidebar layout
│   │   └── pages/
│   │       ├── Dashboard.js      # Factory overview
│   │       ├── Workers.js        # Worker metrics
│   │       └── Workstations.js   # Station metrics
│   ├── package.json      # Node dependencies
│   └── .env             # Environment variables
├── docker-compose.yml    # Container orchestration
└── README.md            # This file
```

## Design Decisions & Tradeoffs

### 1. MongoDB vs SQL
**Decision:** MongoDB
**Rationale:** 
- Flexible schema for evolving event types
- Better for write-heavy workloads (event ingestion)
- Native JSON support matches API format
**Tradeoff:** Less rigid data validation vs RDBMS

### 2. Real-Time vs Polling
**Decision:** Polling (30-second intervals)
**Rationale:**
- Simpler architecture (no WebSockets)
- Sufficient for factory monitoring use case
- Easier to scale horizontally
**Tradeoff:** Not truly real-time (30s delay acceptable)

### 3. Computed vs Pre-Aggregated Metrics
**Decision:** Computed on-demand
**Rationale:**
- Simpler implementation for MVP
- Always accurate (no cache invalidation)
- Acceptable performance at current scale
**Tradeoff:** Higher latency at scale (needs caching later)

### 4. Time-Window Assumptions
**Decision:** 0.5-hour per event
**Rationale:**
- Simple model for MVP
- Reasonable approximation for shift work
**Tradeoff:** Less granular than true time tracking

## Future Enhancements

1. **WebSocket Support:** Real-time event streaming to dashboard
2. **Advanced Analytics:** Predictive maintenance, anomaly detection
3. **Alerts & Notifications:** Email/SMS for critical events
4. **Historical Reports:** Daily/weekly/monthly PDF reports
5. **User Authentication:** Role-based access control
6. **Multi-Site Support:** Hierarchy of factories → lines → stations
7. **Mobile App:** iOS/Android for managers
8. **Integration APIs:** Export to ERP/MES systems

## License

MIT License

## Contact

For questions or support, contact the development team.
"
