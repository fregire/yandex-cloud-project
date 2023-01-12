from typing import List
from pydantic import BaseModel



class Ad(BaseModel):
    ad_id: str
    images: List[str]
    text: str
    title: str



class AddAd(BaseModel):
    images: List[str]
    text: str
    title: str
