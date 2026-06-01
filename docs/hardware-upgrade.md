# Hardware Upgrade Case — 70B Models

This document records the hardware ceiling encountered during the POC and quantifies what is needed to run 70B-class models.

---

## What Was Tested

**Model:** `hugging-quants/Meta-Llama-3.1-70B-Instruct-AWQ-INT4`  
**Configuration:** PP=3, `awq_marlin`, 3× RTX 4070 (12 GB each)  
**Result:** OOM crash on the last pipeline stage

---

## The Numbers

Llama 3.1 70B AWQ-INT4 is approximately 35 GB total. Split across 3 pipeline stages:

| Stage | Layers | Weight size | Content |
|-------|--------|-------------|---------|
| 0 | 0–26 | ~11.0 GB | Embedding + 27 layers |
| 1 | 27–53 | ~11.0 GB | 27 layers |
| 2 | 54–79 | ~11.43 GB | 26 layers + LM head (vocab = 128k tokens) |

The **LM head** (output embedding matrix) is disproportionately large: `128,256 tokens × 8,192 hidden dim × 2 bytes ≈ 2.1 GB` for the last stage alone.

### Breakdown on Stage 2 (VM300, RTX 4070)

| Component | Memory |
|-----------|--------|
| Stage weights (26 layers) | ~9.3 GB |
| LM head / vocab embedding | ~2.1 GB |
| **Total weights** | **~11.43 GB** |
| RTX 4070 physical VRAM | **11.60 GB** |
| **Available for KV cache** | **170 MB** |

With only 170 MB for KV cache, even a single inference request of a few hundred tokens would OOM. The model technically loads but cannot serve any requests.

**All mitigations were tested and failed:**
- `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` — no effect on weight memory
- `--max-model-len 1024` — frees KV cache budget but the weights still fill VRAM
- `--gpu-memory-utilization 0.95` — already at maximum
- Model quantisation deeper than INT4 (`--quantization gptq`) — changes format, still ~35 GB

**Conclusion:** This is a physical VRAM ceiling. No software mitigation can reduce model weight memory below the physical size of the weights.

---

## What Is Actually Required for 70B

### Option A — RTX 4090 (24 GB each)

| Spec | Value |
|------|-------|
| VRAM per card | 24 GB GDDR6X |
| Total across 3 | **72 GB** |
| Llama 3.1 70B FP16 | ~140 GB (tensor-parallel, not PP) |
| Llama 3.1 70B AWQ-INT4 | ~35 GB → ~11.7 GB per stage |
| KV cache headroom (per stage) | ~12 GB |

3× RTX 4090 runs **Llama 3.1 70B AWQ-INT4 in PP=3 with ~12 GB KV cache per stage** — comparable headroom to what Qwen 32B has today.

For FP16 (no quantisation), tensor parallelism across 3× 4090 gives 72 GB, which would be marginal for Llama 3.1 70B at 140 GB. However, it would comfortably run **Qwen 2.5 72B** (~36 GB AWQ) or a **Mixtral 8×22B** (~43 GB AWQ).

### Option B — A100 80 GB (single card)

A single A100 (80 GB) or H100 (80 GB) runs Llama 3.1 70B in FP16 comfortably on one card, no distribution needed. But this is a different cost class (~$10k+ used).

---

## The Upgrade Pitch

The same cluster architecture, the same Ray + vLLM stack, the same PP=3 pipeline — **swap the GPUs and unlock models 2× larger**.

| | Current (RTX 4070) | Upgrade (RTX 4090) |
|--|---|---|
| VRAM per card | 12 GB | 24 GB |
| Total cluster VRAM | 36 GB | 72 GB |
| Max model (AWQ) | ~19 GB (Qwen 32B) | ~40 GB (Llama 70B / Qwen 72B) |
| Throughput (Qwen 32B) | 20.82 tok/s | ~40–50 tok/s (estimated) |
| Rough GPU cost (3×) | — | ~$6,000 CAD (retail) |

The 3× RTX 4090 upgrade requires only GPU swaps — no new server hardware, no OS reinstall, no network changes. Proxmox PCIe passthrough config is identical.

---

## Current Status

The POC is running **Qwen 2.5 32B** as the primary model — confirmed working with excellent results (20.82 tok/s, 28K context, tool calling). The 70B hardware ceiling is documented as the basis for a future GPU upgrade request.