# Deploying AideDesk on AWS (ECS Fargate)

```
Browser ──https──▶ Load Balancer (free HTTPS certificate for your domain)
                        │
                        ▼
                 ECS Fargate task ── your Docker image (API + React build), stored in ECR
                        │
                        ▼
         MongoDB Atlas · Pinecone · OpenRouter · Gemini (unchanged)
```

Every push to `main` runs the pipeline
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)): run tests →
build the image → push it to ECR → ECS swaps the running task for the new one.
If the new version fails its health check, ECS keeps the old one running.

## What it costs

Prices are for `us-east-1`; other regions cost a little more.

| Item                                    | Per day                | 49 days               |
| --------------------------------------- | ---------------------- | --------------------- |
| Fargate task, 0.25 vCPU / 0.5 GB        | ~$0.30 (Spot: ~$0.09)  | ~$15 (Spot: ~$5)      |
| Task's public IP                        | ~$0.12                 | ~$6                   |
| Load balancer + its 2 public IPs        | ~$0.78                 | ~$38                  |
| ECR image storage, CloudWatch logs      | a few cents            | under $1              |
| **Total**                               | **~$1.20 (Spot: ~$1)** | **~$60 (Spot: ~$50)** |

**Free plan:** AWS never charges your card. When the credits run out or the
plan's end date arrives, AWS stops everything and closes the account. The
only way to get billed is to upgrade yourself — so **never click "Upgrade
plan"**, even when a page or email says you need it.

**Things that quietly cost money — avoid them:**

- **NAT Gateway** (~$1.10/day). You only need one if the task has no public
  IP — keep **Public IP: On**.
- **More than one task**, or auto scaling with a maximum above 1.
- **Container Insights** (extra CloudWatch charges).
- **A second load balancer.** If you make a test one, delete it.

## Names used in this guide

| Thing           | Name                                              |
| --------------- | ------------------------------------------------- |
| ECR repository  | `aidedesk`                                        |
| Cluster         | `aidedesk-cluster`                                |
| Task definition | `aidedesk`                                        |
| Container       | `aidedesk`                                        |
| Service         | `aidedesk-service`                                |
| Security group  | `aidedesk-sg`                                     |
| Your site       | `aidedesk.yourdomain.com` — use your real domain  |

If your teacher uses other names, use theirs — then tell the pipeline: GitHub
→ repo → Settings → Secrets and variables → Actions → **Variables** → add the
one that differs (`ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`,
`ECS_TASK_DEFINITION` or `CONTAINER_NAME`). For a different repository name,
also change `repository/aidedesk` in
[deploy/github-actions-iam-policy.json](deploy/github-actions-iam-policy.json).

---

## 1. Before you start

- **Region:** use the same region as your MongoDB Atlas cluster (Atlas →
  your cluster shows e.g. `AWS / Mumbai (ap-south-1)`). Pick it at the top
  right of the AWS console and use it for every step.
- **MongoDB Atlas → Network Access → Add IP Address → Allow access from
  anywhere** (`0.0.0.0/0`). A Fargate task gets a new IP on every deploy;
  your database password still protects the database.

## 2. ECR repository (where your images are stored)

ECR → **Create repository**:

- Name **`aidedesk`**, Private.
- Image tag mutability: **Mutable** (the pipeline re-uses the `latest` tag).

Then open the repository → **Lifecycle policy** → **Create rule**: *Image
count more than* **5**, tag status **Any** → **Expire**. Old images get
deleted, so storage stays near $0.

Copy the repository **URI** (looks like
`123456789012.dkr.ecr.ap-south-1.amazonaws.com/aidedesk`).

## 3. Let GitHub push images and deploy

**a. Permissions.** IAM → **Users** → the user you created → **Add
permissions → Create inline policy** → **JSON** → paste all of
[deploy/github-actions-iam-policy.json](deploy/github-actions-iam-policy.json)
→ name it `github-actions-deploy` → Create. It covers pushing to ECR, so the
ECR policy you attached earlier is no longer needed.

**b. Access key.** Same user → **Security credentials** → **Create access
key** → use case **Third-party service** → Create. Copy both values now —
the secret is shown only once.

**c. GitHub.** Repo → **Settings** → **Secrets and variables** → **Actions**:

- **Secrets** tab → add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
- **Variables** tab → add `AWS_REGION` = your region code, e.g. `ap-south-1`.

> Never put the keys in code, in `.env`, or in a chat. The repo is public and
> bots scan GitHub for AWS keys within minutes.

**d. First image.** Repo → **Actions** → **CI/CD** → **Run workflow**. When
**test** and **build** are green, the image is in ECR. The **deploy** job will
note that the service doesn't exist yet — that's expected until step 8.

## 4. HTTPS certificate (free)

Certificate Manager (ACM) → **Request** → **Request a public certificate**:

- Domain name: **`aidedesk.yourdomain.com`**
- Validation: **DNS validation** → Request.

Open the certificate, copy the **CNAME name** and **CNAME value**, and add
that CNAME record where you manage your domain's DNS. Wait until the status is
**Issued** (5–30 minutes).

## 5. Security group

EC2 → **Security Groups** → **Create security group**:

- Name **`aidedesk-sg`**, VPC: the default one.
- Inbound rules: **HTTP** (80) from **Anywhere-IPv4**, **HTTPS** (443) from
  **Anywhere-IPv4** → Create.

Then **Edit inbound rules** → **Add rule**: **Custom TCP**, port **3000**,
source **`aidedesk-sg`** (pick it from the list) → Save. The load balancer
can now reach the app, and port 3000 stays closed to the internet.

## 6. Task definition

ECS → **Task definitions** → **Create new task definition**:

| Setting              | Value                                                   |
| -------------------- | ------------------------------------------------------- |
| Family               | `aidedesk`                                              |
| Launch type          | **AWS Fargate**                                         |
| OS / Architecture    | **Linux / X86_64**                                      |
| CPU / Memory         | **.25 vCPU / .5 GB** (use 1 GB if logs show it running out of memory) |
| Task execution role  | **Create new role** (or `ecsTaskExecutionRole` if it exists) |
| Container name       | `aidedesk`                                              |
| Image URI            | your repository URI from step 2 + `:latest`             |
| Port mapping         | **3000**, TCP, HTTP                                     |
| Log collection       | On (default)                                            |

**Environment variables** — click *Add environment variable* for each:

| Key            | Value                              |
| -------------- | ---------------------------------- |
| `NODE_ENV`     | `production`                       |
| `PORT`         | `3000`                             |
| `FRONTEND_URL` | `https://aidedesk.yourdomain.com`  |
| `API_URL`      | `https://aidedesk.yourdomain.com`  |
| `TRUST_PROXY`  | `1`                                |

Then add every other line from your local `Backend/.env`: `MONGO_URI`,
`JWT_SECRET`, `GOOGLE_USER_EMAIL`, `GOOGLE_USER_PASSWORD`, `PINECONE_API_KEY`,
`OPENROUTER_API_KEY`, `GEMINI_API_KEY`. Paste the values **without quotes**.

> Anyone who can log in to your AWS account can read these values. That's fine
> for learning; for a real product you'd store them in AWS Secrets Manager.

## 7. Cluster

ECS → **Clusters** → **Create cluster**:

- Name **`aidedesk-cluster`**
- Infrastructure: **AWS Fargate (serverless)** only
- Monitoring: **Container Insights off**

## 8. Service and load balancer

Open `aidedesk-cluster` → **Services** → **Create**:

| Section                       | Setting                                                                    |
| ----------------------------- | -------------------------------------------------------------------------- |
| Compute                       | Capacity provider strategy → **Use custom** → **FARGATE_SPOT**, weight 1 (or **FARGATE** if your teacher wants it) |
| Task definition               | Family `aidedesk`, latest revision                                         |
| Service name                  | `aidedesk-service`                                                         |
| Desired tasks                 | **1**                                                                      |
| Deployment failure detection  | Circuit breaker **on**, **Rollback on failures** on (the default)          |
| Networking                    | Default VPC, all subnets, security group **`aidedesk-sg` only** (remove `default`), **Public IP: On** |
| Load balancing                | **Application Load Balancer** → Create new: `aidedesk-alb`              |
| — Container                   | `aidedesk 3000:3000`                                                       |
| — Listener                    | Create new: port **443**, protocol **HTTPS**, certificate **aidedesk.yourdomain.com** (from step 4) |
| — Target group                | Create new: `aidedesk-tg`, protocol **HTTP**, health check path **`/api/health`** |
| Service auto scaling          | **Off** (or Min **1** / Max **1** if your teacher wants it configured)    |

→ **Create**. It takes about 5 minutes.

## 9. Finish up

**a. Send http to https.** EC2 → **Load Balancers** → `aidedesk-alb` →
**Listeners** → **Add listener**: HTTP, port 80 → **Redirect to URL** →
HTTPS, port 443, status 301 → Add. Also copy the load balancer's **DNS name**
(like `aidedesk-alb-123456.ap-south-1.elb.amazonaws.com`).

**b. Point your domain at it.** At your DNS provider, add a **CNAME** record:
name `aidedesk`, value = that DNS name.

**c. Keep logs cheap.** CloudWatch → **Log groups** → `/ecs/aidedesk` →
Actions → **Edit retention** → **1 week**.

Open `https://aidedesk.yourdomain.com` — done. From now on every push to
`main` deploys by itself.

> Uploaded attachments are stored inside the container, so each deploy starts
> without them. Fine for learning; a real product would keep them in S3.

---

## Updating the site

Push to `main` and watch the repo's **Actions** tab. If the tests fail, nothing
is deployed and the site keeps running the previous version.

**Roll back:** Actions → open the last good run → **Re-run all jobs**.

**Changed an environment variable?** ECS → Task definitions → `aidedesk` →
**Create new revision** → edit → Create. Then the service → **Update** → latest
revision → **Force new deployment** → Update.

## Shutting it all down

Your tickets, users and chats live in MongoDB Atlas and are not affected.

1. ECS → `aidedesk-cluster` → `aidedesk-service` → **Delete service**
   (force delete).
2. EC2 → **Load Balancers** → `aidedesk-alb` → **Delete**. This is the
   biggest cost — don't skip it.
3. EC2 → **Target Groups** → `aidedesk-tg` → **Delete**.
4. ECS → **Clusters** → `aidedesk-cluster` → **Delete cluster**.
5. ECR → `aidedesk` → **Delete**.
6. CloudWatch → Log groups → `/ecs/aidedesk` → **Delete**.
7. IAM → your user → Security credentials → **Deactivate**, then **Delete**
   the access key. GitHub → delete the two AWS secrets (pushes then skip
   deploying instead of failing).
8. Remove the DNS records; delete the certificate and `aidedesk-sg` (both
   free, just tidy).

A Free-plan account closes by itself on its end date.

## Troubleshooting

Pipeline errors are in the failed job's log (Actions tab). App errors are in
ECS → `aidedesk-service` → **Logs**.

| Symptom                                                        | Fix                                                                                       |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Build or deploy job: `AccessDenied` / `not authorized`         | The policy from step 3a is missing, or your resource names differ from the defaults (see "Names") |
| Task stops with `CannotPullContainerError`                     | No image in ECR yet (step 3d), or **Public IP** was Off                                    |
| Logs: `Refusing to start in production`                        | It names the missing variable — add it in a new task definition revision ("Changed an environment variable?") |
| Logs: MongoDB connection timeout                               | Atlas Network Access must allow `0.0.0.0/0` (step 1)                                      |
| Site shows `503`, target group says **unhealthy**              | The port 3000 rule in `aidedesk-sg` is missing (step 5), or the app crashed — check Logs |
| Blank white page; console shows `ERR_CONNECTION_REFUSED` for `index-….js` | `FRONTEND_URL` isn't the address in your browser bar. No domain yet? Set `FRONTEND_URL` and `API_URL` to `http://<load balancer DNS name>` (works, but logins aren't encrypted) |
| Logged in, then logged straight out / CORS errors              | You opened the load balancer's DNS name — use `https://aidedesk.yourdomain.com`, the same as `FRONTEND_URL` |
| Certificate stuck on **Pending validation**                    | The ACM CNAME isn't at your DNS provider yet — some providers add the domain to the name automatically, so remove it if it's there twice |
