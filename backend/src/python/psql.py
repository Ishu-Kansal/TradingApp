import psycopg2 as pg
from dotenv import load_dotenv
import os
from sqlalchemy import create_engine, text

load_dotenv()


conn = pg.connect(
    database = os.getenv("POSTGRES_DB_PT"),
    user = os.getenv("POSTGRES_USER"),
    host = os.getenv("POSTGRES_HOST"),
    password =  os.getenv("POSTGRES_PASSWORD"),
    port = os.getenv("POSTGRES_PORT")
)

engine = create_engine(f'postgresql://{os.getenv("POSTGRES_USER")}:{os.getenv("POSTGRES_PASSWORD")}@{os.getenv("POSTGRES_HOST")}:{os.getenv("POSTGRES_PORT")}/{os.getenv("POSTGRES_DB_PT")}')