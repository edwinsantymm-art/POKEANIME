import os

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("Falta configurar la variable DATABASE_URL.")


def conectar():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)
