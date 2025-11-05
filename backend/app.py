import os
from datetime import timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import Column, Integer, String, Text, create_engine, select, func
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


class Translation(Base):
    __tablename__ = "text_content"
    id = Column(Integer, primary_key=True)
    key = Column(String(255), nullable=False)
    lang = Column(String(10), nullable=False)
    value = Column(Text, nullable=False)
    page = Column(String(50), nullable=False)


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    article_no = Column(String(255))
    product_service = Column(String(255), nullable=False)
    in_price = Column(Integer)
    price = Column(Integer)
    unit = Column(String(50))
    in_stock = Column(Integer)
    description = Column(Text)


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

    @app.get("/api/texts")
    def get_texts():
        page = request.args.get("page", "").strip()
        lang = request.args.get("lang", "en").strip().lower()
        if not page:
            return jsonify({"message": "Missing page"}), 400
        db = SessionLocal()
        try:
            rows = db.execute(
                select(Translation).where(Translation.page == page, Translation.lang == lang)
            ).scalars().all()
            content = {row.key: row.value for row in rows}
            return jsonify({"page": page, "lang": lang, "content": content})
        finally:
            db.close()

    @app.get("/api/terms")
    def get_terms():
        lang = request.args.get("lang", "en").strip().lower()
        db = SessionLocal()
        try:
            result = db.execute(
                select(Translation).where(
                    Translation.page == "terms",
                    Translation.lang == lang,
                    Translation.key == "terms_content"
                )
            ).scalar_one_or_none()
            if result:
                return jsonify({"text": result.value})
            return jsonify({"text": ""})
        finally:
            db.close()

    @app.get("/api/products")
    @jwt_required()
    def list_products():
        page = max(int(request.args.get("page", 1)), 1)
        page_size = min(max(int(request.args.get("page_size", 20)), 1), 100)
        q_name = (request.args.get("product") or "").strip()
        q_article = (request.args.get("article") or "").strip()
        db = SessionLocal()
        try:
            stmt = select(Product)
            count_stmt = select(func.count(Product.id))
            
            if q_name:
                like = f"%{q_name}%"
                stmt = stmt.where(Product.product_service.ilike(like))
                count_stmt = count_stmt.where(Product.product_service.ilike(like))
            if q_article:
                like_a = f"%{q_article}%"
                stmt = stmt.where(Product.article_no.ilike(like_a))
                count_stmt = count_stmt.where(Product.article_no.ilike(like_a))

            total = db.execute(count_stmt).scalar() or 0
            items = db.execute(
                stmt.order_by(Product.id.asc())
                .offset((page - 1) * page_size)
                .limit(page_size)
            ).scalars().all()

            

            def serialize(p: Product):
                return {
                    "id": p.id,
                    "article_no": p.article_no or "",
                    "product_service": p.product_service or "",
                    "in_price": str(p.in_price) if p.in_price is not None else None,
                    "price": str(p.price) if p.price is not None else None,
                    "unit": p.unit or "",
                    "in_stock": str(p.in_stock) if p.in_stock is not None else None,
                    "description": p.description or ""
                }

            return jsonify({
                "page": page,
                "page_size": page_size,
                "total": total,
                "items": [serialize(p) for p in items]
            })
        finally:
            db.close()

    @app.patch("/api/products/<int:product_id>")
    @jwt_required()
    def update_product(product_id: int):
        allowed_fields = {"article_no", "product_service", "in_price", "price", "unit", "in_stock", "description"}
        data = request.get_json(silent=True) or {}
        updates = {k: v for k, v in data.items() if k in allowed_fields}
        if not updates:
            return jsonify({"message": "No valid fields to update"}), 400

        db = SessionLocal()
        try:
            product: Product | None = db.get(Product, product_id)
            if not product:
                return jsonify({"message": "Product not found"}), 404

            for field, value in updates.items():
                if isinstance(value, str) and value.strip() == "":
                    value = None
                setattr(product, field, value)
            db.commit()

            return jsonify({"message": "Updated"})
        finally:
            db.close()

    return app

app = create_app()

if __name__ == "__main__":
    
    app.run(host="0.0.0.0", port=5000, debug=True)
