import os
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

db_url = URL.create(
    drivername="mysql+pymysql",
    username=os.getenv("DB_USER", "root").strip(),
    password=os.getenv("DB_PASSWORD", "").strip(),
    host=os.getenv("DB_HOST", "localhost").strip(),
    port=int(os.getenv("DB_PORT", 4000)),
    database=os.getenv("DB_NAME", "db_egov").strip(),
    query={
        "ssl_verify_cert": "true",
        "ssl_verify_identity": "true"
    }
)

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    connect_args={
        "ssl": {
            "ssl_verify_cert": True,
            "ssl_verify_identity": True
        }
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()