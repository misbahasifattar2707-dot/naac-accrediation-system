class Config:
    SECRET_KEY = "naac-secret-key"

    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:root@127.0.0.1:5432/naac_db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False