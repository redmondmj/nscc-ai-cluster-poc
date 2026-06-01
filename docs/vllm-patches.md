# vLLM PP=3 Patches

vLLM `0.20.2` (`vllm/vllm-openai:latest`) requires 4 patches to run pipeline parallelism with PP=3. All patches are applied automatically at container startup by [`scripts/patch_vllm_pp.sh`](../scripts/patch_vllm_pp.sh).

The patch script is idempotent — it detects whether each patch is already applied and skips if so. It also clears Python `__pycache__` after each change to force recompilation.

---

## Patch 1 — `gpu_model_runner.py`: PP layer key guard

**File:** `vllm/v1/worker/gpu_model_runner.py`  
**Function:** `_initialize_attention_backends` (inside `get_attn_backends_for_group`)

### Problem

vLLM iterates over *all* attention layers in the pipeline-parallel group spec when initialising attention backends. But each worker only holds its own pipeline stage's layers. When a worker tries to look up a layer it doesn't own:

```
KeyError: 'model.layers.43.self_attn.attn'
```

This crashes every worker except the last stage during `initialize_from_config`.

### Fix

```python
# BEFORE:
                attn_backend = layers[layer_name].get_attn_backend()

# AFTER:
                if layer_name not in layers: continue
                attn_backend = layers[layer_name].get_attn_backend()
```

One-line guard — if the layer belongs to a different pipeline stage, skip it.

---

## Patch 2 — `layernorm.py`: FieldInfo subscript guard

**File:** `vllm/model_executor/layers/layernorm.py`

### Problem

Ray/cloudpickle deserialises `IrOpPriorityConfig` (a pydantic dataclass) with field descriptors (`FieldInfo` objects) instead of actual list values. When `layernorm.py` tries to subscript `priority.fused_add_rms_norm[0]`, it gets a `FieldInfo` object, not a list:

```
TypeError: 'FieldInfo' object is not subscriptable
```

### Fix

```python
# BEFORE:
native_add_rms_norm = priority.fused_add_rms_norm[0] == "native" or var_override

# AFTER:
native_add_rms_norm = (
    isinstance(priority.fused_add_rms_norm, list)
    and len(priority.fused_add_rms_norm) > 0
    and priority.fused_add_rms_norm[0] == "native"
) or var_override
```

---

## Patch 3 — `kernel.py`: FieldInfo in `set_priority` and `compute_hash`

**File:** `vllm/config/kernel.py`

### Problem

Same root cause as Patch 2 — `IrOpPriorityConfig` fields arrive as `FieldInfo` descriptors after Ray deserialization. This affects two functions:

**3a — `set_priority`:** `op_priority = getattr(self, field.name)` returns a `FieldInfo`. Downstream code asserts it's a list and iterates it, crashing with `TypeError`.

**3b — `compute_hash`:** `get_hash_factors` calls `getattr` on the dataclass fields. If any field value is `FieldInfo` instead of a list, hashing fails.

### Fixes

**3a:**
```python
# BEFORE:
                op_priority = getattr(self, field.name)
                assert op_priority is not None, (

# AFTER:
                op_priority = getattr(self, field.name)
                if not isinstance(op_priority, list):
                    op_priority = []
                assert op_priority is not None, (
```

**3b:**
```python
# BEFORE:
        factors = get_hash_factors(self, set())

# AFTER:
        for _f in fields(self):
            if not isinstance(getattr(self, _f.name), list):
                object.__setattr__(self, _f.name, [])
        factors = get_hash_factors(self, set())
```

---

## Patch 4 — `kernel_warmup.py`: Skip FlashInfer warmup for PP models

**File:** `vllm/model_executor/warmup/kernel_warmup.py`

### Problem

After all other patches pass, `kernel_warmup.py` runs a FlashInfer JIT pre-compilation pass using `_dummy_run(num_tokens=16, force_attention=True, ...)`. This builds an `attn_metadata` dict for the dummy forward pass.

In pipeline-parallel mode, each worker's dummy run only populates metadata for its own PP stage's layers. But when `get_attention_context` tries to look up a layer name from a different stage:

```
KeyError: 'model.layers.43.self_attn.attn'
  File "attention.py", line 646, in get_attention_context
    attn_metadata = attn_metadata_raw[layer_name]
```

This is a PP-specific bug in the FlashInfer warmup path — it doesn't exist in single-GPU or tensor-parallel deployments.

### Fix

Skip the FlashInfer warmup entirely when `pipeline_parallel_size > 1`. The warmup is a performance optimisation (pre-JIT-compiles FlashInfer kernels) — skipping it means the kernels compile on the first real inference request (small one-time cost) but the server initialises correctly.

```python
# BEFORE:
    if (
        not worker.model_runner.is_pooling_model
        and worker.model_runner.attn_groups
        # NOTE: This should be `any` instead of `all` ...
        and all(
            _is_flashinfer_backend(group.backend)
            ...
        )
    ):

# AFTER:
    if (
        not worker.model_runner.is_pooling_model
        and worker.model_runner.attn_groups
        and worker.vllm_config.parallel_config.pipeline_parallel_size == 1
        # NOTE: This should be `any` instead of `all` ...
        and all(
            _is_flashinfer_backend(group.backend)
            ...
        )
    ):
```

---

## Root Cause Summary

Patches 1–3 all stem from the same root cause: **Ray/cloudpickle deserialises `IrOpPriorityConfig` (a pydantic v2 dataclass) with `FieldInfo` descriptors instead of actual values** when the config is transmitted across the Ray cluster between nodes. Code that expects `list` values receives `FieldInfo` objects and fails.

Patch 4 is an independent PP-specific bug in the FlashInfer warmup code path.

All patches are upstream issues in vLLM 0.20.2 specific to the pipeline-parallel + multi-node Ray deployment path. Single-node or tensor-parallel deployments will not encounter these.