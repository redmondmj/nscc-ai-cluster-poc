#!/bin/bash
pip install -q ray 2>&1 | tail -1
bash /scripts/patch_vllm_pp.sh
export RAY_NUM_HEARTBEATS_TIMEOUT=300
export RAY_RAYLET_HEARTBEAT_PERIOD_MILLISECONDS=2000
export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True
ray start --address=192.168.100.1:6379 --block
