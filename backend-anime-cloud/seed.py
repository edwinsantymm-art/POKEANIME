"""
Siembra 10 personajes de Jujutsu Kaisen en la base de datos propia (MongoDB).

Uso:
    python seed.py

Los datos son fijos (no se consultan en vivo desde ninguna API externa):
esta es TU base de datos propia, con tu propia copia de la información.
"""

from database import coleccion_personajes

PERSONAJES = [
    {
        "nombre": "Yuji Itadori",
        "anime": "Jujutsu Kaisen",
        "imagen": "https://upload.wikimedia.org/wikipedia/en/d/d7/Yuuji_Itadori.png",
        "altura": "173 cm",
        "anio": "2018",
        "edad": "15",
        "grado": "Grado Especial (como vasija de Sukuna)",
        "habilidades": ["Fuerza sobrehumana", "Divergent Fist", "Black Flash"],
    },
    {
        "nombre": "Megumi Fushiguro",
        "anime": "Jujutsu Kaisen",
        "imagen": "https://upload.wikimedia.org/wikipedia/en/a/a2/Megumi_Fushiguro.png",
        "altura": "170 cm",
        "anio": "2018",
        "edad": "15",
        "grado": "Grado 2 (asciende a Grado 1)",
        "habilidades": ["Invocación de Sombras", "Divine Dog", "Nue"],
    },
    {
        "nombre": "Nobara Kugisaki",
        "anime": "Jujutsu Kaisen",
        "imagen": "https://upload.wikimedia.org/wikipedia/en/4/44/Nobara_Kugisaki.png",
        "altura": "159 cm",
        "anio": "2018",
        "edad": "16",
        "grado": "Grado 1",
        "habilidades": ["Straw Doll Technique", "Resonance", "Hairpin"],
    },
    {
        "nombre": "Satoru Gojo",
        "anime": "Jujutsu Kaisen",
        "imagen": "https://upload.wikimedia.org/wikipedia/en/5/59/Gojo_Satoru.png",
        "altura": "190 cm",
        "anio": "2018",
        "edad": "28",
        "grado": "Grado Especial",
        "habilidades": ["Six Eyes", "Limitless", "Infinity", "Hollow Purple"],
    },
    {
        "nombre": "Ryomen Sukuna",
        "anime": "Jujutsu Kaisen",
        "imagen": "https://upload.wikimedia.org/wikipedia/en/3/3a/Ryomen_Sukuna.png",
        "altura": "173 cm",
        "anio": "2018",
        "edad": "Desconocida (+1000 años)",
        "grado": "Grado Especial",
        "habilidades": ["Dismantle", "Cleave", "Fuga de Fuego", "Malevolent Shrine"],
    },
    {
        "nombre": "Kento Nanami",
        "anime": "Jujutsu Kaisen",
        "imagen": "https://upload.wikimedia.org/wikipedia/en/8/85/Kento_Nanami.png",
        "altura": "188 cm",
        "anio": "2018",
        "edad": "28",
        "grado": "Grado 1",
        "habilidades": ["Ratio Technique", "Overtime"],
    },
    {
        "nombre": "Maki Zenin",
        "anime": "Jujutsu Kaisen",
        "imagen": "https://upload.wikimedia.org/wikipedia/en/2/2a/Maki_Zenin.png",
        "altura": "168 cm",
        "anio": "2018",
        "edad": "17",
        "grado": "Grado 1",
        "habilidades": ["Maestría en armas", "Resistencia sobrehumana"],
    },
    {
        "nombre": "Aoi Todo",
        "anime": "Jujutsu Kaisen",
        "imagen": "https://upload.wikimedia.org/wikipedia/en/6/6b/Aoi_Todo.png",
        "altura": "191 cm",
        "anio": "2018",
        "edad": "19",
        "grado": "Grado 1",
        "habilidades": ["Boogie Woogie"],
    },
    {
        "nombre": "Toge Inumaki",
        "anime": "Jujutsu Kaisen",
        "imagen": "https://upload.wikimedia.org/wikipedia/en/0/0b/Toge_Inumaki.png",
        "altura": "170 cm",
        "anio": "2018",
        "edad": "16",
        "grado": "Semi-Grado 1",
        "habilidades": ["Cursed Speech"],
    },
    {
        "nombre": "Panda",
        "anime": "Jujutsu Kaisen",
        "imagen": "https://upload.wikimedia.org/wikipedia/en/9/9e/Panda_%28Jujutsu_Kaisen%29.png",
        "altura": "227 cm",
        "anio": "2018",
        "edad": "Desconocida",
        "grado": "Grado 2",
        "habilidades": ["Cambio de núcleos (Gorila/Panda/Hermano menor)"],
    },
]


def sembrar():
    insertados = 0
    for personaje in PERSONAJES:
        existe = coleccion_personajes.find_one({"nombre": personaje["nombre"]})
        if existe:
            print(f"Ya existe: {personaje['nombre']} (se omite)")
            continue
        coleccion_personajes.insert_one(personaje)
        insertados += 1
        print(f"Insertado: {personaje['nombre']}")

    print(f"\nListo. {insertados} personajes nuevos insertados.")


if __name__ == "__main__":
    sembrar()
