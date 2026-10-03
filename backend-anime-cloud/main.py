from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, HTTPException

from database import coleccion_personajes
from models import Personaje, PersonajeRespuesta

app = FastAPI(
    title="API de Personajes de Anime (microservicio propio)",
    description=(
        "Microservicio en Python/FastAPI que consume una base de datos MongoDB "
        "propia con personajes de anime."
    ),
    version="1.0.0",
)


def serializar(documento: dict) -> dict:
    documento = dict(documento)
    documento["id"] = str(documento["_id"])
    documento.pop("_id", None)
    return documento


@app.get("/", tags=["Estado"])
def raiz():
    """Mensaje de bienvenida. La documentación interactiva está en /docs."""
    return {"mensaje": "Microservicio de personajes de anime activo. Documentación en /docs"}


@app.get("/health", tags=["Estado"])
def salud():
    """Usado por el render.yaml para saber si el servicio está vivo."""
    return {"status": "ok"}


@app.get("/api/personajes", response_model=list[PersonajeRespuesta], tags=["Personajes"])
def listar_personajes():
    """Lista todos los personajes de anime almacenados en la base de datos propia."""
    personajes = [serializar(p) for p in coleccion_personajes.find()]
    return personajes


@app.get("/api/personajes/{personaje_id}", response_model=PersonajeRespuesta, tags=["Personajes"])
def obtener_personaje(personaje_id: str):
    """Obtiene un personaje por su id de MongoDB."""
    try:
        oid = ObjectId(personaje_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Id inválido")

    personaje = coleccion_personajes.find_one({"_id": oid})
    if not personaje:
        raise HTTPException(status_code=404, detail="Personaje no encontrado")
    return serializar(personaje)


@app.post("/api/personajes", response_model=PersonajeRespuesta, status_code=201, tags=["Personajes"])
def crear_personaje(personaje: Personaje):
    """Crea un nuevo personaje de anime."""
    resultado = coleccion_personajes.insert_one(personaje.model_dump())
    nuevo = coleccion_personajes.find_one({"_id": resultado.inserted_id})
    return serializar(nuevo)


@app.put("/api/personajes/{personaje_id}", response_model=PersonajeRespuesta, tags=["Personajes"])
def actualizar_personaje(personaje_id: str, personaje: Personaje):
    """Actualiza un personaje existente."""
    try:
        oid = ObjectId(personaje_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Id inválido")

    resultado = coleccion_personajes.update_one({"_id": oid}, {"$set": personaje.model_dump()})
    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Personaje no encontrado")

    actualizado = coleccion_personajes.find_one({"_id": oid})
    return serializar(actualizado)


@app.delete("/api/personajes/{personaje_id}", tags=["Personajes"])
def eliminar_personaje(personaje_id: str):
    """Elimina un personaje."""
    try:
        oid = ObjectId(personaje_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Id inválido")

    resultado = coleccion_personajes.delete_one({"_id": oid})
    if resultado.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Personaje no encontrado")

    return {"mensaje": "Personaje eliminado"}
