import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Path
from sqlalchemy.orm import Session
import pandas as pd
import io
from openai import OpenAI
from . import models
from .db import SessionLocal, engine

# Buat tabel jika belum ada
db_engine = engine
models.Base.metadata.create_all(bind=db_engine)

# Inisialisasi FastAPI dan OpenAI
app = FastAPI()
client = OpenAI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/upload/")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validasi format file
    filename = file.filename
    if not filename.lower().endswith((".csv", ".xlsx")):
        raise HTTPException(status_code=400, detail="Format file tidak didukung")

    # Baca konten dan simpan ke folder uploads
    content = await file.read()
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    save_path = os.path.join(upload_dir, filename)
    with open(save_path, "wb") as f:
        f.write(content)

    # Load DataFrame
    if filename.lower().endswith(".csv"):
        df = pd.read_csv(io.BytesIO(content))
    else:
        df = pd.read_excel(io.BytesIO(content))
    df = df.drop_duplicates().fillna(0)

    # Simpan metadata file ke database
    record = models.UploadedFile(
        filename=filename,
        rows=df.shape[0],
        cols=df.shape[1]
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "filename": record.filename,
        "rows": record.rows,
        "cols": record.cols
    }

@app.get("/insight/{file_id}")
async def get_insight(
    file_id: int = Path(..., description="ID file yang mau dianalisis"),
    db: Session = Depends(get_db)
):
    # Ambil metadata
    record = db.query(models.UploadedFile).filter(models.UploadedFile.id == file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="File tidak ditemukan")

    file_path = os.path.join("uploads", record.filename)
    try:
        if record.filename.lower().endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal membaca file: {e}")

    # Ambil 10 baris contoh
    sample = df.head(10).to_csv(index=False)
    prompt = (
        f"Data (10 baris pertama):\n{sample}\n"
        "Buat ringkasan insight penting, pola menarik, dan rekomendasi dalam bahasa Indonesia."
    )

    # Panggil OpenAI
    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Anda adalah analis data profesional."},
            {"role": "user", "content": prompt}
        ]
    )
    insight = completion.choices[0].message.content
    return {"insight": insight}
