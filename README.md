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
the Configuration tab, and saved locally. Clone it, point it at your own
stack, and it's yours.

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
   — lives in [`docker/`](docker), with its own
   [setup guide](docker/README.md).
2. **Configure the app.** Install it (below), open the **Configuration**
   tab, and enter your server's host and service URLs. Nothing to rebuild —
   changes apply immediately and are saved on-device.

## Running the app

```bash
bun install       # or npm install
npx expo start
```

From the Expo CLI output you can open the app in:

- a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (`npx expo run:ios` / `npx expo run:android`)
- an [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/) or [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), for a quick look — Portainer/Prometheus calls need your dev machine and server to be reachable from the same network, unless you've already exposed the stack publicly

Building a real device binary or an OTA update is done with [EAS](https://docs.expo.dev/eas/index.md):

```bash
bunx eas-cli build --platform ios
```

## Project structure

```
docker/            Server-side stack — see docker/README.md
src/app/           Expo Router routes (screens live in src/screens/)
src/screens/       Prometheus, Docker, Ping, Configuration screens
src/api/           Prometheus, Portainer and ping HTTP clients
src/lib/           Runtime config store + theme preference store (AsyncStorage)
src/components/    Shared UI (themed text/view, glass card, segmented control, tabs)
```

## Scripts

```bash
npx expo start              # start the dev server
npx expo lint                # lint
npx tsc --noEmit             # typecheck
npx expo-doctor              # diagnose dependency/config issues
```

## Support

If this saved you the trouble of building your own homelab dashboard,
[buy me a coffee ☕](https://ko-fi.com/O2Z825GOS2).
