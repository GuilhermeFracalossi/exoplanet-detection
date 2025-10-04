from pydantic import BaseModel

class ExoplanetFeatures(BaseModel):
    orbital_period: float
    transit_duration: float
    planet_radius: float
    star_radius: float
    star_temp: float
