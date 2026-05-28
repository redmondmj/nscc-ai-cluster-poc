# Google Omni & AI Avatar Video Prompts (10-Second Scene Cuts)

Since video models typically generate in 5 to 10-second increments, the script below has been broken down into explicit **10-second clips**. 

> [!NOTE]
> For a natural speaking rate (~130–150 words per minute), a **10-second clip should contain exactly 20 to 25 words**. The script below is timed precisely to fit this restriction, letting you generate the clips individually and stitch them together.

---

## Video 1: Executive Overview & Benefits
**Goal**: Pitch the NSCC AI Cluster to college administration and financial stakeholders.
**Total Clips**: 9 clips (90 seconds).
**Avatar Settings**: Same profile settings apply (blazer, warm tone, tech office background).

### Clip 1 (0:00 - 0:10) — The Hook
* **Visual Prompt**: *Professional presenter in tech office. A sleek, semi-transparent neon-cyan card floats next to them displaying: "NSCC AI Cluster: Local. Zero Cloud Costs."*
* **Voiceover Script (22 words)**: 
  "How do we prepare students for an AI-driven world without exposing our budgets to volatile, escalating monthly cloud subscription fees?"

### Clip 2 (0:10 - 0:20) — The Cloud Risk
* **Visual Prompt**: *Camera zooms in slightly. Background graphics show data packets moving to a red cloud icon with warning symbols, representing data leakage.*
* **Voiceover Script (21 words)**: 
  "Commercial APIs send student queries and proprietary research outside our walls, creating significant data governance and institutional privacy compliance risks."

### Clip 3 (0:20 - 0:30) — The On-Prem Solution
* **Visual Prompt**: *The cloud icon fades, replaced by a secure lock. A green grid highlights VLAN 30 network boundaries (10.30.0.0/24) around local servers.*
* **Voiceover Script (24 words)**: 
  "Our Proof of Concept solves this. The NSCC Cluster runs entirely on-premises, isolated on our own secure, air-gapped VLAN 30 network."

### Clip 4 (0:30 - 0:40) — Capital vs. Operational Cost
* **Visual Prompt**: *A financial graphic overlays. A scale balances 'Cloud: Linear Monthly Bills' (heavy) against 'On-Prem: One-Time Hardware' (stable).*
* **Voiceover Script (23 words)**: 
  "Instead of paying vendor fees that scale up with every prompt, our cluster leverages commodity hardware as a one-time capital expense."

### Clip 5 (0:40 - 0:50) — Escalating Token Volume
* **Visual Prompt**: *Presenter gestures to a sliding chart. The volume slider rises from 50M to 2.5 Billion monthly tokens, showing cloud fees skyrocketing.*
* **Voiceover Script (23 words)**: 
  "As more classes integrate AI, cloud token costs escalate rapidly. Hosting models locally eliminates these bills, keeping operating fees at zero."

### Clip 6 (0:50 - 1:00) — IT oversight & Auditing
* **Visual Prompt**: *Presenter stands next to a clean mockup of the Proxmox VE 9.1 interface. Graphs show real-time memory and query traffic.*
* **Voiceover Script (22 words)**: 
  "Control of our hypervisor layer via Proxmox VE 9.1 gives our IT staff absolute visibility to rate-limit, audit, and log queries."

### Clip 7 (1:00 - 1:10) — CCN IT Program Scaling
* **Visual Prompt**: *A digital map of the region highlights connected nodes of the 'College Collaborative Network (CCN)', showing shared access routes.*
* **Voiceover Script (22 words)**: 
  "We are targeting deployment to all IT programs across our College Collaborative Network, providing secure inference pools to hundreds of students."

### Clip 8 (1:10 - 1:20) — Hardware Upgrade Case
* **Visual Prompt**: *Bar chart overlays comparing RTX 4070 to Radeon AI PRO / RTX 4090, highlighting the 170 MB limit margin to run 70B models.*
* **Voiceover Script (25 words)**: 
  "Upgrading to Radeon AI PRO or RTX 4090 GPUs unlocks standard Llama 3.1 70B parameters, using our already proven network orchestration stack."

### Clip 9 (1:20 - 1:30) — The Closing Pitch
* **Visual Prompt**: *Presenter smiles confidently. Clean text card overlays: "NSCC AI CLUSTER: Local. Secure. Scalable." Logo fades in.*
* **Voiceover Script (21 words)**: 
  "Partner with us to fund stable, sovereign AI infrastructure. Build a secure, local, and cost-effective learning ecosystem for our students."

---

## Video 2: Technical Walkthrough & "How it Works"
**Goal**: Explain the underlying infrastructure, virtualization, and code integrations.
**Total Clips**: 12 clips (120 seconds).
**Avatar Settings**: Same profile settings apply (polo shirt, server lab background).

### Clip 1 (0:00 - 0:10) — Technical Intro
* **Visual Prompt**: *Technical presenter in server lab. A 3-node network topology diagram floats in next to them: AIProx1, 2, and 3.*
* **Voiceover Script (22 words)**: 
  "Welcome. Today we're reviewing the architecture behind the NSCC AI Cluster, a multi-node pipeline-parallel engine running on commodity hardware."

### Clip 2 (0:10 - 0:20) — Hypervisor Configuration
* **Visual Prompt**: *Close up of the presenter pointing to the SVG node map. Active status lights pulse green on the Proxmox hosts.*
* **Voiceover Script (20 words)**: 
  "The cluster is anchored by three Proxmox VE 9.1 hypervisor nodes, isolated on a dedicated management VLAN 30 network."

### Clip 3 (0:20 - 0:30) — PCIe Passthrough
* **Visual Prompt**: *The diagram zooms in on host-to-VM links. The word 'IOMMU' glows. Mapped GPU adapters list in a terminal overlay.*
* **Voiceover Script (21 words)**: 
  "We bypass virtual layer performance bottlenecks by configuring raw IOMMU PCIe passthrough, mapping physical RTX GPUs directly to guest VMs."

### Clip 4 (0:30 - 0:40) — Ubuntu Guest VMs
* **Visual Prompt**: *The terminal shows three boot sequences for VM 100, VM 200, and VM 300 running Ubuntu 24.04 LTS.*
* **Voiceover Script (21 words)**: 
  "Our environment runs on three Ubuntu 24.04 LTS guest virtual machines, coordinated using vLLM and Ray distributed inference engines."

### Clip 5 (0:40 - 0:50) — Model Layer Distribution
* **Visual Prompt**: *SVG highlights VM 100, 200, and 300. Layer assignments display: VM 100 (Layers 0-10), VM 200 (11-21), VM 300 (22-31).*
* **Voiceover Script (24 words)**: 
  "We distribute model layers across GPUs. VM 100 handles embeddings and layers zero to ten; the remaining layers split across VMs."

### Clip 6 (0:50 - 1:00) — Network Pinned Routing
* **Visual Prompt**: *The inter-VM networking link 'eth1' pulses with glowing data packet animations. Private IP addresses (192.168.100.x) highlight.*
* **Voiceover Script (23 words)**: 
  "To handle intense tensor handshakes, inter-node traffic is strictly bound to the internal secondary interface, eth1, routing through dedicated switches."

### Clip 7 (1:00 - 1:10) — Gloo Environment Variable Pinning
* **Visual Prompt**: *A terminal window displays code lines: `export GLOO_SOCKET_IFNAME=eth1` and `export NCCL_SOCKET_IFNAME=eth1` in large text.*
* **Voiceover Script (21 words)**: 
  "By pinning GLOO and NCCL communications to eth1, we keep model weights traffic off the public-facing management switch, guaranteeing security."

### Clip 8 (1:10 - 1:20) — Startup Patches
* **Visual Prompt**: *Presenter next to a code window highlighting `vllm_patch.py`. It shows the Ray GPU visible device override code.*
* **Voiceover Script (24 words)**: 
  "We resolved pipeline initialization handshake issues in Ray by deploying startup python runtime patches to force correct GPU mapping across nodes."

### Clip 9 (1:20 - 1:30) — API Access & Endpoint
* **Visual Prompt**: *An API terminal shows a request returning a stream. The base URL `http://10.30.0.21:8001/v1` is highlighted.*
* **Voiceover Script (24 words)**: 
  "The cluster exposes a standard OpenAI-compatible REST API at port 8001. This acts as a drop-in backend swap for student client apps."

### Clip 10 (1:30 - 1:40) — Case Study: Curriculum Mapping
* **Visual Prompt**: *Flowchart diagram of nscc-curriculum-outcome-mapping scrolls into view showing PDF parsing to Word DOCX report.*
* **Voiceover Script (23 words)**: 
  "For example, our curriculum outcome mapping tool queries this endpoint locally, automating outcome alignment matrices safely with zero cloud data transit."

### Clip 11 (1:40 - 1:50) — Hardware Ceilings (170 MB deficit)
* **Visual Prompt**: *VRAM capacity chart displays, showing RTX 4070 (36.00 GB VRAM) just 170 MB short of Llama 3.1 70B footprint.*
* **Voiceover Script (23 words)**: 
  "Our current RTX 4070 cards fall exactly 170 megabytes short of the VRAM address space required to host Llama 70B models."

### Clip 12 (1:50 - 2:00) — Stable GPU Upgrades
* **Visual Prompt**: *VRAM chart animates up to 72.00 GB for Radeon AI PRO / RTX 4090. Text: "70B Parameter Capacity Unlocked."*
* **Voiceover Script (23 words)**: 
  "Upgrading to Radeon AI PRO or RTX 4090 GPUs gives us the stable, high-VRAM footprint required to run production-grade 70B models."
