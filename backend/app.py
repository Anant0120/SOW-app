import os
from datetime import timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import Column, Integer, String, create_engine, select, func
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False))
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "secret")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=4)

    CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")}}, supports_credentials=True)

    JWTManager(app)

    

    

    @app.post("/api/auth/login")
    def login():
        data = request.get_json(silent=True) or {}
        email = data.get("email", "").strip()
        password = data.get("password", "")
        
        if not email or not password:
            return jsonify({"message": "Email and password required"}), 400
        
        db = SessionLocal()
        try:
            user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
            if not user or user.password != password:
                return jsonify({"message": "Invalid credentials"}), 401
            
            token = create_access_token(identity={"id": user.id, "email": user.email})
            return jsonify({
                "access_token": token,
                "user": {"id": user.id, "email": user.email}
            })
        finally:
            db.close()

    @app.get("/api/auth/user")
    @jwt_required()
    def get_current_user():
        identity = get_jwt_identity()
        return jsonify({"user": identity})

    return app

app = create_app()

if __name__ == "__main__":
    
    app.run(host="0.0.0.0", port=5000, debug=True)
