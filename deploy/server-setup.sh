#!/bin/bash
# One-time setup for a fresh Ubuntu 24.04 EC2 instance (see DEPLOY.md).
# Paste it into "Advanced details → User data" when launching — it then runs
# as root on first boot — or run it by hand with sudo. Safe to run twice.
set -euo pipefail

# 2 GB of swap: a t3.micro has 1 GB of RAM, and building the frontend image
# (npm install + vite build) needs more than that.
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Docker Engine and the compose plugin, from Docker's official install script.
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
usermod -aG docker ubuntu

# The code. The repo is public, so no credentials are needed.
if [ ! -d /home/ubuntu/AideDesk ]; then
  git clone https://github.com/Webasif1/AideDesk.git /home/ubuntu/AideDesk
  chown -R ubuntu:ubuntu /home/ubuntu/AideDesk
fi
