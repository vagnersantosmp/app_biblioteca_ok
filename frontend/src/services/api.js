// Define a URL base do seu backend Flask
const API_BASE_URL = "http://127.0.0.1:5000";

// Função auxiliar para obter os cabeçalhos de autenticação (com o token JWT)
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // Inclui o token JWT
  };
};

// Objeto para lidar com as chamadas de API de autenticação
export const auth = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return response.json(); // Retorna a resposta JSON
  },
  register: async (username, password, email) => {
    const response = await fetch(`${API_BASE_URL}/registrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    });
    return response.json();
  },
};

// Objeto para lidar com as chamadas de API de livros
export const books = {
  fetchBooks: async () => {
    const response = await fetch(`${API_BASE_URL}/livros`, {
      method: "GET",
      headers: getAuthHeaders(), // Usa cabeçalhos de autenticação
    });
    return response.json();
  },
  addBook: async (bookData) => {
    const response = await fetch(`${API_BASE_URL}/livros`, {
      method: "POST",
      headers: getAuthHeaders(), // Usa cabeçalhos de autenticação
      body: JSON.stringify(bookData),
    });
    return response.json();
  },
  searchBookByIsbn: async (isbn) => {
    // Esta rota de busca por ISBN não é protegida no backend, então não precisa de token
    const response = await fetch(
      `${API_BASE_URL}/livros/buscar-isbn?isbn=${isbn}`
    );
    return response.json();
  },
};

// Objeto para lidar com as chamadas de API de localização (estantes e prateleiras)
export const locations = {
  fetchEstantes: async () => {
    const response = await fetch(`${API_BASE_URL}/estantes`, {
      headers: getAuthHeaders(), // Usa cabeçalhos de autenticação
    });
    return response.json();
  },
  fetchPrateleirasByEstante: async (estanteId) => {
    const response = await fetch(
      `${API_BASE_URL}/estantes/${estanteId}/prateleiras`,
      {
        headers: getAuthHeaders(), // Usa cabeçalhos de autenticação
      }
    );
    return response.json();
  },
  fetchAllPrateleiras: async () => {
    const response = await fetch(`${API_BASE_URL}/prateleiras`, {
      headers: getAuthHeaders(), // Usa cabeçalhos de autenticação
    });
    return response.json();
  },
  addEstante: async (name) => {
    const response = await fetch(`${API_BASE_URL}/estantes`, {
      method: "POST",
      headers: getAuthHeaders(), // Usa cabeçalhos de autenticação
      body: JSON.stringify({ nome: name }),
    });
    return response.json();
  },
  addPrateleira: async (estanteId, name) => {
    const response = await fetch(
      `${API_BASE_URL}/estantes/${estanteId}/prateleiras`,
      {
        method: "POST",
        headers: getAuthHeaders(), // Usa cabeçalhos de autenticação
        body: JSON.stringify({ nome: name }),
      }
    );
    return response.json();
  },
};
