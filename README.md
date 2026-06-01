# NSCC AI Cluster — Proof of Concept

A 3-node, on-premises distributed AI inference cluster running **Qwen 2.5 32B** via pipeline parallelism across three commodity GPUs. Built at NSCC Truro as a proof of concept for local LLM serving.

**Status:** ✅ Live — serving `qwen-32b` at `http://10.30.0.21:8001/v1`

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        VLAN 30 — 10.30.0.0/24                    │
│                                                                    │
│  AIProx1 (10.30.0.11)     AIProx2 (10.30.0.12)     AIProx3 (10.30.0.13)  │
│  Proxmox VE               Proxmox VE               Proxmox VE    │
│  RTX 4070 (12 GB)         RTX 4070 (12 GB)         RTX 4070 (12 GB)  │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐  │
│  │  VM100      │          │  VM200      │          │  VM300      │  │
│  │ 192.168.100.1│──────── │ 192.168.100.2│──────── │ 192.168.100.3│  │
│  │ Ray Head    │          │ Ray Worker  │          │ Ray Worker  │  │
│  │ vLLM Serve  │          │             │          │             │  │
│  │ :8001       │          │             │          │             │  │
│  └─────────────┘          └─────────────┘          └─────────────┘  │
│         │                        │                        │          │
│  [PP Stage 0]             [PP Stage 1]             [PP Stage 2]   │
│  Layers 0–20              Layers 21–42             Layers 43–63   │
│  + Embedding              (22 layers)              + LM Head      │
└──────────────────────────────────────────────────────────────────┘
```

**Pipeline Parallelism (PP=3):** The 64-layer Qwen 2.5 32B model is split across three GPUs. Each GPU holds ~6.3 GB of weights, well within the 12 GB VRAM limit. Activations pass between pipeline stages over the dedicated internal bridge network (192.168.100.x).

---

## Hardware

| Node | CPU | RAM | GPU | VRAM |
|------|-----|-----|-----|------|
| AIProx1 | Intel i7-8700 (12T) | 31 GB | RTX 4070 | 12 GB |
| AIProx2 | Intel i7-8700 (12T) | 62 GB | RTX 4070 | 12 GB |
| AIProx3 | Intel i7-8700 (12T) | 31 GB | RTX 4070 | 12 GB |

**Total cluster VRAM: 36 GB** across 3 GPUs via PCIe passthrough (VFIO) into Ubuntu 24.04 VMs on Proxmox VE.

---

## Results

### ✅ Qwen 2.5 32B — Primary POC Model

| Metric | Value |
|--------|-------|
| Model | `Qwen/Qwen2.5-32B-Instruct-AWQ` |
| Throughput | **20.82 tok/s** |
| First-token latency | 26.37 s (549-token response) |
| VRAM per stage | ~6.3 GB (comfortable headroom) |
| Context window | 28,672 tokens |
| API | OpenAI-compatible on port 8001 |

### ✅ Mistral 7B — Infrastructure Validation

| Metric | Value |
|--------|-------|
| Throughput | **57.83 tok/s** |
| First-token latency | 9.87 s |

### 🔴 Llama 3.1 70B — Hardware Ceiling Confirmed

Ran 170 MB short of VRAM on the last pipeline stage (RTX 4070 = 12 GB, needed ~11.77 GB for stage 2 + KV cache). All software mitigations exhausted — confirmed hardware constraint. See [hardware upgrade justification](docs/hardware-upgrade.md).

---

## Quick Start

### Prerequisites

- 3× Proxmox VE nodes with GPU passthrough configured
- 3× Ubuntu 24.04 VMs (one per node) with NVIDIA drivers + Docker + NVIDIA Container Toolkit
- Internal bridge network (`vmbr1`) on `192.168.100.x` between VMs
- Hugging Face access (model downloads ~19 GB, cached to `/data/hf-cache`)

### 1. Deploy scripts to all VMs

```bash
# Copy ai-stack/ to /home/ubuntu/ai-stack/ on all 3 VMs
# scripts/ in this repo → /home/ubuntu/ai-stack/ on each VM
```

### 2. Start workers (VM200 and VM300)

```bash
docker run -d --name ray-worker --restart unless-stopped --entrypoint /bin/bash \
  --network host --ipc host --gpus all \
  -v /data/hf-cache:/data/hf-cache \
  -v /home/ubuntu/ai-stack:/scripts \
  -e HF_HOME=/data/hf-cache \
  -e VLLM_HOST_IP=192.168.100.X \
  -e GLOO_SOCKET_IFNAME=eth1 \
  -e NCCL_SOCKET_IFNAME=eth1 \
  -e RAY_NUM_HEARTBEATS_TIMEOUT=300 \
  vllm/vllm-openai:latest /scripts/ray_worker.sh
```

### 3. Start head + vLLM (VM100)

```bash
docker run -d --name ray-head --restart no --entrypoint /bin/bash \
  --network host --ipc host --gpus all \
  -v /data/hf-cache:/data/hf-cache \
  -v /home/ubuntu/ai-stack:/scripts \
  -e HF_HOME=/data/hf-cache \
  -e VLLM_HOST_IP=192.168.100.1 \
  -e GLOO_SOCKET_IFNAME=eth1 \
  -e NCCL_SOCKET_IFNAME=eth1 \
  -e RAY_NUM_HEARTBEATS_TIMEOUT=300 \
  vllm/vllm-openai:latest /scripts/ray_head.sh
```

`ray_head.sh` applies all vLLM patches, starts the Ray head, waits 60 s for workers to join, then launches `vllm serve`.

### 4. Test the API

```bash
curl http://10.30.0.21:8001/v1/models
# → {"data":[{"id":"qwen-32b",...}]}

curl http://10.30.0.21:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen-32b","messages":[{"role":"user","content":"Hello!"}]}'
```

### AnythingLLM / Open WebUI settings

| Setting | Value |
|---------|-------|
| Base URL | `http://10.30.0.21:8001/v1` |
| Model | `qwen-32b` |
| Context window | `28672` |
| Max tokens | `2048` |

---

## Documentation

| Doc | Description |
|-----|-------------|
| [Setup Guide](docs/setup-guide.md) | Full walkthrough from bare metal to serving |
| [Architecture](docs/architecture.md) | Network, VM, Ray, and vLLM configuration detail |
| [vLLM Patches](docs/vllm-patches.md) | 4 patches required to run PP=3 with vLLM 0.20.2 |
| [Hardware Upgrade Case](docs/hardware-upgrade.md) | Why 70B needs RTX 4090s |

## Scripts

| Script | Purpose |
|--------|---------|
| [`scripts/patch_vllm_pp.sh`](scripts/patch_vllm_pp.sh) | Applies all 4 vLLM PP=3 patches at container startup |
| [`scripts/ray_head.sh`](scripts/ray_head.sh) | Starts Ray head + launches vLLM serve |
| [`scripts/ray_worker.sh`](scripts/ray_worker.sh) | Starts Ray worker node |
| [`scripts/qwen_template.jinja`](scripts/qwen_template.jinja) | ChatML template for Qwen |
| [`scripts/mistral_template.jinja`](scripts/mistral_template.jinja) | Template for Mistral fallback |

---

## Key Challenges

1. **vLLM PP=3 bug** — `gpu_model_runner.py` iterates all pipeline layers, but each worker only holds its own stage's layers → `KeyError`. Fixed with a one-line guard. See [vllm-patches.md](docs/vllm-patches.md).
2. **FlashInfer warmup PP bug** — `kernel_warmup.py` calls a dummy forward pass with `force_attention=True` which builds incomplete `attn_metadata` for PP workers → `KeyError` on layer lookup. Fixed by skipping warmup when `pipeline_parallel_size > 1`.
3. **Gloo hostname resolution** — Ubuntu's `/etc/hosts` resolves node hostname to `127.0.1.1`. Fixed by pinning `GLOO_SOCKET_IFNAME=eth1` and `NCCL_SOCKET_IFNAME=eth1`.
4. **GPU passthrough** — Requires both VT-x (CPU virtualisation) AND VT-d (IOMMU) enabled in BIOS — two separate settings, often on different pages.

---

*NSCC Truro — IT Department, May 2026*