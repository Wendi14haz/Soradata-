# models.py

from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .db import Base

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    rows = Column(Integer)
    cols = Column(Integer)
    
class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, index=True)
    content = Column(String)
