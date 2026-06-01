#!/bin/bash
set -e
pip install -q ray 2>&1 | tail -1
bash /scripts/patch_vllm_pp.sh
export RAY_NUM_HEARTBEATS_TIMEOUT=300
export RAY_RAYLET_HEARTBEAT_PERIOD_MILLISECONDS=2000
export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True
ray start --head --port=6379 --node-ip-address=192.168.100.1 --dashboard-host=0.0.0.0
sleep 60
exec vllm serve Qwen/Qwen2.5-32B-Instruct-AWQ \
  --enable-auto-tool-choice --tool-call-parser hermes \
  --pipeline-parallel-size 3 \
  --tensor-parallel-size 1 \
  --distributed-executor-backend ray \
  --quantization awq_marlin \
  --host 0.0.0.0 \
  --port 8001 \
  --served-model-name qwen-32b \
  --max-model-len 28672
