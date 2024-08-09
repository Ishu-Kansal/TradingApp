import psycopg2 as pg
from dotenv import load_dotenv
import os

load_dotenv()


conn = pg.connect(
    database = os.getenv("POSTGRES_DB_PT"),
    user = os.getenv("POSTGRES_USER"),
    host = os.getenv("POSTGRES_HOST"),
    password =  os.getenv("POSTGRES_PASSWORD"),
    port = os.getenv("POSTGRES_PORT")
)