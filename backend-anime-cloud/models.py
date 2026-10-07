from pydantic import BaseModel, Field


class Personaje(BaseModel):
    nombre: str = Field(..., examples=["Yuji Itadori"])
    anime: str = Field(default="Jujutsu Kaisen", examples=["Jujutsu Kaisen"])
    imagen: str | None = Field(default=None, examples=["https://example.com/personaje.png"])
    altura: str | None = Field(default=None, examples=["173 cm"])
    anio: str | None = Field(default=None, examples=["2018"])
    edad: str | None = Field(default=None, examples=["15"])
    grado: str | None = Field(default=None, examples=["Grado Especial"])
    familiares: list[str] = Field(default_factory=list)
    habilidades: list[str] = Field(default_factory=list)


class PersonajeRespuesta(Personaje):
    id: int
