import os   
from neuprint import Client
from dotenv import load_dotenv


load_dotenv()

# Pega o token do .env
token = os.getenv("token")



client = Client("https://neuprint.janelia.org", dataset='male-cns:v1.0', token=token)

# Get neuron annotations and neuropil innervation
from neuprint import fetch_neurons
neurons, syndist = fetch_neurons("DNge104")

# Get connectivity
from neuprint import fetch_adjacencies
outgoing_edges, neuron_info = fetch_adjacencies("DNge104")
incoming_edges, neuron_info2 = fetch_adjacencies(None, "DNge104")