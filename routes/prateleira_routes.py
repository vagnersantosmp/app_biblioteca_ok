# routes/prateleira_routes.py
from flask import Blueprint, request, jsonify
import mysql.connector

from utils.db_utils import get_db_connection
from utils.auth_utils import token_required

prateleira_bp = Blueprint('prateleira_bp', __name__)

# --- Criar Prateleira ---
@prateleira_bp.route('/estantes/<int:estante_id>/prateleiras', methods=['POST'])
@token_required
def create_prateleira(current_user_id, estante_id):
    data = request.get_json()
    if not data or 'nome' not in data or not data['nome']:
        return jsonify({"status": "erro", "mensagem": "Nome da prateleira é obrigatório."}), 400

    nome = data['nome']

    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            # Verificar se a estante existe e pertence ao usuário
            cursor.execute("SELECT id FROM estantes WHERE id = %s AND id_usuario = %s", (estante_id, current_user_id))
            estante_existe = cursor.fetchone()
            if not estante_existe:
                return jsonify({"status": "erro", "mensagem": "Estante não encontrada ou você não tem permissão para acessá-la."}), 404

            sql = "INSERT INTO prateleiras (nome, id_estante, id_usuario) VALUES (%s, %s, %s)"
            cursor.execute(sql, (nome, estante_id, current_user_id))
            conn.commit()
            prateleira_id = cursor.lastrowid
            return jsonify({"status": "sucesso", "mensagem": "Prateleira criada com sucesso.", "prateleira": {"id": prateleira_id, "nome": nome, "id_estante": estante_id}}), 201
        except mysql.connector.Error as err:
            conn.rollback()
            print(f"Erro ao criar prateleira: {err}")
            if "Duplicate entry" in str(err) and "nome" in str(err).lower() and "id_estante" in str(err).lower():
                return jsonify({"status": "erro", "mensagem": f"Prateleira com o nome '{nome}' já existe nesta estante para este usuário."}), 409
            return jsonify({"status": "erro", "mensagem": f"Erro interno ao criar prateleira: {err}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"status": "erro", "mensagem": "Falha ao conectar ao banco de dados para criar prateleira."}), 500

# --- Listar Prateleiras por Estante ---
@prateleira_bp.route('/estantes/<int:estante_id>/prateleiras', methods=['GET'])
@token_required
def get_prateleiras_by_estante(current_user_id, estante_id):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        try:
            # Verificar se a estante existe e pertence ao usuário
            cursor.execute("SELECT id FROM estantes WHERE id = %s AND id_usuario = %s", (estante_id, current_user_id))
            estante_existe = cursor.fetchone()
            if not estante_existe:
                return jsonify({"status": "erro", "mensagem": "Estante não encontrada ou você não tem permissão para acessá-la."}), 404

            sql = "SELECT id, nome, id_estante FROM prateleiras WHERE id_estante = %s AND id_usuario = %s"
            cursor.execute(sql, (estante_id, current_user_id))
            prateleiras = cursor.fetchall()
            return jsonify({"status": "sucesso", "total": len(prateleiras), "prateleiras": prateleiras})
        except mysql.connector.Error as err:
            print(f"Erro ao buscar prateleiras: {err}")
            return jsonify({"status": "erro", "mensagem": f"Erro interno ao buscar prateleiras: {err}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"status": "erro", "mensagem": "Falha ao conectar ao banco de dados para buscar prateleiras."}), 500

# --- Listar TODAS as Prateleiras do Usuário (útil para dropdowns gerais) ---
@prateleira_bp.route('/prateleiras', methods=['GET'])
@token_required
def get_all_prateleiras(current_user_id):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        try:
            # Busca todas as prateleiras do usuário, incluindo o nome da estante
            sql = """
            SELECT p.id, p.nome, p.id_estante, e.nome AS nome_estante
            FROM prateleiras p
            JOIN estantes e ON p.id_estante = e.id
            WHERE p.id_usuario = %s
            ORDER BY e.nome, p.nome
            """
            cursor.execute(sql, (current_user_id,))
            prateleiras = cursor.fetchall()
            return jsonify({"status": "sucesso", "total": len(prateleiras), "prateleiras": prateleiras})
        except mysql.connector.Error as err:
            print(f"Erro ao buscar todas as prateleiras: {err}")
            return jsonify({"status": "erro", "mensagem": f"Erro interno ao buscar todas as prateleiras: {err}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"status": "erro", "mensagem": "Falha ao conectar ao banco de dados para buscar todas as prateleiras."}), 500

# --- Atualizar Prateleira ---
@prateleira_bp.route('/prateleiras/<int:prateleira_id>', methods=['PUT'])
@token_required
def update_prateleira(current_user_id, prateleira_id):
    data = request.get_json()
    if not data or 'nome' not in data or not data['nome']:
        return jsonify({"status": "erro", "mensagem": "Nome da prateleira é obrigatório para atualização."}), 400

    nome = data['nome']
    
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            sql = "UPDATE prateleiras SET nome = %s WHERE id = %s AND id_usuario = %s"
            cursor.execute(sql, (nome, prateleira_id, current_user_id))
            conn.commit()

            if cursor.rowcount == 0:
                return jsonify({"status": "erro", "mensagem": "Prateleira não encontrada ou você não tem permissão para atualizá-la."}), 404
            else:
                return jsonify({"status": "sucesso", "mensagem": f"Prateleira com ID {prateleira_id} atualizada com sucesso."}), 200
        except mysql.connector.Error as err:
            conn.rollback()
            print(f"Erro ao atualizar prateleira: {err}")
            if "Duplicate entry" in str(err) and "nome" in str(err).lower() and "id_estante" in str(err).lower():
                return jsonify({"status": "erro", "mensagem": f"Prateleira com o nome '{nome}' já existe nesta estante para este usuário."}), 409
            return jsonify({"status": "erro", "mensagem": f"Erro interno ao atualizar prateleira: {err}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"status": "erro", "mensagem": "Falha ao conectar ao banco de dados para atualizar prateleira."}), 500

# --- Excluir Prateleira ---
@prateleira_bp.route('/prateleiras/<int:prateleira_id>', methods=['DELETE'])
@token_required
def delete_prateleira(current_user_id, prateleira_id):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            sql = "DELETE FROM prateleiras WHERE id = %s AND id_usuario = %s"
            cursor.execute(sql, (prateleira_id, current_user_id))
            conn.commit()

            if cursor.rowcount == 0:
                return jsonify({"status": "erro", "mensagem": "Prateleira não encontrada ou você não tem permissão para excluí-la."}), 404
            else:
                return jsonify({"status": "sucesso", "mensagem": f"Prateleira com ID {prateleira_id} excluída com sucesso."}), 200
        except mysql.connector.Error as err:
            conn.rollback()
            print(f"Erro ao excluir prateleira: {err}")
            return jsonify({"status": "erro", "mensagem": f"Erro interno ao excluir prateleira: {err}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"status": "erro", "mensagem": "Falha ao conectar ao banco de dados para excluir prateleira."}), 500