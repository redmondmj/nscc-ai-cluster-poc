# Google Omni & AI Avatar Video Prompts (Filter-Safe / B-Roll Focus)

Safety filters are often triggered when a prompt describes a human presenter (e.g., "presenter in their mid-30s", "clean-cut"), as the model flags it as attempting to generate deepfakes or real individuals.

To bypass this filter, the prompts below focus **solely on abstract motion graphics, diagrams, and server room b-roll**. You can generate these visual clips with Google Omni, and then overlay your own avatar on top in your editor (e.g., as a transparent presenter or inside a circular bubble).

---

## Video 1: Executive Overview & Benefits
**Goal**: Pitch the NSCC AI Cluster to college administration and financial stakeholders.
**Total Clips**: 9 clips (90 seconds).

### Clip 1 (0:00 - 0:10) — The Hook
* **Visual Prompt (Omni)**: 
  "Abstract 3D digital network map with glowing nodes in cyan and deep blue. A clean, glassmorphism floating title card slowly slides into the center, reading: 'NSCC AI Cluster: Local Infrastructure. Zero Cloud Costs.' Cinematic camera drift, dark background."
* **Voiceover Script**: 
  "How do we prepare students for an AI-driven world without exposing our budgets to volatile, escalating monthly cloud subscription fees?"

### Clip 2 (0:10 - 0:20) — The Cloud Risk
* **Visual Prompt (Omni)**: 
  "A dark digital server landscape. Neon-red glowing data particles float away from a grid boundary towards an opaque red cloud icon with pulsing warning outlines. Slow zoom-in, high contrast tech style."
* **Voiceover Script**: 
  "Commercial APIs send student queries and proprietary research outside our walls, creating significant data governance and institutional privacy compliance risks."

### Clip 3 (0:20 - 0:30) — The On-Prem Solution
* **Visual Prompt (Omni)**: 
  "A glowing emerald-green shield or lock icon forms around a sleek, modern rack-mount server. A green network grid expands outwards with label 'VLAN 30 (10.30.0.0/24)' floating in clean sans-serif typography."
* **Voiceover Script**: 
  "Our Proof of Concept solves this. The NSCC Cluster runs entirely on-premises, isolated on our own secure, air-gapped VLAN 30 network."

### Clip 4 (0:30 - 0:40) — Capital vs. Operational Cost
* **Visual Prompt (Omni)**: 
  "A minimalistic balance scale in a dark digital space. On the left scale, a heavy stack of glowing red invoices labeled 'Cloud Subscription Fees' drops down. On the right, a stable green server icon labeled 'Zero Dollar Local Cost' balances it."
* **Voiceover Script**: 
  "Instead of paying vendor fees that scale up with every prompt, our cluster leverages commodity hardware as a one-time capital expense."

### Clip 5 (0:40 - 0:50) — Escalating Token Volume
* **Visual Prompt (Omni)**: 
  "A clean line graph showing a sharp curve ascending rapidly from left to right. The vertical axis shows dollar signs climbing. A label points to the curve: 'Token Volume: 50M to 2.5 Billion'."
* **Voiceover Script**: 
  "As more classes integrate AI, cloud token costs escalate rapidly. Hosting models locally eliminates these bills, keeping operating fees at zero."

### Clip 6 (0:50 - 1:00) — IT Oversight & Auditing
* **Visual Prompt (Omni)**: 
  "A sleek, dark dashboard interface displaying system metrics. Radial gauges monitor CPU load, memory bandwidth, and query logs in real-time. Neon-cyan and green accents, smooth 60fps animations."
* **Voiceover Script**: 
  "Control of our hypervisor layer via Proxmox VE 9.1 gives our IT staff absolute visibility to rate-limit, audit, and log queries."

### Clip 7 (1:00 - 1:10) — CCN IT Program Scaling
* **Visual Prompt (Omni)**: 
  "A stylized regional network map. Glowing green points representing campus hubs illuminate one by one, connected by glowing lines labeled 'CCN Collaborative Network'. Clean tech aesthetic."
* **Voiceover Script**: 
  "We are targeting deployment to all IT programs across our College Collaborative Network, providing secure inference pools to hundreds of students."

### Clip 8 (1:10 - 1:20) — Hardware Upgrade Case
* **Visual Prompt (Omni)**: 
  "A VRAM capacity bar chart. The bar representing 'Current (RTX 4070)' stops just short of a red limit line labeled 'Llama 3.1 70B (36.17 GB)'. A second bar representing 'Proposed (Radeon / RTX 4090)' shoots past the line into the green zone."
* **Voiceover Script**: 
  "Upgrading to Radeon AI PRO or RTX 4090 GPUs unlocks standard Llama 3.1 70B parameters, using our already proven network orchestration stack."

### Clip 9 (1:20 - 1:30) — The Closing Pitch
* **Visual Prompt (Omni)**: 
  "Cinematic macro shot of a motherboard circuit board with glowing pathways converging to a central processor. Clean text overlays: 'NSCC AI CLUSTER: Local. Secure. Scalable.' A college logo placeholder fades in."
* **Voiceover Script**: 
  "Partner with us to fund stable, sovereign AI infrastructure. Build a secure, local, and cost-effective learning ecosystem for our students."

---

## Video 2: Technical Walkthrough & "How it Works"
**Goal**: Explain virtualization, networking, and code integrations.
**Total Clips**: 12 clips (120 seconds).

### Clip 1 (0:00 - 0:10) — Technical Intro
* **Visual Prompt (Omni)**: 
  "A dark tech laboratory background with server racks blinking blue and green LEDs. In the foreground, a semi-transparent 3D cluster diagram rotates, highlighting three primary nodes."
* **Voiceover Script**: 
  "Welcome. Today we're reviewing the architecture behind the NSCC AI Cluster, a multi-node pipeline-parallel engine running on commodity hardware."

### Clip 2 (0:10 - 0:20) — Hypervisor Configuration
* **Visual Prompt (Omni)**: 
  "Zoom into three rack servers labeled AIProx1, AIProx2, and AIProx3. A glowing boundary wraps them, labeled with text: 'VLAN 30 management'."
* **Voiceover Script**: 
  "The cluster is anchored by three Proxmox VE 9.1 hypervisor nodes, isolated on a dedicated management VLAN 30 network."

### Clip 3 (0:20 - 0:30) — PCIe Passthrough
* **Visual Prompt (Omni)**: 
  "Abstract animation of a graphic card (GPU) merging directly into a virtual motherboard layer. Text pops up: 'IOMMU Direct Passthrough' with a green checkmark."
* **Voiceover Script**: 
  "We bypass virtual layer performance bottlenecks by configuring raw IOMMU PCIe passthrough, mapping physical RTX GPUs directly to guest VMs."

### Clip 4 (0:30 - 0:40) — Ubuntu Guest VMs
* **Visual Prompt (Omni)**: 
  "Three code terminals displaying Linux boot logs, side-by-side. The header of each window shows 'Ubuntu 24.04 LTS' and vLLM startup engine logs."
* **Voiceover Script**: 
  "Our environment runs on three Ubuntu 24.04 LTS guest virtual machines, coordinated using vLLM and Ray distributed inference engines."

### Clip 5 (0:40 - 0:50) — Model Layer Distribution
* **Visual Prompt (Omni)**: 
  "A vertical model architecture block diagram. The block is divided into three sections: Bottom (Layers 0-10, VM 100), Middle (Layers 11-21, VM 200), and Top (Layers 22-31, VM 300)."
* **Voiceover Script**: 
  "We distribute model layers across GPUs. VM 100 handles embeddings and layers zero to ten; the remaining layers split across VMs."

### Clip 6 (0:50 - 1:00) — Network Pinned Routing
* **Visual Prompt (Omni)**: 
  "Two nodes connecting via a thick, neon-green data pipeline labeled 'eth1'. Glowing packet clusters travel back and forth at high speed."
* **Voiceover Script**: 
  "To handle intense tensor handshakes, inter-node traffic is strictly bound to the internal secondary interface, eth1, routing through dedicated switches."

### Clip 7 (1:00 - 1:10) — Gloo Environment Variable Pinning
* **Visual Prompt (Omni)**: 
  "A dark terminal screen showing environment declarations: 'export GLOO_SOCKET_IFNAME=eth1' and 'export NCCL_SOCKET_IFNAME=eth1' highlighted in bold green."
* **Voiceover Script**: 
  "By pinning GLOO and NCCL communications to eth1, we keep model weights traffic off the public-facing management switch, guaranteeing security."

### Clip 8 (1:10 - 1:20) — Startup Patches
* **Visual Prompt (Omni)**: 
  "Close up of python code displaying: 'def patched_init_workers(*args, **kwargs):' and 'os.environ[\"RAY_EXPERIMENTAL_NOSET_CUDA_VISIBLE_DEVICES\"] = \"0\"'. Sleek syntax highlighting."
* **Voiceover Script**: 
  "We resolved pipeline initialization handshake issues in Ray by deploying startup python runtime patches to force correct GPU mapping across nodes."

### Clip 9 (1:20 - 1:30) — API Access & Endpoint
* **Visual Prompt (Omni)**: 
  "A clean web browser mockup showing the JSON response payload from a local REST API endpoint. The URL bar shows: 'http://10.30.0.21:8001/v1/models'."
* **Voiceover Script**: 
  "The cluster exposes a standard OpenAI-compatible REST API at port 8001. This acts as a drop-in backend swap for student client apps."

### Clip 10 (1:30 - 1:40) — Case Study: Curriculum Mapping
* **Visual Prompt (Omni)**: 
  "A dual screen layout: Left side parses a PDF syllabus outline; Right side outputs a Microsoft Word document with outcome mapping tables. Arrow links them."
* **Voiceover Script**: 
  "For example, our curriculum outcome mapping tool queries this endpoint locally, automating outcome alignment matrices safely with zero cloud data transit."

### Clip 11 (1:40 - 1:50) — Hardware Ceilings (170 MB deficit)
* **Visual Prompt (Omni)**: 
  "A vertical bar showing VRAM usage. The bar rises to 36.00 GB and turns bright orange as it hits a ceiling. The gap to the target line is marked '170 MB deficit'."
* **Voiceover Script**: 
  "Our current RTX 4070 cards fall exactly 170 megabytes short of the VRAM address space required to host Llama 70B models."

### Clip 12 (1:50 - 2:00) — Stable GPU Upgrades
* **Visual Prompt (Omni)**: 
  "Sleek 3D renders of a workstation GPU. A circular gauge fills completely to show '72 GB Available'. Green text overlays: 'Llama 3.1 70B Supported'."
* **Voiceover Script**: 
  "Upgrading to Radeon AI PRO or RTX 4090 GPUs gives us the stable, high-VRAM footprint required to run production-grade 70B models."
