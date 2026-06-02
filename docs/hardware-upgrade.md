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

## Recommended Upgrade — Radeon AI PRO R9700 (32 GB each)

### Why the R9700

The **ASRock Creator Radeon AI PRO R9700** is AMD's purpose-built AI inference card. At 32 GB GDDR6 per card, it offers more than 2.5× the VRAM of the current RTX 4070s — enough to run Llama 3.1 70B AWQ-INT4 across 3 pipeline stages with comfortable KV cache headroom, or Llama 3.1 70B in FP16 across 4 stages without quantisation.

| Spec | Value |
|------|-------|
| VRAM per card | 32 GB GDDR6 |
| Total (4 cards) | **128 GB** |
| Llama 3.1 70B AWQ-INT4 per stage (PP=4) | ~8.75 GB |
| KV cache headroom per stage | **~23 GB** |
| Llama 3.1 70B FP16 per stage (PP=4) | ~35 GB |
| KV cache headroom (FP16, PP=4) | **~-3 GB** ← needs quantisation |
| Framework | AMD ROCm (vLLM ROCm build required) |

With PP=4 and AWQ-INT4, each stage holds ~8.75 GB of weights and has ~23 GB free for KV cache — orders of magnitude better than the current 170 MB.

> **ROCm note:** AMD Radeon cards use ROCm instead of CUDA. vLLM ships an official ROCm Docker image (`vllm/vllm-rocm`). The Ray cluster setup and vLLM launch flags are identical; only the base image changes. See [vLLM ROCm docs](https://docs.vllm.ai/en/latest/getting_started/amd-installation.html).

---

## June 2026 Pricing (NSCC discounts where applicable)

*Pricing acquired June 1, 2026*

| Item | Qty | Unit Cost | Total |
|------|-----|-----------|-------|
| ASRock Creator Radeon AI PRO R9700 32 GB | 4 | $1,902.93 | $7,611.72 |
| Ubiquiti Aggregation Switch 8-port 10G SFP+ | 1 | $390.00 | $390.00 |
| Ubiquiti SFP+ to RJ45 10GbE module | 4 | $85.00 | $340.00 |
| Synology PCIe 4.0 x8 10Gb Ethernet NIC | 4 | $197.94 | $791.76 |
| | | **Subtotal** | **$9,133.48** |
| | | 14% HST | $1,278.69 |
| | | **Total** | **$10,412.17** |

The 10 GbE networking upgrade (switch + NICs + SFP modules) is included because pipeline parallelism passes layer activations between nodes on every forward pass — inter-node bandwidth directly caps throughput. The current 1 GbE internal bridge is the bottleneck for 70B activation sizes.

---

## Before vs. After Comparison

| | Current (RTX 4070 × 3) | Upgrade (R9700 × 4) |
|--|---|---|
| VRAM per card | 12 GB | 32 GB |
| Total cluster VRAM | 36 GB | 128 GB |
| Max model (AWQ-INT4) | ~19 GB (Qwen 32B) | ~70 GB (Llama 70B / Qwen 72B) |
| Max model (FP16) | not feasible | ~120 GB (e.g. Mistral 123B AWQ) |
| Throughput (Qwen 32B) | ~20 tok/s | ~60–80 tok/s (estimated, PP=4) |
| Inter-node bandwidth | 1 GbE | 10 GbE |
| Pipeline stages | PP=3 | PP=4 (or PP=3 + 1 hot spare) |
| Hardware changes needed | — | GPU swap + NIC install + switch |
| OS / software changes | — | Switch to vLLM ROCm image |
| **Total upgrade cost** | — | **$10,412.17 CAD (with HST)** |

The cluster architecture, Ray orchestration, vLLM configuration, and AnythingLLM integration all remain unchanged. This is a hardware swap.

---

## Alternative — RTX 4090 (CUDA, 24 GB each)

If ROCm compatibility is a concern, 3× RTX 4090 (24 GB GDDR6X each) provides 72 GB total VRAM and runs the existing CUDA-based vLLM image without changes.

| Spec | Value |
|------|-------|
| VRAM per card | 24 GB |
| Total (3 cards) | 72 GB |
| Llama 3.1 70B AWQ-INT4 per stage (PP=3) | ~11.7 GB |
| KV cache headroom | ~12 GB |
| Estimated cost (retail, 3×) | ~$6,000 CAD |

The R9700 is preferred: more VRAM per card (32 vs 24 GB), purpose-built for AI inference, and the quoted pricing is firm. The main trade-off is ROCm vs CUDA — ROCm has strong vLLM support and the same API surface.

---

## Current Status

The POC is running **Qwen 2.5 32B** as the primary model — confirmed working with excellent results (20.82 tok/s, 28K context, tool calling via AnythingLLM MCP). The 70B hardware ceiling is documented as the basis for this upgrade request.
