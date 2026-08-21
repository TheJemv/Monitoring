<p align="center">
  <img src="assets/images/icon.png" width="120" alt="Monitoring app icon" />
</p>

<h1 align="center">Monitoring</h1>

<p align="center">
  A mobile dashboard for your self-hosted homelab.
</p>

<p align="center">
  <a href="https://ko-fi.com/O2Z825GOS2"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="ko-fi" /></a>
</p>

Monitoring is an [Expo](https://expo.dev) app that puts your homelab's vitals
in your pocket: live host and container metrics from
[Prometheus](https://prometheus.io), Docker container control via
[Portainer](https://www.portainer.io), and uptime checks for any site you
run — all in one native iOS/Android app, refreshed in real time.

There's **no server baked into the app** — no build-time `.env`, no secrets
in the source. Every URL, host, and access token is entered on-device, from
the Configuration tab, and saved locally.

## What it does

- **Prometheus** — host CPU, RAM, SSD/HDD usage, CPU temperature and uptime,
  as live numbers and history charts (30m to 1 week), plus an at-a-glance
  status row for Prometheus/node-exporter/cAdvisor/Portainer.
- **Docker** — every container, grouped by docker-compose stack, with live
  CPU/RAM per container and a log viewer (via Portainer, no SSH needed).
- **Ping** — HTTP uptime + latency checks for any site you add, not just
  your homelab.
- **Configuration** — server host, service URLs, Portainer token and ping
  targets, all editable from the app. Also where you pick System/Light/Dark
  appearance.

## Getting started

1. **Stand up the stack on your server.** Everything needed — the
   `docker-compose.yml`, the Prometheus scrape config, and a `.env.example`
   — lives in [Monitoring-Docker](https://github.com/TheJemv/Monitoring-Docker),
   with its own setup guide.
2. **Configure the app.** Open the **Configuration** tab and enter your
   server's host and service URLs. Nothing to rebuild — changes apply
   immediately and are saved on-device.

## Support

If this saved you the trouble of building your own homelab dashboard,
[buy me a coffee ☕](https://ko-fi.com/O2Z825GOS2).
