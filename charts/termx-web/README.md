# termx-web Helm chart

A minimal **reference** chart for deploying the TermX web frontend
(`ghcr.io/termx-health/termx-web`) on Kubernetes. It renders a Deployment,
a Service, an optional Ingress, and a ConfigMap that injects the image's
runtime configuration.

The image is configured at **runtime** — the values under `config` map 1:1 to
the `${VAR}` placeholders the container substitutes into `env.js` on start.
See [`docs/configuration.md`](../../docs/configuration.md) for every supported
key. No rebuild is needed to change configuration.

## Install

```sh
helm install termx-web ./charts/termx-web \
  --set image.tag=3.4.0 \
  --set config.OAUTH_ISSUER=https://auth.example.org/realms/terminology \
  --set config.OAUTH_CLIENT_ID=term-client
```

or with a values file:

```sh
helm install termx-web ./charts/termx-web -f my-values.yaml
```

## Key values

| Value | Default | Purpose |
|---|---|---|
| `image.repository` | `ghcr.io/termx-health/termx-web` | Image. |
| `image.tag` | `""` → `Chart.appVersion` | Pin a real tag in production. |
| `config` | `{}` | Runtime env for the app — see `docs/configuration.md`. |
| `service.port` / `service.containerPort` | `8000` / `80` | Service port / nginx port. |
| `ingress.enabled` | `false` | Turn on to expose via Ingress. |
| `imagePullSecrets` | `[]` | For a private registry. |

## Scope

This is a starting point, kept deliberately small and dependency-free —
deployment-specific concerns (sealed secrets, registry mirrors, mesh
annotations, sub-path rewrites) belong in a deployment's own values overlay,
not in the shared chart.
