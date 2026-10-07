from contextlib import asynccontextmanager
import json

import psycopg
from fastapi import FastAPI, HTTPException, Query
from psycopg import sql

from database import conectar
from models import PersonajeRespuesta

TABLA = "personajes_anime"
COLUMNAS: set[str] = set()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global COLUMNAS
    try:
        with conectar() as conexion:
            filas = conexion.execute(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = %s
                """,
                (TABLA,),
            ).fetchall()
        COLUMNAS = {fila["column_name"].lower() for fila in filas}
        if not COLUMNAS:
            raise RuntimeError(f"No existe public.{TABLA} en la base configurada.")
        if not any(nombre in COLUMNAS for nombre in ("nombre", "name", "character_name", "personaje")):
            raise RuntimeError(f"public.{TABLA} no tiene una columna de nombre reconocida.")
    except psycopg.Error as error:
        raise RuntimeError("No se pudo conectar a Neon o inspeccionar public.personajes_anime.") from error
    yield


app = FastAPI(
    title="Microservicio de Personajes Jujutsu Kaisen",
    description="Búsqueda de personajes en la tabla existente public.personajes_anime de Neon.",
    version="2.1.0",
    lifespan=lifespan,
)


def elegir_columna(*candidatas: str) -> str | None:
    return next((nombre for nombre in candidatas if nombre in COLUMNAS), None)


def obtener_valor(fila: dict, *candidatas: str, defecto=None):
    for nombre in candidatas:
        if nombre in fila and fila[nombre] is not None:
            return fila[nombre]
    return defecto


def como_lista(valor) -> list[str]:
    if valor is None:
        return []
    if isinstance(valor, list):
        return [str(item) for item in valor if item is not None]
    if isinstance(valor, str):
        if valor.lstrip().startswith("["):
            try:
                lista = json.loads(valor)
                if isinstance(lista, list):
                    return [str(item) for item in lista if item is not None]
            except json.JSONDecodeError:
                pass
        return [item.strip() for item in valor.split(",") if item.strip()]
    return [str(valor)]


def serializar(fila: dict) -> dict:
    valores = {nombre.lower(): valor for nombre, valor in fila.items()}
    return {
        "id": obtener_valor(valores, "id", "personaje_id", defecto=0),
        "nombre": obtener_valor(
            valores, "nombre", "name", "character_name", "personaje", defecto="Desconocido"
        ),
        "anime": obtener_valor(valores, "anime", "serie", defecto="Jujutsu Kaisen"),
        "imagen": obtener_valor(valores, "imagen", "image", "image_url", "foto"),
        "altura": obtener_valor(valores, "altura", "height", defecto="N/D"),
        "anio": obtener_valor(valores, "anio", "año", "year", "debut", defecto="N/D"),
        "edad": obtener_valor(valores, "edad", "age", defecto="N/D"),
        "grado": obtener_valor(valores, "grado", "grade", "rank", defecto="N/D"),
        "familiares": como_lista(obtener_valor(valores, "familiares", "family", "relatives")),
        "habilidades": como_lista(
            obtener_valor(valores, "habilidades", "abilities", "techniques", "powers")
        ),
    }


@app.get("/", tags=["Estado"])
def raiz():
    return {"mensaje": "Microservicio Jujutsu Kaisen activo.", "documentacion": "/docs"}


@app.get("/health", tags=["Estado"])
def salud():
    try:
        with conectar() as conexion:
            conexion.execute(sql.SQL("SELECT 1 FROM {}.{} LIMIT 1").format(
                sql.Identifier("public"), sql.Identifier(TABLA)
            ))
        return {"status": "ok", "database": "connected", "table": f"public.{TABLA}"}
    except psycopg.Error as error:
        print(f"Health check de PostgreSQL fallido: {error}")
        raise HTTPException(status_code=503, detail="Neon no está disponible o falta public.personajes_anime.") from error


@app.get(
    "/api/personajes",
    response_model=list[PersonajeRespuesta],
    tags=["Personajes"],
    summary="Lista los personajes de la tabla existente en Neon",
)
def listar_personajes():
    id_columna = elegir_columna("id", "personaje_id")
    orden = sql.SQL(" ORDER BY {}").format(sql.Identifier(id_columna)) if id_columna else sql.SQL("")
    with conectar() as conexion:
        filas = conexion.execute(
            sql.SQL("SELECT * FROM {}.{}").format(
                sql.Identifier("public"), sql.Identifier(TABLA)
            ) + orden
        ).fetchall()
    return [serializar(fila) for fila in filas]


@app.get(
    "/api/personajes/buscar",
    response_model=PersonajeRespuesta,
    tags=["Personajes"],
    summary="Busca un personaje por nombre o ID en Neon",
)
def buscar_personaje(consulta: str = Query(min_length=1, max_length=100)):
    valor = consulta.strip()
    if not valor:
        raise HTTPException(status_code=400, detail="Escribe el nombre o ID del personaje.")

    nombre_columna = elegir_columna("nombre", "name", "character_name", "personaje")
    id_columna = elegir_columna("id", "personaje_id")
    with conectar() as conexion:
        fila = None
        if valor.isdecimal() and id_columna:
            fila = conexion.execute(
                sql.SQL("SELECT * FROM {}.{} WHERE {} = %s LIMIT 1").format(
                    sql.Identifier("public"),
                    sql.Identifier(TABLA),
                    sql.Identifier(id_columna),
                ),
                (int(valor),),
            ).fetchone()
        if fila is None and nombre_columna:
            fila = conexion.execute(
                sql.SQL("SELECT * FROM {}.{} WHERE CAST({} AS TEXT) ILIKE %s LIMIT 1").format(
                    sql.Identifier("public"),
                    sql.Identifier(TABLA),
                    sql.Identifier(nombre_columna),
                ),
                (f"%{valor}%",),
            ).fetchone()

    if not fila:
        raise HTTPException(status_code=404, detail="Personaje no encontrado en public.personajes_anime.")
    return serializar(fila)
