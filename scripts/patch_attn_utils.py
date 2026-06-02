#!/usr/bin/env python3
"""
patch_attn_utils.py
-------------------
Fixes a KeyError crash in vLLM's attn_utils.py that occurs when using
pipeline parallelism (PP > 1). Pipeline stages only hold a subset of model
layers; the attention utils iterate over all layer names without checking
whether a layer is present on the current stage.

Apply on ALL nodes before starting vLLM.
"""

import importlib.util
import pathlib
import sys

GUARD = "if layer_name not in attn_layers:\n            continue"

def find_attn_utils() -> pathlib.Path:
    spec = importlib.util.find_spec("vllm")
    if not spec or not spec.submodule_search_locations:
        sys.exit("vllm not found in current Python environment")
    vllm_root = pathlib.Path(list(spec.submodule_search_locations)[0])
    candidates = [
        vllm_root / "model_executor" / "layers" / "attention" / "utils.py",
        vllm_root / "attention" / "utils.py",
    ]
    for p in candidates:
        if p.exists():
            return p
    sys.exit(f"Could not locate attn_utils.py under {vllm_root}")


def patch(path: pathlib.Path) -> None:
    text = path.read_text()

    if GUARD in text:
        print(f"[OK] Already patched: {path}")
        return

    # Find the for-loop over attn_layers and insert the guard
    target = "for layer_name, attn_layer in attn_layers.items():"
    if target not in text:
        # Try alternate loop pattern used in newer vLLM versions
        target = "for layer_name in attn_layers:"

    if target not in text:
        sys.exit(
            f"Could not find expected loop pattern in {path}.\n"
            "The vLLM version may have changed — inspect the file manually."
        )

    patched = text.replace(
        target,
        target + "\n            " + "if layer_name not in attn_layers:\n                continue",
        1,
    )

    # Back up original
    backup = path.with_suffix(".py.bak")
    if not backup.exists():
        backup.write_text(text)
        print(f"[backup] {backup}")

    path.write_text(patched)
    print(f"[patched] {path}")


if __name__ == "__main__":
    p = find_attn_utils()
    patch(p)
