#!/bin/bash
# start_vllm.sh — Launch vLLM with pipeline parallelism across 3 nodes
#
# Prerequisites:
#   - Ray cluster must be running (see below)
#   - patch_attn_utils.py must have been applied
#   - Run on the head node (AIProx1) only
#
# Ray setup (run before this script):
#   Head:    ray start --head --port=6379 --dashboard-host=0.0.0.0
#   Workers: ray start --address='10.30.0.21:6379'

MODEL="Qwen/Qwen2.5-32B-Instruct-AWQ"

vllm serve "$MODEL" \
  --pipeline-parallel-size 3 \
  --tensor-parallel-size 1 \
  --max-model-len 16384 \
  --host 0.0.0.0 \
  --port 8001 \
  --tool-call-parser hermes \
  --enable-auto-tool-choice \
  --distributed-executor-backend ray
