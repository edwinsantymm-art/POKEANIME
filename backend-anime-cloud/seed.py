from pathlib import Path

from database import conectar, inicializar_base_datos


def sembrar():
    inicializar_base_datos()
    seed = Path(__file__).parent / "sql" / "seed.sql"
    with conectar() as conexion:
        conexion.execute(seed.read_text(encoding="utf-8"))
    print("Personajes de Jujutsu Kaisen agregados a Neon cuando no existían.")


if __name__ == "__main__":
    sembrar()
