import os
from pymongo import MongoClient
from pymongo.errors import ConfigurationError
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

cliente = MongoClient(MONGO_URI)

try:
    db = cliente.get_default_database()
    if db is None:
        raise ConfigurationError("sin base de datos por defecto en la URI")
except ConfigurationError:
    db = cliente["anime_db"]

coleccion_personajes = db["personajes"]
