from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Configuração do banco de dados
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/fitness_ai")

# Criar engine do SQLAlchemy
engine = create_engine(DATABASE_URL)

# Criar factory de sessões
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()

# Função para obter sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Função para criar todas as tabelas
def create_tables():
    from app.models.user import Base as UserBase
    from app.models.workout import Base as WorkoutBase
    from app.models.recommendation import Base as RecommendationBase
    
    UserBase.metadata.create_all(bind=engine)
    WorkoutBase.metadata.create_all(bind=engine)
    RecommendationBase.metadata.create_all(bind=engine)

# Função para resetar banco (apenas para desenvolvimento)
def reset_database():
    from app.models.user import Base as UserBase
    from app.models.workout import Base as WorkoutBase
    from app.models.recommendation import Base as RecommendationBase
    
    UserBase.metadata.drop_all(bind=engine)
    WorkoutBase.metadata.drop_all(bind=engine)
    RecommendationBase.metadata.drop_all(bind=engine)
    
    create_tables()