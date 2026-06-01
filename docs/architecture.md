# Architecture — NSCC AI Cluster

---

## Physical Infrastructure

### Proxmox Nodes

| Node | Hostname | VLAN 30 IP | Role |
|------|----------|-----------|------|
| AIProx1 | aiprox1 | 10.30.0.11 | Proxmox host 1 |
| AIProx2 | aiprox2 | 10.30.0.12 | Proxmox host 2 |
| AIProx3 | aiprox3 | 10.30.0.13 | Proxmox host 3 |

**Hardware (identical per node):**
- Intel Core i7-8700 (6C/12T @ 3.2 GHz)
- 31–62 GB DDR4 RAM
- 256 GB NVMe (WD PC SN730) — Proxmox OS + VM OS disk
- 250 GB SSD (Samsung 860 EVO) — VM data disk (HF model cache, Docker images)
- NVIDIA RTX 4070 — 12 GB GDDR6X (PCIe passthrough to VM)

---

## Network Layout

### Management Network

| Network | VLAN | Subnet | Description |
|---------|------|--------|-------------|
| Prod | 10 | 10.10.0.0/24 | Production infrastructure |
| Lab | 20 | 10.20.0.0/23 | Lab environment |
| **AI-Cluster** | **30** | **10.30.0.0/24** | AI cluster (this cluster) |
| HW-Lab | 40 | 10.40.0.0/24 | Hardware lab |
| Mgmt | 99 | 10.99.0.0/24 | Out-of-band management |

The AI cluster lives on VLAN 30. All Proxmox hosts and their compute VMs are on this VLAN.

### VM Internal Network

A dedicated Linux bridge (`vmbr1`) provides VM-to-VM communication for distributed inference — completely isolated from the management network:

| VM | Internal IP | Role |
|----|------------|------|
| VM100 (on AIProx1) | 192.168.100.1 | Ray head + vLLM API |
| VM200 (on AIProx2) | 192.168.100.2 | Ray worker |
| VM300 (on AIProx3) | 192.168.100.3 | Ray worker |

Ray cluster communication (GCS, object store, gRPC), PyTorch Gloo (PP activation transfers), and NCCL all use this internal network. Environment variables `GLOO_SOCKET_IFNAME=eth1` and `NCCL_SOCKET_IFNAME=eth1` pin traffic to `eth1` (the vmbr1 interface inside each VM), bypassing Ubuntu's `/etc/hosts` hostname-to-loopback resolution issue.

---

## Virtualisation

**Hypervisor:** Proxmox VE 9 (3-node cluster with Corosync)

### VM Configuration

| Setting | Value |
|---------|-------|
| Machine type | q35 + UEFI |
| CPU | `host` (full passthrough — AVX-512, etc.) |
| RAM | 24 GB (AIProx1/3), 32 GB (AIProx2) |
| OS disk | 32 GB virtio-scsi on local-lvm (NVMe) |
| Data disk | 200 GB virtio-scsi on vm-ssd (ZFS-backed SSD) |
| GPU | PCIe passthrough: `pcie=1,x-vga=1,rombar=0` |
| Net 0 | virtio on vmbr0 (VLAN 30, management) |
| Net 1 | virtio on vmbr1 (untagged, internal) |

### Key Proxmox Settings

- **IOMMU:** Intel VT-d enabled in BIOS + GRUB `intel_iommu=on iommu=pt`
- **GPU isolation:** VFIO modules loaded; `vfio-pci` driver bound to GPU before Proxmox boots
- **Storage:** ZFS pool `vm-ssd` on Samsung SSD, registered cluster-wide for cross-host migrations

### Guest OS

Ubuntu 24.04 LTS (cloud-init). NVIDIA drivers installed natively inside VM — GPU appears as bare metal. NVIDIA CDI (Container Device Interface) mode used for Docker GPU access.

---

## Software Stack

### Container Image

**`vllm/vllm-openai:latest`** (vLLM 0.20.2, ~33 GB)

- Python 3.12
- PyTorch 2.5+ with CUDA 12.4
- vLLM with FlashInfer and FlashAttention v2
- Ray (installed at container startup via pip)
- OpenAI-compatible API server (uvicorn)

vLLM is installed at `/usr/local/lib/python3.12/dist-packages/vllm/` inside the container.

### Ray Cluster

Ray manages the multi-node distributed execution:

```
Ray Head (192.168.100.1:6379)
  ├── GCS (Global Control Store) — cluster state
  ├── Raylet — local task scheduler
  ├── Object Store — shared memory
  └── vLLM EngineCore — model orchestration
       ├── RayWorkerWrapper (local, rank 0)
       ├── RayWorkerWrapper (192.168.100.2, rank 1)
       └── RayWorkerWrapper (192.168.100.3, rank 2)
```

### vLLM Pipeline Parallelism

```
vllm serve Qwen/Qwen2.5-32B-Instruct-AWQ \
  --pipeline-parallel-size 3 \
  --tensor-parallel-size 1 \
  --distributed-executor-backend ray \
  --quantization awq_marlin \
  --max-model-len 28672
```

The 64 transformer layers are split:

| Stage | Worker | Layers | Content |
|-------|--------|--------|---------|
| 0 | VM100 (rank 0) | 0–20 | Embedding + 21 transformer layers |
| 1 | VM200 (rank 1) | 21–42 | 22 transformer layers |
| 2 | VM300 (rank 2) | 43–63 | 21 transformer layers + LM head |

Activations flow sequentially between stages over the 192.168.100.x network using Gloo point-to-point sends.

### Quantisation

**AWQ Marlin** (`awq_marlin`): 4-bit weight quantisation with Marlin kernel. Reduces Qwen 2.5 32B from ~65 GB FP16 to ~19 GB, fitting comfortably across 3× 12 GB GPUs (~6.3 GB per stage).

> ⚠️ Only use models from official repos (e.g., `Qwen/Qwen2.5-32B-Instruct-AWQ`). Third-party AWQ repacks (e.g., `TheBloke/`) use an older GEMM format incompatible with `awq_marlin` — they load without error but produce incoherent output.

---

## Startup Sequence

```
Workers start → ray start --address=192.168.100.1:6379 --block (retry loop)
                                    ↓
Head starts → patch_vllm_pp.sh (apply 4 patches)
           → ray start --head --port=6379
           → sleep 60 (workers join during this window)
           → vllm serve (download model if not cached, load weights, compile)
           → Application startup complete (~3–5 min total)
```

---

## API

vLLM exposes an OpenAI-compatible REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/models` | GET | List available models |
| `/v1/chat/completions` | POST | Chat interface (ChatML) |
| `/v1/completions` | POST | Raw text completion |

**Base URL:** `http://10.30.0.21:8001/v1`  
**Model ID:** `qwen-32b`  
**Auth:** None (internal network only)

Compatible with: AnythingLLM, Open WebUI, LangChain, LlamaIndex, any OpenAI SDK client.

Tool calling is enabled (`--enable-auto-tool-choice --tool-call-parser hermes`).