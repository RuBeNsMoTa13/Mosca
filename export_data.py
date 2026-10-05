import os
import json
from pathlib import Path
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from scipy.spatial import ConvexHull
import navis.interfaces.neuprint as neu
from neuprint import Client, fetch_synapses

load_dotenv()
token = os.getenv("token")
client = Client("https://neuprint.janelia.org", dataset="male-cns:v1.0", token=token)

out_dir = Path("frontend/public/data")
out_dir.mkdir(parents=True, exist_ok=True)

# 1. Exportar Hulls do Cérebro
print("Exportando Hulls do Cérebro...")
try:
    from flycns.compiled import read_compiled
    graph = read_compiled(Path("compiled/malecns-v1.0"))
    pos_vox = graph["neuron_position_um"] * 1000.0 / 8.0
    part = graph["neuron_partition"]
    valid = ~np.isnan(pos_vox[:, 0])

    cx, cy, cz = 48242.0, 34000.0, 35000.0
    scale = 1.0 / 12000.0  # Converte nanômetros para escala Three.js (~3 a 5 unidades)

    hulls_data = {}
    regions = [
        ("optic_lobe_left", valid & (part == 0), "#ef4444", "Olho Composto Esquerdo"),
        ("optic_lobe_right", valid & (part == 1), "#ef4444", "Olho Composto Direito"),
        ("central_brain", valid & (part == 2) & (pos_vox[:, 2] < 48000) & (pos_vox[:, 0] >= 22000) & (pos_vox[:, 0] <= 68000), "#38bdf8", "Cérebro Central"),
        ("nerve_cord", valid & (part == 3) & (pos_vox[:, 2] >= 55000), "#34d399", "Cordão Nervoso Ventral")
    ]

    for name, mask, color, label in regions:
        pts = pos_vox[mask][::20]
        if len(pts) >= 4:
            ch = ConvexHull(pts)
            # Centrado na cabeça
            norm_pts = (pts - [cx, cy, cz]) * scale
            # Inverter Y e Z para bater com Three.js (Y para cima, Z para profundidade)
            three_pts = np.column_stack([norm_pts[:, 0], -norm_pts[:, 2], -norm_pts[:, 1]])
            hulls_data[name] = {
                "vertices": three_pts.flatten().round(4).tolist(),
                "indices": ch.simplices.flatten().tolist(),
                "color": color,
                "label": label
            }

    with open(out_dir / "brain_hulls.json", "w") as f:
        json.dump(hulls_data, f)
    print("Hulls exportados com sucesso!")
except Exception as e:
    print("Erro ao exportar hulls:", e)

# 2. Exportar Circuitos Catálogo
CIRCUITOS = [
    {
        "id": "MBON03",
        "nome": "Circuito de Recompensa & Alimento",
        "query": "MBON03",
        "funcao": "Busca por Açúcar & Dopamina",
        "local": "Mushroom Body (Lobos Alfa/Beta)",
        "icone": "🍓",
        "cor": "#ef4444",
        "motor_mode": "walk_food",
        "motor_desc": "Marcha voraz pelo solo em direção à fruta doce, estendendo a probóscide para sugar néctar.",
        "sim_idx": 130138
    },
    {
        "id": "ExR5",
        "nome": "Bússola Biológica 360°",
        "query": "ExR5",
        "funcao": "Navegação Espacial & Rumo",
        "local": "Corpo Elipsoide (Centro da Cabeça)",
        "icone": "🧭",
        "cor": "#38bdf8",
        "motor_mode": "patrol",
        "motor_desc": "Ronda circular no solo guiada pela luz solar polarizada, mantendo rumo memorizado.",
        "sim_idx": 581
    },
    {
        "id": "DNge104",
        "nome": "Reflexo de Fuga Rápida",
        "query": "DNge104",
        "funcao": "Escape Antiesmagamento (<10ms)",
        "local": "Cabeça descendo para as Pernas",
        "icone": "⚡",
        "cor": "#f59e0b",
        "motor_mode": "escape",
        "motor_desc": "Agachamento imediato e salto catapulta de emergência para longe da sombra ameaçadora.",
        "sim_idx": 2600
    },
    {
        "id": "s-LNv",
        "nome": "Marcapasso Circadiano (Sono/Vigília)",
        "query": "s-LNv",
        "funcao": "Ciclo Biológico de 24h & Despertar",
        "local": "Lobos Laterais para o Centro",
        "icone": "⏰",
        "cor": "#a855f7",
        "motor_mode": "walk",
        "motor_desc": "Caminhada exploratória diurna em linha reta sob a luz matinal da arena.",
        "sim_idx": 5366
    },
    {
        "id": "MBON01",
        "nome": "Memória & Aprendizado Olfativo",
        "query": "MBON01",
        "funcao": "Memória de Longo Prazo & Esquiva",
        "local": "Mushroom Body (Hipocampo da Mosca)",
        "icone": "🧠",
        "cor": "#ec4899",
        "motor_mode": "walk",
        "motor_desc": "Desvio rápido de rota ao detectar odor previamente associado a perigo.",
        "sim_idx": 9
    },
    {
        "id": "DNp09",
        "nome": "Freio de Pouso & Parada",
        "query": "DNp09",
        "funcao": "Desaceleração de Voo & Pouso Suave",
        "local": "Nuca descendo para Asas e Patas",
        "icone": "🛑",
        "cor": "#f87171",
        "motor_mode": "landing",
        "motor_desc": "Corte do batimento de asas e extensão das 6 pernas para amortecer o contato no solo.",
        "sim_idx": 725
    }
]

print("Iniciando exportação dos circuitos neurais...")
cx, cy, cz = 48242.0, 34000.0, 35000.0
scale = 1.0 / 12000.0

for circ in CIRCUITOS:
    q = circ["query"]
    print(f"Processando {q}...")
    try:
        # Busca esqueleto
        skels = neu.fetch_skeletons(neu.NeuronCriteria(type=q))
        segments = []
        if skels is not None and len(skels) > 0:
            for skel in skels[:4]: # até 4 espécimes
                nodes_df = skel.nodes
                id_map = {row["node_id"]: (row["x"], row["y"], row["z"]) for _, row in nodes_df.iterrows()}
                for _, row in nodes_df.iterrows():
                    pid = row["parent_id"]
                    if pid != -1 and pid in id_map:
                        p1 = id_map[row["node_id"]]
                        p2 = id_map[pid]
                        # Converte para Three.js coords (X, -Z, -Y) centrado
                        x1 = round((p1[0] - cx) * scale, 4)
                        y1 = round(-(p1[2] - cz) * scale, 4)
                        z1 = round(-(p1[1] - cy) * scale, 4)
                        x2 = round((p2[0] - cx) * scale, 4)
                        y2 = round(-(p2[2] - cz) * scale, 4)
                        z2 = round(-(p2[1] - cy) * scale, 4)
                        segments.extend([x1, y1, z1, x2, y2, z2])

        # Busca sinapses
        syns = fetch_synapses(neu.NeuronCriteria(type=q))
        pre_list, post_list = [], []
        if syns is not None and len(syns) > 0:
            pre_df = syns[syns["type"] == "pre"]
            post_df = syns[syns["type"] == "post"]
            if len(pre_df) > 800:
                pre_df = pre_df.sample(800, random_state=42)
            if len(post_df) > 800:
                post_df = post_df.sample(800, random_state=42)

            for _, row in pre_df.iterrows():
                px = round((row["x"] - cx) * scale, 4)
                py = round(-(row["z"] - cz) * scale, 4)
                pz = round(-(row["y"] - cy) * scale, 4)
                roi = str(row["roi"]) if pd.notna(row["roi"]) else "Geral"
                pre_list.append([px, py, pz, roi])

            for _, row in post_df.iterrows():
                px = round((row["x"] - cx) * scale, 4)
                py = round(-(row["z"] - cz) * scale, 4)
                pz = round(-(row["y"] - cy) * scale, 4)
                roi = str(row["roi"]) if pd.notna(row["roi"]) else "Geral"
                post_list.append([px, py, pz, roi])

        circ_data = {
            **circ,
            "segments": segments,
            "synapses_pre": pre_list,
            "synapses_post": post_list,
            "num_segments": len(segments) // 6,
            "num_pre": len(pre_list),
            "num_post": len(post_list)
        }

        with open(out_dir / f"{circ['id']}.json", "w") as f:
            json.dump(circ_data, f)
        print(f"Salvo {circ['id']}.json: {len(segments)//6} ramos, {len(pre_list)} pré, {len(post_list)} pós.")
    except Exception as err:
        print(f"Erro em {q}:", err)

# Salvar lista de circuitos para o menu
catalog_manifest = [{k: c[k] for k in ["id", "nome", "query", "funcao", "local", "icone", "cor", "motor_mode", "motor_desc"]} for c in CIRCUITOS]
with open(out_dir / "catalog.json", "w") as f:
    json.dump(catalog_manifest, f, indent=2)

print("Exportação concluída com sucesso!")
