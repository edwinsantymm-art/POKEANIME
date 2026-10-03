from typing import List, Optional
from pydantic import BaseModel, Field


class Personaje(BaseModel):
    nombre: str = Field(..., example="Yuji Itadori")
    anime: str = Field(..., example="Jujutsu Kaisen")
    imagen: Optional[str] = Field(None, example="https://ejemplo.com/yuji.png")
    altura: Optional[str] = Field(None, example="173 cm")
    anio: Optional[str] = Field(None, example="2018")
    edad: Optional[str] = Field(None, example="15")
    grado: Optional[str] = Field(None, example="Grado Especial (vasija)")
    habilidades: List[str] = Field(default_factory=list, example=["Fuerza sobrehumana", "Divergent Fist"])


class PersonajeRespuesta(Personaje):
    id: str = Field(..., example="652f1b2c8e4a9d0012a34b56")
