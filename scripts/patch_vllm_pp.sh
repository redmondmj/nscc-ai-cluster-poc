#!/bin/bash
cat > /tmp/patch_vllm.py << 'PYEOF'
import glob, os

vllm_base = None
for base in ['/usr/local/lib/python3.12/site-packages', '/usr/local/lib/python3.12/dist-packages']:
    if os.path.exists(os.path.join(base, 'vllm')):
        vllm_base = base
        break

if vllm_base is None:
    print('vllm not found')
else:
    # Patch 1: gpu_model_runner.py PP fix
    f = os.path.join(vllm_base, 'vllm/v1/worker/gpu_model_runner.py')
    if os.path.exists(f):
        with open(f) as fp: code = fp.read()
        old = '                attn_backend = layers[layer_name].get_attn_backend()'
        new = '                if layer_name not in layers: continue\n                attn_backend = layers[layer_name].get_attn_backend()'
        if old in code and 'if layer_name not in layers' not in code:
            code = code.replace(old, new, 1)
            with open(f, 'w') as fp: fp.write(code)
            for pyc in glob.glob(os.path.join(vllm_base, 'vllm/v1/worker/__pycache__/gpu_model_runner*.pyc')):
                os.remove(pyc)
            print('PP patch applied')
        else:
            print('PP patch: already applied or not needed')
    else:
        print('gpu_model_runner.py not found, skipping PP patch')

    # Patch 2: layernorm.py FieldInfo subscript fix
    f2 = os.path.join(vllm_base, 'vllm/model_executor/layers/layernorm.py')
    if os.path.exists(f2):
        with open(f2) as fp: content = fp.read()
        old2 = 'native_add_rms_norm = priority.fused_add_rms_norm[0] == "native" or var_override'
        new2 = 'native_add_rms_norm = (isinstance(priority.fused_add_rms_norm, list) and len(priority.fused_add_rms_norm) > 0 and priority.fused_add_rms_norm[0] == "native") or var_override'
        if old2 in content:
            content = content.replace(old2, new2)
            with open(f2, 'w') as fp: fp.write(content)
            print('layernorm patch applied')
        else:
            print('layernorm patch: already applied or not needed')
    else:
        print('layernorm.py not found')

    # Patch 3: kernel.py - fix FieldInfo in set_priority AND compute_hash
    f3 = os.path.join(vllm_base, 'vllm/config/kernel.py')
    if os.path.exists(f3):
        with open(f3) as fp: content = fp.read()
        changed = False

        # 3a: set_priority fix
        old3a = '                op_priority = getattr(self, field.name)\n                assert op_priority is not None, ('
        new3a = '                op_priority = getattr(self, field.name)\n                if not isinstance(op_priority, list):\n                    op_priority = []\n                assert op_priority is not None, ('
        if old3a in content:
            content = content.replace(old3a, new3a)
            changed = True
            print('kernel.py set_priority patch applied')
        else:
            print('kernel.py set_priority: already applied or not needed')

        # 3b: compute_hash fix - normalize before get_hash_factors
        old3b = '        factors = get_hash_factors(self, set())'
        new3b = '        for _f in fields(self):\n            if not isinstance(getattr(self, _f.name), list):\n                object.__setattr__(self, _f.name, [])\n        factors = get_hash_factors(self, set())'
        if old3b in content and 'object.__setattr__(self, _f.name' not in content:
            content = content.replace(old3b, new3b)
            changed = True
            print('kernel.py compute_hash patch applied')
        else:
            print('kernel.py compute_hash: already applied or not needed')

        if changed:
            with open(f3, 'w') as fp: fp.write(content)
    else:
        print('kernel.py not found')

    # Patch 4: kernel_warmup.py - skip FlashInfer warmup for PP models
    f4 = os.path.join(vllm_base, 'vllm/model_executor/warmup/kernel_warmup.py')
    if os.path.exists(f4):
        with open(f4) as fp: content = fp.read()
        old4 = '    if (\n        not worker.model_runner.is_pooling_model\n        and worker.model_runner.attn_groups\n        # NOTE:'
        new4 = '    if (\n        not worker.model_runner.is_pooling_model\n        and worker.model_runner.attn_groups\n        and worker.vllm_config.parallel_config.pipeline_parallel_size == 1\n        # NOTE:'
        if old4 in content:
            content = content.replace(old4, new4, 1)
            with open(f4, 'w') as fp: fp.write(content)
            for pyc in glob.glob(os.path.join(vllm_base, 'vllm/model_executor/warmup/__pycache__/kernel_warmup*.pyc')):
                os.remove(pyc)
            print('kernel_warmup patch applied')
        elif 'pipeline_parallel_size == 1' in content:
            print('kernel_warmup patch: already applied')
        else:
            print('kernel_warmup patch: pattern not found')
    else:
        print('kernel_warmup.py not found')
PYEOF
python3 /tmp/patch_vllm.py