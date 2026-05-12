# PrepWise — Environment Promotion Strategy

## Overview
This document describes the promotion strategy for deploying PrepWise across Development, Testing, and Production environments.

---

## Environment Pipeline

```
Dev → Test → Production
 │       │        │
 │       │        └── Azure AKS (prod namespace), 3+ replicas
 │       └── Azure AKS (test namespace), 2 replicas
 └── Local Docker / Azure AKS (dev namespace), 1 replica
```

## Promotion Flow

### 1. Development (Dev)
- **Trigger**: Every push to `dev` branch
- **Environment**: Local Docker or AKS `prepwise-dev` namespace
- **Config**: `terraform/dev.tfvars`
- **Replicas**: 1
- **Purpose**: Developer testing, feature validation
- **Secrets**: Dev Firebase project, dev Vapi account

### 2. Testing (Test/Staging)
- **Trigger**: PR merged to `staging` branch
- **Environment**: AKS `prepwise-test` namespace
- **Config**: `terraform/staging.tfvars`
- **Replicas**: 2
- **Purpose**: Integration testing, QA validation
- **Secrets**: Staging Firebase project
- **Gates**: All CI checks pass, manual QA approval

### 3. Production (Prod)
- **Trigger**: PR merged to `main` branch + manual approval
- **Environment**: AKS `prepwise` namespace
- **Config**: `terraform/prod.tfvars`
- **Replicas**: 2-5 (auto-scaled via HPA)
- **Purpose**: Live user traffic
- **Secrets**: Production Firebase project, production Vapi account
- **Gates**: Staging QA passed, deployment approval from team lead

## Scaling & Configuration

| Parameter | Dev | Test | Prod |
|---|---|---|---|
| Replicas | 1 | 2 | 2-5 (HPA) |
| VM Size | Standard_B2s | Standard_B2s | Standard_D2s_v3 |
| Node Count | 1 | 2 | 2-3 |
| ACR SKU | Basic | Basic | Standard |
| Key Vault | Dev KV | Staging KV | Prod KV |

## Rollback Strategy
1. **Automatic**: If readiness probe fails, K8s rolls back to previous revision
2. **Manual**: `kubectl rollout undo deployment/prepwise --namespace=prepwise`
3. **Image-based**: Deploy previous Docker image tag from ACR
