# Gardens-net E-commerce

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nichies-projects/v0-gardens-net-e-commerce)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/Ur2jNInLFyL)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## INSTALL
curl -fsSL https://raw.githubusercontent.com/Nichiemaru/gardens-net/main/scripts/docker-install.sh | bash
## Manual install
mkdir gardens-net && cd gardens-net
wget https://raw.githubusercontent.com/gardens-net/ecommerce/main/scripts/casaos-install.sh
chmod +x casaos-install.sh
./casaos-install.sh

# Download docker-compose.yml
curl -O https://raw.githubusercontent.com/Nichiemaru/gardens-net/main/docker-compose.yml

# Download environment template
curl -O https://raw.githubusercontent.com/Nichiemaru/gardens-net/main/.env.example
cp .env.example .env

# Download database initialization
curl -O https://raw.githubusercontent.com/Nichiemaru/gardens-net/main/init-db.sql
nano .env  # Edit with your settings
docker-compose up -d
# Start all services
docker-compose up -d

# Stop all services  
docker-compose down

# Restart services
docker-compose restart

# Check status
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs -f app      # App only
docker-compose logs -f postgres # Database only


## Deployment

Your project is live at:

**[https://vercel.com/nichies-projects/v0-gardens-net-e-commerce](https://vercel.com/nichies-projects/v0-gardens-net-e-commerce)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/Ur2jNInLFyL](https://v0.dev/chat/projects/Ur2jNInLFyL)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
