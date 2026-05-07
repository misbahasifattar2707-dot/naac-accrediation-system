import os
from flask import Flask
from extensions import db, bcrypt
from models.models import *          # registers all models with SQLAlchemy
from routes.routes import main       # Blueprint with all routes
from routes.api_routes import api_bp # Blueprint for React frontend API
from flask_cors import CORS
from jinja2 import TemplateNotFound
from flask import jsonify, render_template
import mimetypes
import os
from dotenv import load_dotenv
load_dotenv()


# Fix Windows registry MIME type issue for static files
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

    app.config['SECRET_KEY']              = os.getenv('SECRET_KEY')
    app.config['UPLOAD_FOLDER']           = os.getenv('UPLOAD_FOLDER', 'static/uploads')
    
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialise extensions
    db.init_app(app)
    bcrypt.init_app(app)

    # Register blueprint
    app.register_blueprint(main)
    app.register_blueprint(api_bp)

    # Enable CORS
    CORS(app)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        return render_template('index.html')

    @app.errorhandler(404)
    def not_found(e):
        return render_template('index.html')

    @app.errorhandler(TemplateNotFound)
    def handle_template_not_found(e):
        return render_template('index.html')

    return app


app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
