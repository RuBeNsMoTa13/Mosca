from pathlib import Path
from flycns.release import compile_malecns_v1
from flycns.compiled import read_compiled

compile_malecns_v1(Path("malecns-tables"), Path("compiled/malecns-v1.0"), progress=print)
graph = read_compiled(Path("compiled/malecns-v1.0"))      # every array verified against its SHA-256
print(graph.n_neurons, graph.n_edges, graph.counts["columns"])