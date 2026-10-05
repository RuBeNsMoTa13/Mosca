import os
from dotenv import load_dotenv
import matplotlib.pyplot as plt
import navis
import navis.interfaces.neuprint as neu
from neuprint import Client

# Carrega o token do arquivo .env
load_dotenv()
token = os.getenv("token")

# Inicializa a conexão com o neuPrint
client = Client("https://neuprint.janelia.org", dataset="male-cns:v1.0", token=token)

print("Buscando esqueletos dos neurônios...")
skels = neu.fetch_skeletons(neu.NeuronCriteria(type="DNge104"))
print(skels)

# Gera a visualização 2D
print("Gerando visualização...")
fig, ax = navis.plot2d(skels, view=("z", "x"), radius=True)
plt.show()