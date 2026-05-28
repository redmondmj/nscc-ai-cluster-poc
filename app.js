/* ==========================================================================
   NSCC AI Cluster POC - Application Scripting & Logic
   ========================================================================== */

// --- Global Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  // Start the throughput typing simulator
  startThroughputSimulator("mistral");
  
  // Initial calculation for savings
  calculateSavings();
  
  // Set initial state of hardware upgrade chart
  updateHardwareChart("rtx4070");
});

// --- Throughput Ticker Typing Simulator ---
const typingPrompts = {
  mistral: {
    prompt: ">> User: Define on-prem server clustering in one sentence.",
    response: ">> Mistral-7B: On-premises clustering bridges discrete physical machines into a unified resource pool, enabling high-performance compute workloads to execute locally without third-party cloud data transit."
  },
  qwen: {
    prompt: ">> User: Analyze the local model caching strategy.",
    response: ">> Qwen-2.5-32B: The cluster establishes a secure cache at '/data/hf-cache' on VM 100, which functions as a shared local repository. Model weights are cached once over the WAN and served to other cluster VMs locally over the isolated 192.168.100.x network interface, avoiding WAN bottlenecks."
  }
};

let typingTimer = null;

function startThroughputSimulator(modelType) {
  // Clear any existing typing loops
  if (typingTimer) clearTimeout(typingTimer);
  
  const textContainer = document.getElementById("ticker-text");
  if (!textContainer) return;
  
  textContainer.textContent = "";
  
  const promptText = typingPrompts[modelType].prompt;
  const responseText = typingPrompts[modelType].response;
  
  let totalText = promptText + "\n" + responseText;
  let charIndex = 0;
  
  // Calculate delay based on target token-per-second rates:
  // Average English word is ~5 chars, token is ~4 chars.
  // Mistral: 57.83 tok/s = 231 chars/s => ~4.3ms per char.
  // Qwen: 20.82 tok/s = 83 chars/s => ~12ms per char.
  const delay = modelType === "mistral" ? 5 : 15;
  
  function typeChar() {
    if (charIndex < totalText.length) {
      textContainer.textContent += totalText.charAt(charIndex);
      charIndex++;
      // Auto scroll to bottom
      const simBox = document.getElementById("ticker-sim-box");
      if (simBox) simBox.scrollTop = simBox.scrollHeight;
      
      typingTimer = setTimeout(typeChar, delay);
    } else {
      // Loop simulator: Wait 4 seconds, then restart
      typingTimer = setTimeout(() => {
        startThroughputSimulator(modelType);
      }, 4000);
    }
  }
  
  // Start typing
  typeChar();
}

function toggleThroughput(model) {
  const btnMistral = document.getElementById("btn-mistral");
  const btnQwen = document.getElementById("btn-qwen");
  const valDisplay = document.getElementById("kpi-throughput-val");
  const nameDisplay = document.getElementById("kpi-active-model");
  
  if (model === "mistral") {
    btnMistral.classList.add("active");
    btnQwen.classList.remove("active");
    valDisplay.innerHTML = `57.83 <span style="font-size: 1rem; font-weight: 500;">tok/s</span>`;
    nameDisplay.textContent = "Mistral 7B";
    startThroughputSimulator("mistral");
  } else {
    btnMistral.classList.remove("active");
    btnQwen.classList.add("active");
    valDisplay.innerHTML = `20.82 <span style="font-size: 1rem; font-weight: 500;">tok/s</span>`;
    nameDisplay.textContent = "Qwen 2.5 32B";
    startThroughputSimulator("qwen");
  }
}

// --- Cloud vs. On-Prem Savings Calculator ---
const scalePresets = {
  small: { tokens: 50, rate: 2.50 },
  medium: { tokens: 500, rate: 2.50 },
  large: { tokens: 2500, rate: 2.50 }
};

function applyPreset(presetName) {
  if (presetName === "custom") return;
  
  const preset = scalePresets[presetName];
  if (!preset) return;
  
  document.getElementById("slider-tokens").value = preset.tokens;
  document.getElementById("slider-api-rate").value = preset.rate;
  
  calculateSavings();
}

function calculateSavings() {
  const tokensSlider = document.getElementById("slider-tokens");
  const rateSlider = document.getElementById("slider-api-rate");
  
  const tokens = parseFloat(tokensSlider.value); // Millions of tokens
  const rate = parseFloat(rateSlider.value); // $ per 1 Million tokens
  
  // Update labels (handling Millions vs Billions scaling)
  let tokenStr = tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}B tokens` : `${tokens}M tokens`;
  document.getElementById("token-val-display").textContent = tokenStr;
  document.getElementById("api-rate-display").textContent = `$${rate.toFixed(2)} per 1M tokens`;
  
  // Calculate costs
  const monthlyCloudCost = tokens * rate;
  const annualCloudCost = monthlyCloudCost * 12;
  
  // Update Results
  document.getElementById("savings-monthly").textContent = `$${monthlyCloudCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById("savings-annual").textContent = `$${annualCloudCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById("compare-cloud-cost").textContent = `$${monthlyCloudCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  // If user adjusts slider manually, deselect preset dropdown to "custom"
  const selectPreset = document.getElementById("select-campus-scale");
  let isPreset = false;
  for (const [key, preset] of Object.entries(scalePresets)) {
    if (preset.tokens === tokens && preset.rate === rate) {
      selectPreset.value = key;
      isPreset = true;
      break;
    }
  }
  if (!isPreset) {
    selectPreset.value = "custom";
  }
}

// --- Interactive Architecture Map Details DB ---
const architectureDb = {
  aiprox1: {
    badge: "Hardware Hypervisor Node",
    title: "AIProx1 (Primary Host)",
    subtitle: "Management Gateway & Inference Anchor",
    specs: [
      { label: "Proxmox Version", value: "VE 9.1-5" },
      { label: "IP Address", value: "10.30.0.11 (VLAN 30)" },
      { label: "CPU Allocation", value: "Intel i9-12900K (12 Cores / 24 Threads)" },
      { label: "System Memory", value: "64 GB DDR5" },
      { label: "PCI Device Mapped", value: "NVIDIA RTX 4070 (IOMMU Passthrough)" },
      { label: "Local NVMe Volume", value: "2 TB SSD (/data/hf-cache local)" }
    ],
    callout: "<strong>AIProx1</strong> serves as the control master. It runs the primary Ray node tracker and hosts VM 100, executing the foundational layer calculations of model pipelines."
  },
  aiprox2: {
    badge: "Hardware Hypervisor Node",
    title: "AIProx2 (Worker Node)",
    subtitle: "Pipeline Model Worker",
    specs: [
      { label: "Proxmox Version", value: "VE 9.1-5" },
      { label: "IP Address", value: "10.30.0.12 (VLAN 30)" },
      { label: "CPU Allocation", value: "Intel i7-12700K (12 Cores / 20 Threads)" },
      { label: "System Memory", value: "32 GB DDR5" },
      { label: "PCI Device Mapped", value: "NVIDIA RTX 4070 (IOMMU Passthrough)" }
    ],
    callout: "<strong>AIProx2</strong> represents physical node 2. By configuring raw IOMMU passthrough, the guest VM directly leverages the CUDA tensor cores of the RTX 4070 with zero virtualization lag."
  },
  aiprox3: {
    badge: "Hardware Hypervisor Node",
    title: "AIProx3 (Worker Node)",
    subtitle: "Pipeline Model Worker / Final Stage Host",
    specs: [
      { label: "Proxmox Version", value: "VE 9.1-5" },
      { label: "IP Address", value: "10.30.0.13 (VLAN 30)" },
      { label: "CPU Allocation", value: "Intel i7-12700K (12 Cores / 20 Threads)" },
      { label: "System Memory", value: "32 GB DDR5" },
      { label: "PCI Device Mapped", value: "NVIDIA RTX 4070 (IOMMU Passthrough)" }
    ],
    callout: "<strong>AIProx3</strong> is the third node. It performs final layer computations and processes the model's vocabulary logit outputs (LM Head) before serving them to the local gateway."
  },
  vm100: {
    badge: "Ubuntu VM Guest",
    title: "Stage 0: VM 100",
    subtitle: "Pipeline Stage 0 (Model Input & Bottom Layers)",
    specs: [
      { label: "Guest OS", value: "Ubuntu 24.04 LTS" },
      { label: "Private Cluster IP", value: "192.168.100.1 (eth1 Pinned)" },
      { label: "GPU Context", value: "RTX 4070 (12 GB Dedicated)" },
      { label: "Model Layer Tasks", value: "Embeddings + Transformer Layers 0-10" },
      { label: "Ray Orchestrator Role", value: "Ray Head Node Host" },
      { label: "vLLM Port", value: "8001 (Port Forwarded to 10.30.0.21)" }
    ],
    callout: "<strong>VM 100</strong> hosts the cluster's API endpoint. It manages prompt inputs, generates input token embeddings, and coordinates pipeline-parallel steps using Ray."
  },
  vm200: {
    badge: "Ubuntu VM Guest",
    title: "Stage 1: VM 200",
    subtitle: "Pipeline Stage 1 (Model Middle Layers)",
    specs: [
      { label: "Guest OS", value: "Ubuntu 24.04 LTS" },
      { label: "Private Cluster IP", value: "192.168.100.2 (eth1 Pinned)" },
      { label: "GPU Context", value: "RTX 4070 (12 GB Dedicated)" },
      { label: "Model Layer Tasks", value: "Transformer Layers 11-21" },
      { label: "Inter-node Transport", value: "Gloo Pinned to eth1" }
    ],
    callout: "<strong>VM 200</strong> executes intermediate layers of the model pipeline, receiving incoming tensors from VM 100 and outputting processed layers to VM 300 with sub-millisecond latencies."
  },
  vm300: {
    badge: "Ubuntu VM Guest",
    title: "Stage 2: VM 300",
    subtitle: "Pipeline Stage 2 (Model Top Layers & Logits output)",
    specs: [
      { label: "Guest OS", value: "Ubuntu 24.04 LTS" },
      { label: "Private Cluster IP", value: "192.168.100.3 (eth1 Pinned)" },
      { label: "GPU Context", value: "RTX 4070 (12 GB Dedicated)" },
      { label: "Model Layer Tasks", value: "Transformer Layers 22-31 + LM Head" },
      { label: "Output Direct Routing", value: "Returns logits directly to VM 100 API" }
    ],
    callout: "<strong>VM 300</strong> processes the final layers of the transformer stack. Once logits are calculated, they are returned to the Ray gateway on VM 100 for stream rendering."
  }
};

function selectArchItem(itemId) {
  // Remove active styling from all interactive SVG tags
  document.querySelectorAll(".svg-interactive").forEach(elem => {
    elem.classList.remove("active");
  });
  
  // Highlight clicked SVG element
  let svgId = "";
  if (itemId.startsWith("aiprox")) {
    const num = itemId.replace("aiprox", "");
    svgId = `svg-node-${num}`;
  } else if (itemId.startsWith("vm")) {
    const num = itemId.replace("vm", "") === "100" ? "1" : (itemId.replace("vm", "") === "200" ? "2" : "3");
    svgId = `svg-vm-${num}`;
  }
  
  const targetSvg = document.getElementById(svgId);
  if (targetSvg) {
    targetSvg.classList.add("active");
  }
  
  // Retrieve configuration details
  const itemData = architectureDb[itemId];
  if (!itemData) return;
  
  // Update detail pane content
  document.getElementById("active-item-badge").textContent = itemData.badge;
  document.getElementById("arch-detail-title").textContent = itemData.title;
  document.getElementById("arch-detail-subtitle").textContent = itemData.subtitle;
  
  // Show spec table
  document.getElementById("arch-specs-default").style.display = "none";
  const customSpecsContainer = document.getElementById("arch-specs-custom");
  customSpecsContainer.style.display = "flex";
  
  let html = "";
  itemData.specs.forEach(spec => {
    let specClass = "";
    if (spec.value.includes("RTX 4070")) specClass = "cyan";
    if (spec.value.includes("VLAN 30") || spec.value.includes("10.30")) specClass = "cyan";
    if (spec.value.includes("192.168")) specClass = "emerald";
    
    html += `
      <div class="spec-row">
        <span class="spec-label">${spec.label}</span>
        <span class="spec-val ${specClass}">${spec.value}</span>
      </div>
    `;
  });
  
  html += `<div class="architecture-callout" style="margin-top:1rem;">${itemData.callout}</div>`;
  customSpecsContainer.innerHTML = html;
  
  // Update footer callout
  document.getElementById("pane-bottom-callout").innerHTML = `Selected component: <strong>${itemData.title}</strong>. Click another element to compare.`;
}

// --- Engineering Ingenuity Code Tabs ---
function switchCodeTab(btnElement, tabId) {
  // Toggle button header classes
  const container = btnElement.closest('.code-tab-container');
  container.querySelectorAll('.code-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  btnElement.classList.add('active');
  
  // Show specific code segment
  container.querySelectorAll('.code-pre').forEach(pre => {
    pre.style.display = 'none';
  });
  
  if (tabId === 'vllm') {
    document.getElementById('code-content-vllm').style.display = 'block';
  } else {
    document.getElementById('code-content-gloo').style.display = 'block';
  }
}

// --- Hardware Upgrade VRAM Chart Tool ---
function updateHardwareChart(type) {
  const btn4070 = document.getElementById("btn-chart-4070");
  const btn4090 = document.getElementById("btn-chart-4090");
  
  const fillVram = document.getElementById("fill-vram-avail");
  const labelVram = document.getElementById("chart-vram-avail");
  
  const fillParam = document.getElementById("fill-param-limit");
  const labelParam = document.getElementById("chart-model-limit");
  
  const limitMarker = document.getElementById("bar-70b-marker");
  const limitLabel = document.getElementById("bar-70b-label");

  if (type === "rtx4070") {
    btn4070.classList.add("active");
    btn4090.classList.remove("active");
    
    // Set VRAM available bar (RTX 4070 is 36.00 GB vs 70B limit of 36.17 GB)
    // 36.00 GB will be represented as 50% width
    fillVram.style.width = "50%";
    fillVram.style.backgroundColor = "var(--color-primary)";
    labelVram.textContent = "36.00 GB (3x RTX 4070)";
    
    // Set param limit bar (Qwen 32B is fine, 70B is unsupported)
    fillParam.style.width = "45%";
    fillParam.style.backgroundColor = "var(--color-warning)";
    labelParam.textContent = "Up to 32B Models (Qwen 2.5)";
    
    // Position limit marker at 50.2% (170 MB above the 36.00 GB bar)
    limitMarker.style.left = "50.24%";
    limitLabel.style.left = "50.24%";
    limitLabel.textContent = "70B Limit (36.17 GB) - Deficit: 170 MB";
    
  } else {
    btn4070.classList.remove("active");
    btn4090.classList.add("active");
    
    // Proposed cluster provides 72.00 GB total VRAM
    // 72.00 GB will be represented as 100% width
    fillVram.style.width = "100%";
    fillVram.style.backgroundColor = "var(--color-success)";
    labelVram.textContent = "72.00 GB (3x Radeon AI PRO R9700 / RTX 4090)";
    
    // Set param limit bar
    fillParam.style.width = "90%";
    fillParam.style.backgroundColor = "var(--color-success)";
    labelParam.textContent = "Up to 70B parameter models (e.g. Llama 3.1 70B)";
    
    // Keep marker at same scale location (50.24% of the new 72GB total scale)
    limitMarker.style.left = "50.24%";
    limitLabel.style.left = "50.24%";
    limitLabel.textContent = "70B Limit (36.17 GB) - Surplus: 35.83 GB";
  }
}
