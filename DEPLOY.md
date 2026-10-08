# Deploying AideDesk on AWS (ECS Fargate + CloudFront)

```
Browser ──https──▶ CloudFront (free HTTPS, https://<id>.cloudfront.net)
                        │ http
                        ▼
                 Load Balancer (HTTP :80)
                        │
                        ▼
                 ECS Fargate Spot task ── your Docker image (API + React build), stored in ECR
                        │
                        ▼
         MongoDB Atlas · Pinecone · OpenRouter · Gemini (unchanged)
```

Live site: **https://d1zupipaycfor3.cloudfront.net** (region `ap-south-1`, Mumbai).

CloudFront is what gives the site HTTPS without buying a domain. Chrome and
Brave refuse the load balancer's plain `http://` address, and login cookies
are only encrypted over HTTPS, so always use the CloudFront address.

Every push to `main` runs the pipeline
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)): run tests →
build the image → push it to ECR → ECS swaps the running task for the new one.
If the new version fails its health check, ECS keeps the old one running.
The build and deploy steps stay switched off until GitHub has an AWS key
(see [CI/CD](#cicd-automatic-deploys)).

## What it costs

Estimates for `ap-south-1`.

| Item                                             | Per day     |
| ------------------------------------------------ | ----------- |
| Load balancer (hourly charge)                    | ~$0.58      |
| 3 public IPs (2 for the load balancer, 1 for the task) | ~$0.36 |
| Fargate Spot task, 0.25 vCPU / 1 GB              | ~$0.11      |
| CloudFront (always free up to 1 TB and 10M requests a month) | $0 |
| ECR image storage, CloudWatch logs               | under 1 cent |
| **Total**                                        | **~$1.05**  |

**Free plan:** AWS never charges your card. When the credits run out or the
plan's end date arrives, AWS stops everything and closes the account. The
only way to get billed is to upgrade yourself — so **never click "Upgrade
plan"**, even when a page or email says you need it.

**Things that quietly cost money — avoid them:**

- **NAT Gateway** (~$1.10/day). You only need one if the task has no public
  IP — keep **Public IP: On**.
- **AWS WAF** on CloudFront or the load balancer (a monthly fee plus per-request
  charges). Both wizards pre-select it; switch it off.
- **More than one task**, or auto scaling with a maximum above 1.
- **Container Insights** (extra CloudWatch charges).
- **A second load balancer.** If you make a test one, delete it.

## Names used in this guide

These match the defaults in the pipeline, so it finds everything without
extra settings.

| Thing           | Name               |
| --------------- | ------------------ |
| ECR repository  | `aidedesk`         |
| Security group  | `aidedesk-sg`      |
| Target group    | `aidedesk-tg`      |
| Load balancer   | `aidedesk-alb`     |
| Cluster         | `aidedesk-cluster` |
| Task definition | `aidedesk`         |
| Container       | `aidedesk`         |
| Service         | `aidedesk-service` |
| Log group       | `/ecs/aidedesk`    |

If you use other names, tell the pipeline: GitHub → repo → Settings → Secrets
and variables → Actions → **Variables** → add the one that differs
(`ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`, `ECS_TASK_DEFINITION` or
`CONTAINER_NAME`). For a different repository name, also change
`repository/aidedesk` in
[deploy/github-actions-iam-policy.json](deploy/github-actions-iam-policy.json).

---

## 1. Before you start

- **Region:** `ap-south-1` (Mumbai), the same region as the MongoDB Atlas
  cluster. Pick it at the top right of the AWS console for every step except
  CloudFront, which is global.
- **MongoDB Atlas → Network Access → Add IP Address → Allow access from
  anywhere** (`0.0.0.0/0`). A Fargate task gets a new IP on every deploy;
  your database password still protects the database.
- Keep your filled-in `Backend/.env` at hand. Its secrets go into the task
  definition in step 8.

## 2. ECR repository (where your images are stored)

ECR → **Create repository**:

- Name **`aidedesk`**, Private.
- Image tag mutability: **Mutable** (the pipeline re-uses the `latest` tag).
- Encryption: **AES-256** (free).

Then open the repository → **Lifecycle policy** → **Create rule**: tag status
**Any**, match criteria **Image count**, **5** → **Expire** → Save. Old images
get deleted, so storage stays near $0.

> Don't use "Days since image created" — that would also delete the image the
> running task uses.

## 3. First image

Once CI/CD is set up, GitHub builds the image for you (Actions → **CI/CD** →
**Run workflow**). To push one from your own machine instead, with Docker
Desktop running and the AWS CLI logged in:

```bash
REG=<your-account-id>.dkr.ecr.ap-south-1.amazonaws.com
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin $REG
docker build --platform linux/amd64 --provenance=false -t $REG/aidedesk:latest .
docker push $REG/aidedesk:latest
```

`--platform linux/amd64` matters on Apple Silicon: the Fargate task runs x86.

## 4. Security group

EC2 → **Security Groups** → **Create security group**:

- Name **`aidedesk-sg`**, VPC: the **default** one.
- Inbound rule: **Custom TCP**, port **80**, source **Anywhere-IPv4** → Create.

Then **Edit inbound rules** → **Add rule**: **Custom TCP**, port **3000**,
source **`aidedesk-sg`** (pick it from the list) → Save. The load balancer
can now reach the app, and port 3000 stays closed to the internet.

## 5. Target group

EC2 → **Target groups** → **Create target group**:

- Target type **IP addresses**, name **`aidedesk-tg`**.
- Protocol **HTTP**, port **3000**, default VPC.
- Health check path **`/api/health`**.
- Register targets: **none** (ECS registers the task itself) → Create.

## 6. Load balancer

EC2 → **Load balancers** → **Create** → **Application Load Balancer**:

| Setting            | Value                                                    |
| ------------------ | -------------------------------------------------------- |
| Name               | `aidedesk-alb`                                           |
| Scheme             | **Internet-facing**, IPv4                                |
| VPC                | default                                                  |
| Availability Zones | **ap-south-1a** and **ap-south-1b** only (each zone adds a paid public IP; 2 is the minimum) |
| Security groups    | **`aidedesk-sg` only** (remove `default`)                |
| Listener           | HTTP **80** → forward to **`aidedesk-tg`**               |
| Service integrations | leave CloudFront/WAF and Global Accelerator **unchecked** |

Copy the load balancer's **DNS name** (like
`aidedesk-alb-123456.ap-south-1.elb.amazonaws.com`) for the next step.

## 7. CloudFront (HTTPS)

CloudFront → **Create distribution**:

| Step     | Setting                  | Value                                          |
| -------- | ------------------------ | ---------------------------------------------- |
| Get started | Name                  | `aidedesk`, single website, no domain          |
| Origin   | Origin type              | **Elastic Load Balancer** → the DNS name from step 6 |
| Origin   | Origin settings          | **Customize** → Protocol **HTTP only**, port 80, response timeout **60** |
| Origin   | Cache settings           | **Customize** → Viewer protocol **Redirect HTTP to HTTPS** |
|          | Allowed HTTP methods     | **GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE** |
|          | Cache policy             | **CachingDisabled**                            |
|          | Origin request policy    | **AllViewerExceptHostHeader**                  |
| Security | Web Application Firewall | **Do not enable security protections**        |

→ **Create distribution**. Copy the **Distribution domain name**
(`<id>.cloudfront.net`). It takes 5–10 minutes to deploy.

Why these settings: the load balancer has no certificate, so CloudFront must
talk to it over plain HTTP; and logins, the API and live chat need every
request, cookie and query string passed through uncached.

## 8. Task definition

ECS → **Task definitions** → **Create new task definition**:

| Setting              | Value                                                   |
| -------------------- | ------------------------------------------------------- |
| Family               | `aidedesk`                                              |
| Launch type          | **AWS Fargate**                                         |
| OS / Architecture    | **Linux / X86_64**                                      |
| CPU / Memory         | **.25 vCPU / 1 GB** (the default 1 vCPU / 3 GB costs ~10× more) |
| Task execution role  | **Create default role** (or `ecsTaskExecutionRole` if it exists) |
| Container name       | `aidedesk`                                              |
| Image URI            | your repository URI from step 2 + `:latest`             |
| Port mapping         | **3000**, TCP, HTTP                                     |
| Log collection       | On (default), group `/ecs/aidedesk`                     |

**Environment variables** — click **Bulk edit** and enter one `KEY=value` per
line:

```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://<id>.cloudfront.net
API_URL=https://<id>.cloudfront.net
TRUST_PROXY=2
```

`TRUST_PROXY=2` because two proxies (CloudFront and the load balancer) sit in
front of the app. Then paste these lines from your `Backend/.env`:
`MONGO_URI`, `JWT_SECRET`, `GOOGLE_USER_EMAIL`, `GOOGLE_USER_PASSWORD`,
`PINECONE_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`,
`TEST_RECIEVER_EMAIL`. Write them as `KEY=value`, with no spaces around `=`
and no quotes. → **Confirm** → **Create**.

> Anyone who can log in to your AWS account can read these values. That's fine
> for learning; for a real product you'd store them in AWS Secrets Manager.

## 9. Cluster

ECS → **Clusters** → **Create cluster**:

- Name **`aidedesk-cluster`**
- Infrastructure: **Fargate only**
- Monitoring: Container Insights **Turned off**

## 10. Service

Open `aidedesk-cluster` → **Services** → **Create**:

| Section                       | Setting                                                                    |
| ----------------------------- | -------------------------------------------------------------------------- |
| Task definition               | Family `aidedesk`, latest revision                                         |
| Service name                  | `aidedesk-service`                                                         |
| Compute                       | Capacity provider strategy → **Use custom** → **FARGATE_SPOT**, weight 1   |
| Desired tasks                 | **1**                                                                      |
| Health check grace period     | **60** seconds                                                             |
| Deployment failure detection  | Circuit breaker **on**, **Rollback on failures** on (the default)          |
| Networking                    | Default VPC, subnets **ap-south-1a** and **ap-south-1b** only (the load balancer's zones), security group **`aidedesk-sg` only**, **Public IP: On** |
| Load balancing                | **Application Load Balancer** → **Use an existing load balancer** → `aidedesk-alb` |
| — Listener                    | **Use an existing listener** → HTTP:80                                     |
| — Target group                | **Use an existing target group** → `aidedesk-tg`                           |
| Service auto scaling          | **Off**                                                                    |

→ **Create**. The task is healthy after about a minute.

## 11. Finish up

- **Keep logs cheap.** CloudWatch → **Log groups** → `/ecs/aidedesk` →
  Actions → **Edit retention** → **1 week**.
- **Check it.** Open `https://<id>.cloudfront.net` and
  `https://<id>.cloudfront.net/api/health`.

> Uploaded attachments are stored inside the container, so each deploy starts
> without them. Fine for learning; a real product would keep them in S3.

---

## CI/CD: automatic deploys

The pipeline runs four jobs on every push to `main`:

| Job              | What it does                                                         |
| ---------------- | -------------------------------------------------------------------- |
| `test`           | `npm ci` and `npm test` in `Backend` on Node 22                       |
| `aws-configured` | Checks the AWS key secret exists; if not, stops quietly              |
| `build`          | Builds the image and pushes `:<commit sha>` and `:latest` to ECR      |
| `deploy`         | Copies the live task definition, swaps in the new image, waits until healthy |

Pull requests only run the tests. The deploy copies the task definition's
environment variables as they are, so your secrets never pass through GitHub.

To switch build and deploy on:

1. **IAM user.** IAM → **Users** → **Create user** → name `github-actions`,
   no console access → Create. A separate user means the key in GitHub can
   only deploy.
2. **Permissions.** That user → **Add permissions** → **Create inline policy**
   → **JSON** → paste all of
   [deploy/github-actions-iam-policy.json](deploy/github-actions-iam-policy.json)
   → name it `github-actions-deploy` → Create.
3. **Access key.** Same user → **Security credentials** → **Create access
   key** → use case **Third-party service** → Create. Copy both values now —
   the secret is shown only once.
4. **GitHub secrets.** Repo → **Settings** → **Secrets and variables** →
   **Actions** → **Secrets** tab → add `AWS_ACCESS_KEY_ID` and
   `AWS_SECRET_ACCESS_KEY`.
5. **Region variable.** **Variables** tab → add `AWS_REGION` = `ap-south-1`
   (without it the pipeline looks in `us-east-1` and finds nothing). Or:
   `gh variable set AWS_REGION --body ap-south-1`
6. **First run.** Repo → **Actions** → **CI/CD** → **Run workflow** → `main`.
   All four jobs should go green in 5–8 minutes.

> Never put the keys in code, in `.env`, or in a chat. The repo is public and
> bots scan GitHub for AWS keys within minutes.

## Updating the site

Push to `main` and watch the repo's **Actions** tab. If the tests fail, nothing
is deployed and the site keeps running the previous version.

**Roll back:** Actions → open the last good run → **Re-run all jobs**. Or ECS →
`aidedesk-service` → **Update** → pick the previous task definition revision.

**Changed an environment variable?** ECS → Task definitions → `aidedesk` →
latest revision → **Create new revision** → edit the value → Create. The new
revision keeps all the other values, secrets included. Then the service →
**Update** → latest revision → Update.

## Shutting it all down

Your tickets, users and chats live in MongoDB Atlas and are not affected.

1. CloudFront → `aidedesk` → **Disable**, wait until it shows **Deployed**,
   then **Delete**.
2. ECS → `aidedesk-cluster` → `aidedesk-service` → **Delete service**
   (force delete).
3. EC2 → **Load Balancers** → `aidedesk-alb` → **Delete**. This is the
   biggest cost — don't skip it.
4. EC2 → **Target Groups** → `aidedesk-tg` → **Delete**.
5. ECS → **Clusters** → `aidedesk-cluster` → **Delete cluster**; Task
   definitions → `aidedesk` → deregister and delete every revision.
6. ECR → `aidedesk` → **Delete**.
7. CloudWatch → Log groups → `/ecs/aidedesk` → **Delete**.
8. IAM → `github-actions` → Security credentials → **Deactivate**, then
   **Delete** the access key. GitHub → delete the two AWS secrets (pushes then
   skip deploying instead of failing).
9. EC2 → Security Groups → `aidedesk-sg` → **Delete** (free, just tidy).

A Free-plan account closes by itself on its end date.

## Troubleshooting

Pipeline errors are in the failed job's log (Actions tab). App errors are in
ECS → `aidedesk-service` → **Logs**.

| Symptom                                                        | Fix                                                                                       |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Chrome or Brave won't open the site                            | Use the `https://<id>.cloudfront.net` address, not the load balancer's `http://` one      |
| Logged in, then logged straight out / CORS errors              | The address in the browser bar must match `FRONTEND_URL` — use the CloudFront address     |
| CloudFront shows `502` or `504`                                | The task is starting or unhealthy (check Logs), or the CloudFront origin protocol isn't **HTTP only** |
| Logs: `Refusing to start in production`                        | It names the missing variable — add it in a new task definition revision ("Changed an environment variable?") |
| Logs: MongoDB connection timeout                               | Atlas Network Access must allow `0.0.0.0/0` (step 1)                                      |
| Target group says **unhealthy**                                | The port 3000 rule in `aidedesk-sg` is missing (step 4), or the app crashed — check Logs |
| Task stops with `CannotPullContainerError`                     | No image in ECR yet (step 3), or **Public IP** was Off                                     |
| Build or deploy job: `AccessDenied` / `not authorized`         | The inline policy from CI/CD step 2 is missing on the user whose key is in GitHub         |
| Deploy job: service "isn't in cluster yet"                     | The `AWS_REGION` variable is missing, so it searched `us-east-1` (CI/CD step 5)           |
