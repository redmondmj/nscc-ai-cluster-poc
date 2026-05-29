# Google Omni & AI Avatar Video Prompts (Business-Casual Style Reference)

This version uses your pre-attached avatar image as the identity reference, but explicitly instructs Google Omni to dress the character in **professional business-casual clothing** (blazer/polo) for the presentation.

---

## Video 1: Executive Overview & Benefits
**Goal**: Pitch the NSCC AI Cluster to college administration and financial stakeholders.
**Total Clips**: 9 clips (90 seconds).

### Clip 1 (0:00 - 0:10) — The Hook
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a smart dark blazer over a gray shirt. The avatar is speaking to the camera with natural hand gestures, sitting in a modern academic-tech office. Floating in the background is a sleek, semi-transparent neon-cyan card displaying the text: 'NSCC AI Cluster: Local Infrastructure. Zero Cloud Costs.' Cinematic lighting, slow zoom-in."
* **Voiceover Script (22 words)**: 
  "How do we prepare students for an AI-driven world without exposing our budgets to volatile, escalating monthly cloud subscription fees?"

### Clip 2 (0:10 - 0:20) — The Cloud Risk
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a smart dark blazer over a gray shirt. The avatar is speaking directly to the camera. In the background, abstract graphics illustrate data packets moving along red lines toward an external cloud server node, representing external network routing."
* **Voiceover Script (22 words)**: 
  "Commercial APIs route student inputs and institutional assets outside our campus network, creating challenges for local data sovereignty and governance."

### Clip 3 (0:20 - 0:30) — The On-Prem Solution
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a smart dark blazer over a gray shirt. The avatar is speaking to the camera. In the background, the warning graphics fade out, replaced by a glowing green shield protecting a server rack. Green grid lines representing 'VLAN 30' illuminate."
* **Voiceover Script (24 words)**: 
  "Our Proof of Concept solves this. The NSCC Cluster runs entirely on-premises, isolated on our own secure, air-gapped VLAN 30 network."

### Clip 4 (0:30 - 0:40) — Capital vs. Operational Cost
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a smart dark blazer over a gray shirt. The avatar is speaking to the camera. Overlay a clean, minimalist graphic of a balance scale showing 'Cloud Fees' (heavy, dropping) balanced by 'On-Prem Fixed Costs' (stable, green)."
* **Voiceover Script (23 words)**: 
  "Instead of paying vendor fees that scale up with every prompt, our cluster leverages commodity hardware as a one-time capital expense."

### Clip 5 (0:40 - 0:50) — Escalating Token Volume
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a smart dark blazer over a gray shirt. The avatar is gesturing slightly to their side. Next to them, a line graph scales up rapidly showing a curve ascending from 50M to 2.5 Billion tokens."
* **Voiceover Script (23 words)**: 
  "As more classes integrate AI, cloud token costs escalate rapidly. Hosting models locally eliminates these bills, keeping operating fees at zero."

### Clip 6 (0:50 - 1:00) — IT Oversight & Auditing
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a smart dark blazer over a gray shirt. The avatar is speaking. In the background, a clean mockup of the Proxmox VE 9.1 interface displays system graphs showing CPU load, memory bandwidth, and local query logs."
* **Voiceover Script (22 words)**: 
  "Control of our hypervisor layer via Proxmox VE 9.1 gives our IT staff absolute visibility to rate-limit, audit, and log queries."

### Clip 7 (1:00 - 1:10) — CCN IT Program Scaling
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a smart dark blazer over a gray shirt. The avatar is speaking. A stylized regional network map displays behind them, highlighting connected hubs labeled 'CCN Collaborative Network'."
* **Voiceover Script (22 words)**: 
  "We are targeting deployment to all IT programs across our College Collaborative Network, providing secure inference pools to hundreds of students."

### Clip 8 (1:10 - 1:20) — Hardware Upgrade Case
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a smart dark blazer over a gray shirt. The avatar is speaking. Floating next to them is a memory capacity chart showing a bar for 'Current Setup' stopping short of the 'Target Limit' line, and a second 'Proposed Upgrade' bar exceeding it."
* **Voiceover Script (21 words)**: 
  "Transitioning to upgraded GPU nodes unlocks seventy-billion parameter model execution, using our already proven network orchestration stack."

### Clip 9 (1:20 - 1:30) — The Closing Pitch
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a smart dark blazer over a gray shirt. The avatar smiles confidently, speaking to the camera. Overlay text fades in: 'NSCC AI CLUSTER: Local. Secure. Scalable.' A college logo fades in beside the text."
* **Voiceover Script (21 words)**: 
  "Partner with us to fund stable, sovereign AI infrastructure. Build a secure, local, and cost-effective learning ecosystem for our students."

---

## Video 2: Technical Walkthrough & "How it Works"
**Goal**: Explain virtualization, networking, and code integrations.
**Total Clips**: 12 clips (120 seconds).

### Clip 1 (0:00 - 0:10) — Technical Intro
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar is speaking in a tech lab environment with server racks. A semi-transparent 3D cluster diagram rotates next to them, highlighting three primary nodes."
* **Voiceover Script**: 
  "Welcome. Today we're reviewing the architecture behind the NSCC AI Cluster, a multi-node pipeline-parallel engine running on commodity hardware."

### Clip 2 (0:10 - 0:20) — Hypervisor Configuration
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar points toward a 3D server rack illustration displaying hosts AIProx1, 2, and 3, surrounded by a glowing 'VLAN 30' boundary."
* **Voiceover Script**: 
  "The cluster is anchored by three Proxmox VE 9.1 hypervisor nodes, isolated on a dedicated management VLAN 30 network."

### Clip 3 (0:20 - 0:30) — PCIe Passthrough
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar is speaking. Background shows an animation of a graphic card (GPU) merging directly into a virtual motherboard layer. Text pops up: 'IOMMU Direct Passthrough'."
* **Voiceover Script**: 
  "We bypass virtual layer performance bottlenecks by configuring raw IOMMU PCIe passthrough, mapping physical RTX GPUs directly to guest VMs."

### Clip 4 (0:30 - 0:40) — Ubuntu Guest VMs
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar is speaking. Floating behind them are three terminal windows displaying Linux boot logs and vLLM startup engine sequences."
* **Voiceover Script**: 
  "Our environment runs on three Ubuntu 24.04 LTS guest virtual machines, coordinated using vLLM and Ray distributed inference engines."

### Clip 5 (0:40 - 0:50) — Model Layer Distribution
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar gestures to a vertical block diagram showing model layers divided into: Bottom (Layers 0-10 on VM 100), Middle (Layers 11-21 on VM 200), and Top (Layers 22-31 on VM 300)."
* **Voiceover Script**: 
  "We distribute model layers across GPUs. VM 100 handles embeddings and layers zero to ten; the remaining layers split across VMs."

### Clip 6 (0:50 - 1:00) — Network Pinned Routing
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar is speaking. Behind them, two nodes connect via a neon-green data pipeline labeled 'eth1', showing fast glowing data packet flow."
* **Voiceover Script**: 
  "To handle intense tensor handshakes, inter-node traffic is strictly bound to the internal secondary interface, eth1, routing through dedicated switches."

### Clip 7 (1:00 - 1:10) — Gloo Environment Variable Pinning
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar is speaking. A code terminal window overlays next to them displaying: 'export GLOO_SOCKET_IFNAME=eth1' and 'export NCCL_SOCKET_IFNAME=eth1'."
* **Voiceover Script**: 
  "By pinning GLOO and NCCL communications to eth1, we keep model weights traffic off the public-facing management switch, guaranteeing security."

### Clip 8 (1:10 - 1:20) — Startup Patches
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar is speaking. Next to them is a code editor showing a python script with highlights on: 'def patched_init_workers(*args, **kwargs):' and Ray worker variables."
* **Voiceover Script**: 
  "We resolved pipeline initialization handshake issues in Ray by deploying startup python runtime patches to force correct GPU mapping across nodes."

### Clip 9 (1:20 - 1:30) — API Access & Endpoint
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar points to a browser mockup displaying JSON response payload data from an API endpoint. The URL shows: 'http://10.30.0.21:8001/v1/models'."
* **Voiceover Script**: 
  "The cluster exposes a standard OpenAI-compatible REST API at port 8001. This acts as a drop-in backend swap for student client apps."

### Clip 10 (1:30 - 1:40) — Case Study: Curriculum Mapping
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar is speaking. A split overlay shows a PDF outline on the left and a generated MS Word curriculum document on the right, linked by a green arrow."
* **Voiceover Script**: 
  "For example, our curriculum outcome mapping tool queries this endpoint locally, automating outcome alignment matrices safely with zero cloud data transit."

### Clip 11 (1:40 - 1:50) — Hardware Ceilings (170 MB deficit)
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar is speaking. Next to them, a vertical capacity bar climbs to 36.00 GB and turns orange at a red ceiling line labeled '170 MB Deficit'."
* **Voiceover Script (21 words)**: 
  "Our current hardware nodes fall exactly 170 megabytes short of the capacity required to host seventy-billion parameter models."

### Clip 12 (1:50 - 2:00) — Stable GPU Upgrades
* **Visual Prompt (Omni)**: 
  "Featuring the avatar from the attached reference image, styled in professional business-casual clothing consisting of a dark polo shirt. The avatar smiles. The capacity bar next to them expands to 72.00 GB and turns green. Text overlays: '70B Scale Supported'."
* **Voiceover Script (20 words)**: 
  "Transitioning to upgraded GPU hardware gives us the stable, high-capacity footprint required to run production-grade seventy-billion parameter models."
