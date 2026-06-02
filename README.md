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
---

## AnythingLLM + MCP Integration

> This section documents the AI assistant layer on top of the vLLM cluster: AnythingLLM Desktop as the chat frontend/agent framework, with live tool-calling via MCP servers.

### Overview

```
User (AnythingLLM Desktop)
  └── @agent: Give me a cluster status report...
         │ OpenAI-compatible API (stream + tool calls)
         ▼
AnythingLLM Desktop
  ├── Generic OpenAI provider → http://10.30.0.21:8001/v1
  ├── Native tool calling (Hermes format)
  ├── Intelligent Skill Selection (ISS) — top 10 of N tools
  └── MCP Hypervisor
       ├── ProxmoxMCP-Plus-AICluster  (Proxmox REST API)
       ├── Brightspace                (D2L LMS)
       ├── Unifi Network              (UniFi Controller)
       └── Bitwarden                  (password vault)
```

### Environment Variables

Add to `%APPDATA%\anythingllm-desktop\storage\.env` (see [`config/anythingllm.env`](config/anythingllm.env)):

```env
# Enable native tool calling for Generic OpenAI provider
PROVIDER_SUPPORTS_NATIVE_TOOL_CALLING='generic-openai'

# Intelligent Skill Selection — prevents context overflow from tool schema bloat
# 33 enabled tools x ~300 tokens each; ISS cuts this to ~1,800 tokens
AGENT_SKILL_RERANKER_ENABLED='true'
AGENT_SKILL_RERANKER_TOP_N='10'

# Cap tool call loops
AGENT_MAX_TOOL_CALLS='5'
```

> **Why ISS is mandatory:** Without it, all tool schemas are injected into every agent request. At 33+ tools this routinely exceeds the 16,384-token context limit, causing the model to output garbled JSON or time out. ISS uses cosine similarity (all-MiniLM-L6-v2) to select only the top-N tools relevant to the current query.

### Workspace Chat Mode

Keep workspace `chatMode` set to **`chat`**, not `automatic`. In `automatic` mode the agent fires on every message — including questions that need no tools — adding unnecessary latency. Use the `@agent:` prefix explicitly to invoke the agent.

### MCP Tool Suppression

Config: [`config/anythingllm_mcp_servers.json`](config/anythingllm_mcp_servers.json)

Each MCP server exposes far more tools than the agent needs. Suppressing unused tools reduces the pool from ~90 → ~33 before ISS, and eliminates dangerous operations from the agent's reachable surface.

| Server | Enabled | Suppressed |
|--------|---------|------------|
| ProxmoxMCP | 12 (read + start/stop) | 23 (create, delete, clone, snapshots, VNC, exec) |
| Bitwarden | 0 | 59 (all) |
| Unifi | 0 | 5 (all) |
| Brightspace | 2 (auth, my courses) | 13 |

### Demo Output

```
@agent: Give me a full status report of my Proxmox cluster — all nodes, running VMs, containers, and storage.

Tool calls: get_nodes → get_vms → get_containers → get_storage
Response time: 17.2s | Throughput: ~19.5 tok/s

Nodes
  AIProx2  Online  40.20 GB / 62.73 GB  (64.1%)
  AIProx3  Online  27.50 GB / 31.27 GB  (87.9%)  <- high
  AIProx1  Online  28.79 GB / 31.27 GB  (92.1%)  <- high

Running VMs
  aiprox1-compute (ID: 100)  Running on AIProx1
  CPU: 8 cores | Memory: 24.10 GB / 24.00 GB (100.4%)  [vLLM loaded]

Storage Pools
  vm-ssd     203.15 GB / 224.81 GB  (90.4%)  <- near full
  local        8.70 GB /  67.73 GB  (12.8%)
  local-lvm   30.86 GB / 141.23 GB  (21.8%)
```

All data is live from the Proxmox REST API via MCP. Nothing is cached or generated by the model.

### Common Issues

**Garbled model output (`"conversations": [...]` in responses)**  
Cause: Without ISS, 45+ tool schemas overflow the 16k context limit.  
Fix: `AGENT_SKILL_RERANKER_ENABLED=true` + suppress unused MCP tools.

**Tool calls arrive with empty arguments (`{}`)**  
Cause: Qwen uses Hermes-format tool tokens, not standard OpenAI format.  
Fix: `--tool-call-parser hermes --enable-auto-tool-choice` on the vLLM launch command.

**Every message triggers the agent (slow on simple questions)**  
Cause: `chatMode='automatic'` routes all messages through the agent pipeline.  
Fix: Set `chatMode='chat'`; use `@agent:` prefix to invoke the agent explicitly.

**5-minute timeout errors**  
Cause: Stale pending requests from when `chatMode` was `automatic`.  
Fix: Switch to `chat` mode; add `AGENT_MAX_TOOL_CALLS='5'` to cap runaway tool loops.
