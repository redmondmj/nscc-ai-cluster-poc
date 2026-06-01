# Setup Guide — NSCC AI Cluster POC

Full walkthrough for reproducing this cluster from bare metal.

---

## Prerequisites

### Hardware (per node)

- Intel/AMD CPU with VT-x (virtualisation) **and** VT-d (IOMMU) support
- NVIDIA GPU with ≥12 GB VRAM (RTX 4070 or better)
- ≥24 GB system RAM
- 2× SSDs recommended: one for OS/Proxmox (~256 GB NVMe), one for VM data (~200 GB)
- 2× network interfaces per node (one for management, one for cluster internal)

> **BIOS:** Both VT-x and VT-d must be explicitly enabled — they are often on separate BIOS pages. VT-x alone is not enough for GPU passthrough.

### Software

- Proxmox VE 8+ on each node
- Ubuntu 24.04 LTS cloud-init image for VMs
- Internet access for initial image/model downloads (~20 GB vLLM Docker image, ~19 GB Qwen model)

---

## Step 1 — Proxmox VE Setup

### 1.1 Install Proxmox on each node

Standard Proxmox VE installation. Join all three nodes into a cluster.

### 1.2 Enable IOMMU (required for GPU passthrough)

```bash
# /etc/default/grub
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt pcie_acs_override=downstream,multifunction"

update-grub
reboot
```

Verify after reboot:
```bash
dmesg | grep -e DMAR -e IOMMU | head -5
# Should show: DMAR: IOMMU enabled
```

### 1.3 Load VFIO modules

```bash
# /etc/modules
vfio
vfio_iommu_type1
vfio_pci
vfio_virqfd
```

### 1.4 Blacklist GPU on host (bind to VFIO)

Find the GPU PCI IDs:
```bash
lspci -nn | grep -i nvidia
# e.g. 01:00.0 VGA [10de:2786]  01:00.1 Audio [10de:22bc]
```

```bash
# /etc/modprobe.d/vfio.conf
options vfio-pci ids=10de:2786,10de:22bc

# /etc/modprobe.d/blacklist-nvidia.conf
blacklist nouveau
blacklist nvidia
blacklist nvidiafb
```

```bash
update-initramfs -u
reboot
```

Verify:
```bash
lspci -nnk | grep -A3 NVIDIA
# Kernel driver in use: vfio-pci  ← correct
```

### 1.5 Set up internal cluster network

Create a Linux bridge on each node for VM-to-VM communication:

In Proxmox web UI: **Node → Network → Create → Linux Bridge**
- Name: `vmbr1`
- No IP address (internal only)
- Comment: "VM cluster internal"

---

## Step 2 — Storage (ZFS + ext4 data disk)

### 2.1 Create ZFS pool on data SSD

```bash
# Find the SSD disk
lsblk
# e.g. /dev/sdb

# Create ZFS pool
zpool create -f vm-ssd /dev/sdb

# Register in Proxmox cluster
pvesm add zfspool vm-ssd --pool vm-ssd --content images,rootdir --sparse 1
```

---

## Step 3 — VM Creation

Create identical VMs on each node using the Proxmox web UI or CLI:

| Setting | Value |
|---------|-------|
| Machine | q35 (UEFI) |
| CPU | host passthrough |
| RAM | 24–32 GB |
| OS disk | 32 GB on local-lvm |
| Data disk | 200 GB on vm-ssd |
| GPU | PCIe passthrough (`pcie=1,x-vga=1`) |
| Net 0 | vmbr0 (management, VLAN 30) |
| Net 1 | vmbr1 (internal, no VLAN tag) |

**Add GPU passthrough** in VM Hardware tab:
- Add → PCI Device → select the NVIDIA GPU
- Check: `All Functions`, `Primary GPU`, `PCI-Express`

**Assign static IPs:**

| VM | Management IP | Internal IP |
|----|--------------|-------------|
| VM100 (AIProx1) | 10.30.0.21 | 192.168.100.1 |
| VM200 (AIProx2) | 10.30.0.22 | 192.168.100.2 |
| VM300 (AIProx3) | 10.30.0.23 | 192.168.100.3 |

Configure via cloud-init or `/etc/netplan/` inside the VM.

---

## Step 4 — VM Configuration (on each VM)

SSH into each VM and run:

### 4.1 NVIDIA drivers

```bash
sudo apt update
sudo apt install -y build-essential linux-headers-$(uname -r)
sudo apt install -y nvidia-driver-550
sudo reboot
# After reboot:
nvidia-smi  # should show RTX 4070
```

### 4.2 Docker + NVIDIA Container Toolkit

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# Move Docker data root to data disk (avoids filling 32 GB OS disk)
sudo mkdir -p /data/hf-cache/docker
sudo tee /etc/docker/daemon.json << 'EOF'
{
  "data-root": "/data/hf-cache/docker",
  "runtimes": { "nvidia": { "path": "nvidia-container-runtime" } },
  "default-runtime": "nvidia"
}
EOF

# Install NVIDIA Container Toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
  sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt update && sudo apt install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker --mode=cdi
sudo systemctl restart docker

# Verify
docker run --rm --gpus all nvidia/cuda:12.2.0-base-ubuntu22.04 nvidia-smi
```

### 4.3 Set up data disk

```bash
# Format and mount the 200 GB data disk
sudo mkfs.ext4 /dev/sdb
sudo mkdir -p /data/hf-cache
# Add to /etc/fstab using UUID
sudo blkid /dev/sdb
# Add: UUID=<uuid> /data/hf-cache ext4 defaults 0 2
sudo mount -a

# Create 32 GB swap for large model memory-mapping
sudo fallocate -l 32G /data/hf-cache/swapfile
sudo chmod 600 /data/hf-cache/swapfile
sudo mkswap /data/hf-cache/swapfile
sudo swapon /data/hf-cache/swapfile
# Add to /etc/fstab: /data/hf-cache/swapfile none swap sw 0 0
```

### 4.4 Deploy ai-stack scripts

```bash
mkdir -p /home/ubuntu/ai-stack
# Copy the contents of scripts/ from this repo to /home/ubuntu/ai-stack/
# All scripts must be present on ALL THREE VMs
chmod +x /home/ubuntu/ai-stack/*.sh
```

---

## Step 5 — Pull the vLLM Docker Image

Pull on all three VMs before starting the cluster (avoids timeout during startup):

```bash
docker pull vllm/vllm-openai:latest
# ~20 GB — do this while you have time
```

---

## Step 6 — Start the Cluster

### 6.1 Start workers first (VM200 and VM300)

```bash
# On VM200 — replace VLLM_HOST_IP with 192.168.100.2
docker run -d --name ray-worker --restart unless-stopped --entrypoint /bin/bash \
  --network host --ipc host --gpus all \
  -v /data/hf-cache:/data/hf-cache \
  -v /home/ubuntu/ai-stack:/scripts \
  -e HF_HOME=/data/hf-cache \
  -e VLLM_HOST_IP=192.168.100.2 \
  -e GLOO_SOCKET_IFNAME=eth1 \
  -e NCCL_SOCKET_IFNAME=eth1 \
  -e RAY_NUM_HEARTBEATS_TIMEOUT=300 \
  vllm/vllm-openai:latest /scripts/ray_worker.sh

# On VM300 — replace VLLM_HOST_IP with 192.168.100.3
docker run -d --name ray-worker --restart unless-stopped --entrypoint /bin/bash \
  --network host --ipc host --gpus all \
  -v /data/hf-cache:/data/hf-cache \
  -v /home/ubuntu/ai-stack:/scripts \
  -e HF_HOME=/data/hf-cache \
  -e VLLM_HOST_IP=192.168.100.3 \
  -e GLOO_SOCKET_IFNAME=eth1 \
  -e NCCL_SOCKET_IFNAME=eth1 \
  -e RAY_NUM_HEARTBEATS_TIMEOUT=300 \
  vllm/vllm-openai:latest /scripts/ray_worker.sh
```

### 6.2 Start the head (VM100)

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

### 6.3 Monitor startup

```bash
# Watch head logs — model loading takes ~2 minutes
docker logs -f ray-head

# Expected sequence:
# 1. Patch output (PP patch: already applied or not needed, ...)
# 2. Ray runtime started
# 3. Workers join (2 nodes joined)
# 4. Model loading (~19 GB)
# 5. torch.compile / CUDA graph capture
# 6. Application startup complete  ← ready to serve
```

### 6.4 Verify

```bash
curl http://10.30.0.21:8001/v1/models
```

---

## Step 7 — Connect AnythingLLM

1. Open AnythingLLM → Settings → LLM Provider → **Generic OpenAI**
2. Base URL: `http://10.30.0.21:8001/v1`
3. Model: `qwen-32b`
4. Context window: `28672`
5. Test connection → Save

---

## Restarting the Cluster

Workers use `--restart unless-stopped` so they recover automatically on VM reboot. The head uses `--restart no` to avoid restarting before workers are ready.

To restart the head after workers are already running:
```bash
docker start <head-container-id>
# or
docker rm ray-head && docker run ... (same command as Step 6.2)
```

---

## Troubleshooting

### Workers show "Failed to connect to GCS"
Normal if head hasn't started yet — workers retry indefinitely. Start the head and they will join.

### KeyError on layer name during startup
The vLLM patches in `patch_vllm_pp.sh` fix this. Verify patches applied by checking container logs for "PP patch: already applied or not needed".

### Model produces garbled output / NaN
Likely an AWQ format mismatch. Use models from `Qwen/`, `hugging-quants/`, or `mistralai/` official repos — not `TheBloke/` AWQ variants (incompatible GEMM format with `awq_marlin` in vLLM 0.20.2).

### OOM on last pipeline stage
The last stage holds the LM head (vocab embedding), which is disproportionately large. Reduce `--max-model-len` to free KV cache memory. For 70B models on RTX 4070s: not possible — see [hardware upgrade case](hardware-upgrade.md).