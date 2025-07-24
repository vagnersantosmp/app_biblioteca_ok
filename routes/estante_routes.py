# routes/estante_routes.py
from flask import Blueprint, request, jsonify
import mysql.connector

from utils.db_utils import get_db_connection
from utils.auth_utils import token_required

estante_bp = Blueprint('estante_bp', __name__)

# --- Criar Estante ---
@estante_bp.route('/estantes', methods=['POST'])
@token_required
def create_estante(current_user_id):
    data = request.get_json()
    if not data or 'nome' not in data or not data['nome']:
        return jsonify({"status": "erro", "mensagem": "Nome da estante é obrigatório."}), 400

    nome = data['nome']

    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            sql = "INSERT INTO estantes (nome, id_usuario) VALUES (%s, %s)"
            cursor.execute(sql, (nome, current_user_id))
            conn.commit()
            estante_id = cursor.lastrowid
            return jsonify({"status": "sucesso", "mensagem": "Estante criada com sucesso.", "estante": {"id": estante_id, "nome": nome}}), 201
        except mysql.connector.Error as err:
            conn.rollback()
            print(f"Erro ao criar estante: {err}")
            if "Duplicate entry" in str(err) and "nome" in str(err).lower():
                return jsonify({"status": "erro", "mensagem": f"Estante com o nome '{nome}' já existe para este usuário."}), 409
            return jsonify({"status": "erro", "mensagem": f"Erro interno ao criar estante: {err}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"status": "erro", "mensagem": "Falha ao conectar ao banco de dados para criar estante."}), 500

# --- Listar Estantes ---
@estante_bp.route('/estantes', methods=['GET'])
@token_required
def get_all_estantes(current_user_id):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        try:
            sql = "SELECT id, nome FROM estantes WHERE id_usuario = %s"
            cursor.execute(sql, (current_user_id,))
            estantes = cursor.fetchall()
            return jsonify({"status": "sucesso", "total": len(estantes), "estantes": estantes})
        except mysql.connector.Error as err:
            print(f"Erro ao buscar estantes: {err}")
            return jsonify({"status": "erro", "mensagem": f"Erro ao buscar estantes: {err}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"status": "erro", "mensagem": "Falha ao conectar ao banco de dados para buscar estantes."}), 500

# --- Atualizar Estante ---
@estante_bp.route('/estantes/<int:estante_id>', methods=['PUT'])
@token_required
def update_estante(current_user_id, estante_id):
    data = request.get_json()
    if not data or 'nome' not in data or not data['nome']:
        return jsonify({"status": "erro", "mensagem": "Nome da estante é obrigatório para atualização."}), 400

    nome = data['nome']

    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            sql = "UPDATE estantes SET nome = %s WHERE id = %s AND id_usuario = %s"
            cursor.execute(sql, (nome, estante_id, current_user_id))
            conn.commit()

            if cursor.rowcount == 0:
                return jsonify({"status": "erro", "mensagem": "Estante não encontrada ou você não tem permissão para atualizá-la."}), 404
            else:
                return jsonify({"status": "sucesso", "mensagem": f"Estante com ID {estante_id} atualizada com sucesso."}), 200
        except mysql.connector.Error as err:
            conn.rollback()
            print(f"Erro ao atualizar estante: {err}")
            if "Duplicate entry" in str(err) and "nome" in str(err).lower():
                return jsonify({"status": "erro", "mensagem": f"Estante com o nome '{nome}' já existe para este usuário."}), 409
            return jsonify({"status": "erro", "mensagem": f"Erro interno ao atualizar estante: {err}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"status": "erro", "mensagem": "Falha ao conectar ao banco de dados para atualizar estante."}), 500

# --- Excluir Estante ---
@estante_bp.route('/estantes/<int:estante_id>', methods=['DELETE'])
@token_required
def delete_estante(current_user_id, estante_id):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            sql = "DELETE FROM estantes WHERE id = %s AND id_usuario = %s"
            cursor.execute(sql, (estante_id, current_user_id))
            conn.commit()

            if cursor.rowcount == 0:
                return jsonify({"status": "erro", "mensagem": "Estante não encontrada ou você não tem permissão para excluí-la."}), 404
            else:
                return jsonify({"status": "sucesso", "mensagem": f"Estante com ID {estante_id} excluída com sucesso."}), 200
        except mysql.connector.Error as err:
            conn.rollback()
            print(f"Erro ao excluir estante: {err}")
            return jsonify({"status": "erro", "mensagem": f"Erro interno ao excluir estante: {err}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"status": "erro", "mensagem": "Falha ao conectar ao banco de dados para excluir estante."}), 500