# Deploying AideDesk on AWS

One small EC2 server runs everything: the app container (API + React build) and
Caddy in front of it for HTTPS. MongoDB Atlas, Pinecone, OpenRouter and Gemini
stay where they are — the server only needs to reach them.

## What it costs

Prices are for `us-east-1`; other regions are close.

| Item                     | Per month                                          |
| ------------------------ | -------------------------------------------------- |
| Server                   | `t3.micro` (1 GB RAM) ~$7.60, `t3.small` (2 GB) ~$15.20 |
| 20 GB disk (gp3)         | ~$1.60                                             |
| Elastic IP (public IPv4) | ~$3.65                                             |
| Data out                 | $0 for the first 100 GB                            |
| **Total**                | **~$13 with t3.micro, ~$20 with t3.small**         |

**Free plan** (Billing and Cost Management → Credits shows "Free plan
status"): AWS never charges your card. When the credits run out or the plan's
end date arrives, AWS stops everything and closes the account, keeping your
data for 90 days in case you upgrade. The only way to get billed is to
upgrade to the Paid plan yourself — so **never click "Upgrade plan"**, even
when a page or email says you need it. You can skip step 8.

If your plan ends in a few weeks, time runs out before money does: pick
`t3.small` — the build is faster and doesn't lean on swap.

**Paid plan:** AWS bills your card once credits are gone. Do step 8.

> AWS gives extra credits for some first steps — setting up a budget and
> launching an EC2 instance are among them. Check the **Explore AWS** panel on
> the console home page.

---

## 1. Before you start

- **Push this code to GitHub.** The server clones `main` from GitHub.
- **Pick your region.** Use the same region as your MongoDB Atlas cluster
  (Atlas → your cluster → shows e.g. `AWS / N. Virginia (us-east-1)`). Use
  that region for every step below.
- **Check your plan and credits:** Billing and Cost Management → **Credits**.

## 2. Spending alert

Tells you how fast you are using the $100.

Billing and Cost Management → **Budgets** → **Create budget**:

1. **Customize (advanced)** → **Cost budget** → Next.
2. Period **Monthly**, **Recurring**, **Fixed**, amount **`15`**.
3. Scope: **All AWS services**. Open **Advanced options** and **untick
   Credits**. Without this, credits cancel out your usage and the
   budget always shows $0.
4. Alerts: **80% of actual** and **100% of forecasted**, with your email.

## 3. Launch the server

EC2 → **Launch instance**:

| Setting            | Value                                                                       |
| ------------------ | --------------------------------------------------------------------------- |
| Name               | `aidedesk`                                                                  |
| Image (AMI)        | **Ubuntu Server 24.04 LTS** (64-bit x86)                                    |
| Instance type      | **t3.micro** or **t3.small** (see costs) — on the Free plan it must show the "Free tier eligible" label |
| Key pair           | Create new → download the `.pem` and keep it safe (backup way to log in)    |
| Network settings   | Create security group, tick **Allow SSH**, **Allow HTTPS**, **Allow HTTP** — all from **Anywhere** |
| Storage            | **20** GiB **gp3**                                                          |
| Advanced → User data | Paste the whole of [deploy/server-setup.sh](deploy/server-setup.sh)       |

The user data installs Docker, adds 2 GB swap (the build needs more than the
1 GB of RAM) and clones the repo. It runs by itself on first boot.

## 4. Fixed IP address

Without this the IP changes every time the server stops and starts.

EC2 → **Elastic IPs** → **Allocate** → select it → **Actions → Associate** →
choose the `aidedesk` instance. Write the IP down (example: `3.91.20.15`).

## 5. Domain name

Pick one:

- **Your own domain:** add a DNS **A record** pointing to the Elastic IP.
  Your domain is then e.g. `aidedesk.example.com`.
- **No domain:** use a free sslip.io name built from the IP with dashes, e.g.
  `3-91-20-15.sslip.io`. It points to that IP automatically. Fine for a demo;
  a real domain is more reliable for certificates.

## 6. Let the server reach MongoDB Atlas

Atlas → **Network Access** → **Add IP Address** → enter the Elastic IP →
Confirm.

## 7. Start the app

EC2 → select `aidedesk` → **Connect** → **EC2 Instance Connect** → Connect.
A terminal opens in your browser. Run:

```bash
# Wait until the first-boot setup has finished (prints "status: done")
cloud-init status --wait

cd ~/AideDesk

# Your environment variables: paste the contents of your local Backend/.env,
# then Ctrl+O, Enter, Ctrl+X to save. See the note below.
nano Backend/.env

# Your domain from step 5 (no https://)
echo "DOMAIN=3-91-20-15.sslip.io" > .env

# Build and start (first build takes ~5–10 minutes on a t3.micro)
docker compose -f docker-compose.prod.yml up -d --build

# Watch it start; Ctrl+C to stop watching (the app keeps running)
docker compose -f docker-compose.prod.yml logs -f
```

You can paste your local `Backend/.env` exactly as it is. The compose file
already sets `NODE_ENV=production`, `PORT`, `FRONTEND_URL`, `API_URL` and
`TRUST_PROXY` for you.

Open `https://<your-domain>` — done.

## 8. Kill switch: stop the server if real money starts being charged

**Paid plan only.** Skip this on the Free plan — AWS can't charge you there.

**a. Role that lets Budgets stop the server.** IAM → **Roles** → **Create
role** → **AWS service** → use case **Budgets** → attach the policy
**`AWSBudgetsActions_RolePolicyForResourceAdministrationWithSSM`** → name it
`BudgetsStopEC2` → Create.

**b. The budget.** Budgets → **Create budget** → **Customize (advanced)** →
**Cost budget**:

1. Period **Monthly**, **Recurring**, **Fixed**, amount **`1`**.
2. Scope **All AWS services**. **Leave Advanced options as they are**: credits
   stay included, so this budget only counts money you actually pay. It sits
   at $0 while credits last.
3. Alert: **100% of actual**, with your email.
4. **Attach actions** → IAM role `BudgetsStopEC2` → action type **Automate
   instances to stop for EC2 or RDS** → your region → instance `aidedesk` →
   **Automatically run this action: Yes**.

Budgets update a few times a day, so the stop can come hours late (cents of
overrun). A stopped server still costs ~$5/month for its disk and IP. When
you're finished, do the full shutdown below.

---

## Updating the site

After pushing new code to GitHub:

```bash
cd ~/AideDesk
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f   # free disk space from old builds
```

## Shutting it all down

Your tickets, users and chats live in MongoDB Atlas and are not affected. Only
uploaded attachments (stored on the server) are lost.

1. EC2 → Instances → `aidedesk` → **Instance state → Terminate**. This also
   deletes its disk.
2. EC2 → **Elastic IPs** → select → **Actions → Release**. An Elastic IP
   that is not attached to anything is still billed — don't skip this.
3. EC2 → **Volumes** and **Snapshots**: both should be empty. Delete
   anything left.
4. Atlas → Network Access → remove the server's IP.
5. Optional: Account → **Close account**. A Free-plan account closes by itself.

## Troubleshooting

| Symptom                                                    | Fix                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Refusing to start in production` in the logs              | It lists the missing variable — fix `Backend/.env` or `.env`, then run `up -d` again         |
| MongoDB connection timeout                                 | The Elastic IP is missing from Atlas Network Access (step 6)                                 |
| Browser says the site isn't secure / Caddy certificate errors | DNS doesn't point at the Elastic IP yet, or ports 80/443 aren't open in the security group |
| Build stops with `exit code 137` / `Killed`                | Out of memory — check swap with `free -h`; re-run `sudo bash deploy/server-setup.sh`         |
| `permission denied` talking to Docker                      | Close the browser terminal and connect again (the docker group applies on new logins)      |
| Login succeeds but you're logged straight out              | You opened `http://` or the IP directly — use `https://<your-domain>`                        |
