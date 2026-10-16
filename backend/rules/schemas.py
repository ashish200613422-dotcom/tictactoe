from pydantic import BaseModel,Field

class Move(BaseModel):
    row:int=Field(ge=0,le=2)
    col:int=Field(ge=0,le=2)