# app.py

from flask import Flask, jsonify
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os
from flask_cors import CORS # Importa a extensão CORS
from functools import wraps # Importa wraps para o decorador

# Importa as configurações do git  novo arquivo config.py
from config import Config

# Carrega as variáveis de ambiente do .env
load_dotenv()

app = Flask(__name__)
CORS(app) # Habilita CORS para todas as rotas e origens (para desenvolvimento)

# Inicializa o Bcrypt e o anexa ao objeto 'app'
# Isso o torna acessível em outros módulos via current_app.bcrypt
bcrypt = Bcrypt(app)
app.bcrypt = bcrypt # LINHA CRUCIAL PARA RESOLVER O AttributeError

# Configura o Flask com as chaves do Config
app.config['SECRET_KEY'] = Config.SECRET_KEY

# --- Rotas de Teste Simples (podem permanecer aqui ou serem movidas, para simplicidade deixamos) ---
@app.route('/')
def hello_world():
    return 'Olá, mundo! O backend do seu catálogo de livros está funcionando!'

@app.route('/testar-db')
def test_db_connection():
    # Importa a função de conexão do seu novo utils/db_utils.py
    from utils.db_utils import get_db_connection
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({"status": "sucesso", "mensagem": "Conexão com o banco de dados MySQL bem-sucedida!"})
    else:
        return jsonify({"status": "erro", "mensagem": "Falha ao conectar ao banco de dados MySQL. Verifique as credenciais e se o MySQL está rodando."}), 500

# --- Registro de Blueprints (Os conjuntos de rotas que você criou em routes/) ---
# Importa os blueprints das rotas
from routes.auth_routes import auth_bp
from routes.livro_routes import livro_bp
from routes.categoria_routes import categoria_bp
from routes.estante_routes import estante_bp # NOVO: Importa blueprint de estantes
from routes.prateleira_routes import prateleira_bp # NOVO: Importa blueprint de prateleiras

# Registra os blueprints no aplicativo Flask
app.register_blueprint(auth_bp)
app.register_blueprint(livro_bp)
app.register_blueprint(categoria_bp)
app.register_blueprint(estante_bp) # NOVO: Registra blueprint de estantes
app.register_blueprint(prateleira_bp) # NOVO: Registra blueprint de prateleiras


# --- Execução do Aplicativo ---
if __name__ == '__main__':
    # Apenas para depuração. NÃO USE em produção.
    # use_reloader=False é mantido para evitar o erro de rota duplicada
    app.run(debug=True, port=5000, use_reloader=False)