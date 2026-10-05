from pathlib import Path

from flycns.compiled import read_compiled
from flycns.dynamics import Drive, LIFReference, synaptic_weights

graph = read_compiled(Path("compiled/malecns-v1.0"))
weights = synaptic_weights(graph["csr_indptr"], graph["csr_indices"], graph["csr_count"], graph["neuron_sign"], 0.275)
engine = LIFReference(graph["csr_indptr"], graph["csr_indices"], weights)      # or LIFTorch on a GPU
run = engine.run(10_000, Drive(activate={1234: 150.0}), seed=0)                   # one second of model time
print(run.spike_counts().sum(), "spikes")