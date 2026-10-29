# Assignment 3 Report: Scaling & Securing AI Student OS

**Course:** Cloud Computing & Scalable Systems  
**Project:** AI Student OS  
**Repository:** [https://github.com/Turbo-Light/Student_OS](https://github.com/Turbo-Light/Student_OS)  
**Branch:** `Scaling&Security`  

---

# Question 1: Scale Your Application

## Part A: Multi-Instance Containerization & Load Balancing Setup

To support horizontal scalability, the AI Student OS backend was containerized with Docker and scaled across three identical instances (`backend1`, `backend2`, `backend3`) running Node.js on port `5000`. Traffic distribution is orchestrated through an **Nginx reverse proxy and load balancer** listening on port `8080`.

### Nginx Load Balancing Configuration (`nginx.conf`)
- **Upstream Pool**: Defined upstream cluster `backend_cluster` comprising all three backend replicas.
- **Round-Robin Scheduling**: Evenly spreads incoming HTTP requests across available worker nodes.
- **Header Tracking**: Configured `add_header X-Served-By $upstream_addr always;` to verify and monitor which container instance services each request.

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend_cluster {
        server backend1:5000;
        server backend2:5000;
        server backend3:5000;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://backend_cluster;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            add_header X-Served-By $upstream_addr always;
        }
    }
}
```

### Verification Screenshots (Placeholders)

> **[SCREENSHOT PLACEHOLDER 1.1: Docker Compose Active Containers]**  
> *Insert screenshot showing `docker compose ps` displaying `nginx_lb`, `backend1`, `backend2`, and `backend3` in `Up` status.*

> **[SCREENSHOT PLACEHOLDER 1.2: X-Served-By Response Headers Round-Robin]**  
> *Insert screenshot of consecutive `curl -i http://localhost:8080/api/health` commands showing alternation across `172.x.x.x:5000` upstream IP addresses.*

---

## Part B: Load Testing & Performance Benchmark (Apache Bench)

Performance evaluations were conducted using **Apache Bench (`ab`)** via Docker (`jordi/ab`), simulating a high-concurrency burst of **1,000 requests with 100 concurrent workers** (`-n 1000 -c 100`) targeting `/api/health`.

### Comparative Benchmark Results

| Metric | Single Instance (Baseline) | 3-Instance Cluster (Nginx Load Balanced) | Performance Delta / Improvement |
| :--- | :---: | :---: | :---: |
| **Total Completed Requests** | 1,000 | 1,000 | Identical (100% success) |
| **Concurrency Level** | 100 | 100 | Identical |
| **Failed Requests** | 0 | 0 | 0 errors in both runs |
| **Total Test Duration** | **3.082 seconds** | **0.275 seconds** | **~11.2x faster** (-91.1% execution time) |
| **Requests per Second (Throughput)** | **324.44 req/sec** | **3,638.24 req/sec** | **+1,021.4% increase (~11.2x throughput)** |
| **Time per Request (Mean Latency)** | **308.221 ms** | **27.486 ms** | **-91.1% reduction in latency** |
| **Time per Request (Across Concurrent)** | **3.082 ms** | **0.275 ms** | **-91.1% reduction** |
| **Transfer Rate** | 131.82 KB/sec | 1,478.04 KB/sec | **~11.2x higher network throughput** |
| **50% Response Time (Median)** | 31 ms | 19 ms | -38.7% faster median turnaround |
| **90% Response Time** | 66 ms | 46 ms | -30.3% faster tail latency |
| **99% Response Time** | 115 ms | 71 ms | -38.3% faster p99 latency |
| **Longest Request (Max Latency)** | 3,080 ms | 86 ms | **97.2% reduction in max spike latency** |

### Benchmark Analysis & Insights
1. **Event Loop Saturation**: A single Node.js instance operates on a single-threaded event loop. Under 100 concurrent connections, I/O polling queues saturated, causing the longest request to experience a **3,080 ms stall**.
2. **Horizontal Parallelism**: Load balancing requests across three Node.js processes unlocked multi-core throughput, eliminating queue backlog and dropping mean latency from **308.2 ms to 27.5 ms**.
3. **Throughput Scaling**: Serving capacity surged from **324.44 req/sec to 3,638.24 req/sec**, achieving an **11.2x performance boost**.

---

## Part C: High-Availability Fault Tolerance Simulation

To evaluate system resilience, an active failure injection was executed during an active load test of **5,000 requests at 100 concurrency** (`-n 5000 -c 100`). While the test was running, `backend2` was abruptly terminated (`docker kill backend2`).

### High-Availability Failover Configuration (`nginx.conf`)
Nginx was configured with active upstream retry policies to seamlessly reroute connections if a worker dies mid-flight:
```nginx
proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
proxy_next_upstream_tries 3;
```

### Fault Tolerance & Zero-Downtime Results

| Fault Tolerance Scenario | Failed Requests | Non-2xx Responses | Requests / Sec | Mean Latency | Resilience Outcome |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Before (No Retry Logic)**<br>`proxy_next_upstream off;` | **1** | **1** (502 Bad Gateway) | 5,878.58 req/s | 17.011 ms | **Downtime Observed**: In-flight requests sent to the killed container failed. |
| **After (High-Availability Enabled)**<br>`proxy_next_upstream ... tries 3;` | **0** | **0** (All 200 OK) | **8,157.22 req/s** | **12.259 ms** | **Zero Downtime**: Nginx automatically retried failed socket to healthy nodes. |

> **Key Takeaway**: High-availability retry logic prevented user-facing errors. When an instance collapsed, Nginx caught the broken connection within milliseconds and replayed the request to `backend1` or `backend3`, completing 5,000 requests with **zero failed requests**.

---

## Part D: Scalable Cloud Architecture with Edge Computing Integration

### 1. System Architecture Diagram

```mermaid
flowchart TD
    classDef edgeLayer fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;

    Client["Student Client (Browser / Mobile)"]
    Vercel["Vercel (React Frontend)"]
    Edge["Edge Computing Component: Vercel Edge / Cloudflare Workers"]:::edgeLayer

    subgraph CloudEnv["Docker / Render Environment"]
        Nginx["Nginx Load Balancer (Port 8080)"]
        Backend1["backend1 (Port 5000)"]
        Backend2["backend2 (Port 5000)"]
        Backend3["backend3 (Port 5000)"]
    end

    subgraph DataAI["Data & Intelligence Tier"]
        DB[("MongoDB Atlas (Database)")]
        Gemini["Google Gemini API (AI Engine)"]
    end

    Client -->|Loads Web Application| Vercel
    Client -->|Issues API Requests| Edge
    Edge -.->|Cache Hit: Return Cached Response| Client
    Edge -->|Cache Miss: Forward to Origin| Nginx

    Nginx -->|Round-Robin / Active Failover| Backend1
    Nginx -->|Round-Robin / Active Failover| Backend2
    Nginx -->|Round-Robin / Active Failover| Backend3

    Backend1 --> DB
    Backend1 --> Gemini

    Backend2 --> DB
    Backend2 --> Gemini

    Backend3 --> DB
    Backend3 --> Gemini
```

### 2. Architecture & Edge Component Explanation

#### Component Chosen
- **Edge Computing Component**: **Vercel Edge Network / Cloudflare Workers** with distributed Edge Caching and Edge Middleware.

#### How It Handles Peak-Demand ("Exam Season Eve")
During exam seasons, thousands of students simultaneously query study dashboards, review study plans, and check focus statistics. These endpoints are heavily read-oriented:
- `GET /api/tasks/stats` (weekly dashboard metrics)
- `GET /api/ai/plans` (saved study plan matrices)
- `GET /api/focus/stats` (gamification & focus telemetry)

1. **Geographic Proximity**: Edge worker nodes situated across globally distributed Points of Presence (PoPs) terminate TLS and inspect inbound requests closest to students.
2. **In-Memory Edge Caching**: Read-heavy telemetry and finalized study plans are cached at the edge using Cache-Control headers (`s-maxage` and `stale-while-revalidate`).
3. **Sub-10ms Turnaround**: Cache-hit requests return instantly from memory in under 10ms without traversing origin networks.
4. **Origin Offloading**: Only cache misses or write operations (`POST /api/ai/generate-plan`, `POST /api/tasks`) are forwarded to the Nginx load balancer.

#### Why Edge Computing Was Chosen over Cloud Bursting
1. **Read-Heavy Nature of Education Systems**: AI study plans are generated once but consulted hundreds of times across exam week. Caching at the edge absorbs **>90% of origin traffic**.
2. **Zero Cold-Start Provisioning Delay**: Cloud bursting requires spinning up new virtual machines or heavy containers upon detecting high CPU, taking 2 to 5 minutes during which requests fail or timeout. Edge computing is already running globally and scales instantaneously.
3. **Origin Protection & Cost Efficiency**: By absorbing spikes at the network perimeter, the 3-instance Docker cluster and MongoDB Atlas connection pools are shielded from resource exhaustion, drastically reducing infrastructure costs.

---

# Question 2: Secure Your Application

## Part A: Password Security & Cryptographic Storage with Bcrypt

In accordance with OWASP security recommendations, plain-text passwords are never stored in the database. 

### Implementation Highlights
- **Cryptographic Hashing**: Implemented `bcryptjs` with an adaptive salt work factor of **10 rounds**.
- **Pre-Save Mongoose Hook**: In [`backend/models/User.js`](file:///f:/Student_OS/backend/models/User.js), a pre-save middleware intercepts modifications to the `password` field, automatically salting and hashing credentials before persisting to MongoDB Atlas.
- **Timing-Attack Resistance**: Authentication verifies credentials using `bcrypt.compare()` to guard against side-channel and timing attacks.

### Verification Screenshot (Placeholder)

> **[SCREENSHOT PLACEHOLDER 2.1: Bcrypt Hashed Passwords in MongoDB Atlas]**  
> *Insert screenshot of MongoDB Atlas collection showing `$2a$10$...` cryptographic hashes stored in the `password` field for registered users.*

---

## Part B: TOTP Multi-Factor Authentication & Role-Based Access Control

### 1. TOTP Multi-Factor Authentication (MFA)
- **Library & Algorithm**: Uses `speakeasy` implementing **RFC 6238 Time-based One-Time Password (TOTP)** algorithm.
- **Secret Generation & Setup**: Authenticated users invoke `POST /api/auth/mfa/generate` to obtain a unique `base32` secret and a QR code generated via `qrcode`.
- **MFA Activation**: Users verify a 6-digit code via `POST /api/auth/mfa/verify`. Once confirmed, `isMfaActive: true` is enabled in their profile.
- **Enforced Two-Factor Login**: When `isMfaActive === true`, `POST /api/auth/login` mandates both password and `totpToken`. Incomplete or incorrect tokens reject authentication with `401 Unauthorized`.

### 2. Role-Based Access Control (RBAC)
- **Roles Supported**: `student`, `faculty`, and `admin` (default: `student`).
- **Authorization Middleware**: Implemented `authorizeRoles(...roles)` in [`backend/middleware/authMiddleware.js`](file:///f:/Student_OS/backend/middleware/authMiddleware.js):
  ```javascript
  const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Role not authorized' });
      }
      next();
    };
  };
  ```
- **Task Route Protection**: Applied `authorizeRoles('faculty', 'admin')` to `PUT /api/tasks/:id` and `DELETE /api/tasks/:id` in [`backend/routes/taskRoutes.js`](file:///f:/Student_OS/backend/routes/taskRoutes.js) to restrict administrative operations.

### Verification Screenshot (Placeholder)

> **[SCREENSHOT PLACEHOLDER 2.2: 403 Forbidden Response on Student Role]**  
> *Insert screenshot of Postman or curl executing `DELETE /api/tasks/:id` with a student JWT token, returning `403 Forbidden` with `{ "message": "Role not authorized" }`.*

---

## Part C: Container Vulnerability Assessment & Dockerfile Hardening with Trivy

Security scanning was conducted on the backend Docker image using **Aqua Security Trivy (`aquasec/trivy:latest`)**.

### Security Hardening Measures Applied in `backend/Dockerfile`
1. **Base Image Modernization**: Upgraded to active LTS `node:20-alpine`.
2. **Automated OS Patching**: Added `RUN apk update && apk upgrade --no-cache` to immediately patch known Alpine library CVEs.
3. **Principle of Least Privilege (Non-Root User)**: Created dedicated unprivileged user `appuser` and group `appgroup`:
   ```dockerfile
   RUN addgroup -S appgroup && adduser -S appuser -G appgroup
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --omit=dev
   COPY . .
   RUN chown -R appuser:appgroup /app
   USER appuser
   ```
4. **Attack Surface Minimization**: Switched to `npm install --omit=dev` to prevent development tools and test utilities from shipping into production.

### Trivy Vulnerability Comparison Table

| Target Layer | Metric / Severity | Before Hardening (`node:18-alpine`, `root`) | After Hardening (`node:20-alpine`, `appuser`) | Reduction / Impact |
| :--- | :--- | :---: | :---: | :---: |
| **OS Packages (Alpine)** | **CRITICAL** | 2 | **0** | **-100% (Fully Resolved)** |
| | **HIGH** | 19 | **0** | **-100% (Fully Resolved)** |
| | MEDIUM | 41 | 0 | -100% |
| | LOW / UNKNOWN | 37 | 0 | -100% |
| **Application (Node.js)** | **CRITICAL** | 2 | **2** | - |
| | **HIGH** | 34 | **29** | **-14.7% (Pruned dev dependencies)** |
| | MEDIUM / LOW | 35 | 34 | -2.9% |
| **Runtime Privilege** | **Container User** | `root` (UID 0) | **`appuser` (Non-Root)** | **Mitigates container escape risks** |
| **Total Vulnerabilities** | **CRITICAL** | **4** | **2** | **-50.0%** |
| | **HIGH** | **53** | **29** | **-45.3%** |
| | **Total Overall** | **170** | **65** | **-61.8% Overall Reduction** |

---

## Part D: Threat Modeling & GDPR Regulatory Compliance Analysis

### 1. Threat Agents Analysis
In an academic AI operating system managing schedules, personal notes, study metrics, and academic assessments, the system faces distinct threat actors:

1. **Malicious Insiders / Compromised Students**:
   - **Motivation**: Artificially inflating focus scores, modifying assignment deadlines, obtaining quiz answers in advance, or tampering with faculty-assigned tasks.
   - **Threat Vector**: Direct API tampering with modified parameters or exploiting authorization vulnerabilities.
   - **Mitigation**: Strict RBAC (`authorizeRoles`), server-side focus score computation logic, and scoped JWT authorization prevent unauthorized data modification.

2. **Automated Botnets / Script Kiddies**:
   - **Motivation**: Credential stuffing against student accounts, resource abuse (spamming Gemini AI generation endpoints to consume API quotas), or launching volumetric Denial of Service (DoS).
   - **Threat Vector**: High-rate brute-force dictionary attacks against `/api/auth/login` and `/api/ai/*`.
   - **Mitigation**: TOTP Multi-Factor Authentication (renders leaked passwords useless without the synchronized one-time token), bcrypt hash computation overhead (thwarts offline cracking), and reverse proxy rate limits.

3. **External Cybercriminals / Data Harvesters**:
   - **Motivation**: Exfiltrating personally identifiable information (PII) such as student emails, study habits, academic weaknesses, and behavioral telemetry for phishing or data broker resale.
   - **Threat Vector**: Man-in-the-Middle (MitM) eavesdropping, container breakout exploits, and injection attacks.
   - **Mitigation**: Non-root container execution (`appuser`), full TLS/HTTPS encryption across Vercel and Render, parameterized Mongoose queries, and automated Trivy container image audits.

### 2. GDPR Regulatory Compliance Analysis
The General Data Protection Regulation (GDPR) imposes strict data privacy standards on platforms processing EU personal data. The AI Student OS architecture aligns with core GDPR requirements:

1. **Article 5(1)(f) — Principle of Integrity and Confidentiality ("Security of Processing")**:
   - *Requirement*: Personal data must be processed in a manner that ensures appropriate security, including protection against unauthorized or unlawful processing, accidental loss, or destruction.
   - *Technical Control*: All student passwords are salted and hashed with bcrypt. Data in transit is enforced through HTTPS/TLS across Vercel, Render, and MongoDB Atlas. MFA prevents unauthorized account takeover.

2. **Article 25 — Data Protection by Design and by Default**:
   - *Requirement*: Data protection safeguards must be embedded into the engineering architecture from the onset.
   - *Technical Control*: Minimum privilege defaults are enforced at every tier: Docker containers run as unprivileged `appuser`, API endpoints enforce RBAC (`student` accounts are blocked from administrative routes), and JWT payloads contain only minimal subject identifiers (`_id`), omitting sensitive personal data.

3. **Article 32 — Security of Processing & Regular Vulnerability Assessment**:
   - *Requirement*: Organizations must implement technical and organizational measures to ensure a level of security appropriate to the risk, including the ongoing ability to test, assess, and evaluate effectiveness.
   - *Technical Control*: Automated vulnerability scanning using Trivy actively identifies and eliminates CVEs in OS libraries and application packages. Failover load balancing guarantees service availability and resilience against unexpected outages.

4. **Article 17 — Right to Erasure ("Right to be Forgotten")**:
   - *Requirement*: Data subjects have the right to obtain the erasure of personal data concerning them without undue delay.
   - *Technical Control*: The Mongoose schema models support cascading deletion of user profiles and all associated records (study plans, tasks, focus sessions, and quiz metrics), ensuring complete data purging upon account deletion.
