import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import Dashboard from "./components/Dashboard.jsx";

// Define a URL base do seu backend Flask
const API_BASE_URL = "http://127.0.0.1:5000";

function App() {
  // Estados para controlar a visualização (Login/Registro), mensagens e autenticação
  const [isLoginView, setIsLoginView] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(""); // Armazena o username para exibir

  // Efeito para verificar o status de login ao carregar o aplicativo
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  // Função chamada após login/registro bem-sucedido
  const handleAuthSuccess = (token, user) => {
    localStorage.setItem("token", token); // Armazena o token no localStorage
    localStorage.setItem("username", user); // Armazena o username no localStorage
    setIsLoggedIn(true);
    setUsername(user);
    setMessage("Login/Registro realizado com sucesso!");
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove o token do localStorage
    localStorage.removeItem("username"); // Remove o username do localStorage
    setIsLoggedIn(false);
    setMessage("Sessão encerrada.");
  };

  return (
    <div
      className="p-8 rounded-2xl shadow-xl w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto bg-cover bg-center"
      style={{
        backgroundImage: `url('https://media.istockphoto.com/id/1597475039/pt/foto/abstract-colorful-glass-background.jpg?s=2048x2048&w=is&k=20&c=_KqTfxw1JBPN-2DmM4PHGIX1sALBFiwpKLIvvxHbnyc=')`,
      }}
      /* REMOVIDA A CLASSE 'max-w-md' para que as classes maiores funcionem. */
      /* A div agora começa com 'w-full' e se expande conforme os breakpoints. */
    >
      <h1 className="text-3xl font-bold text-[#004AAD] text-center mb-6">
        Catálogo de Livros
      </h1>
      {/* Exibe mensagens para o usuário */}
      {message && (
        <div className="mb-4 p-3 rounded-lg text-center text-sm font-medium bg-[#CAF0F8] text-[#0077B6]">
          {message}
        </div>
      )}

      {/* Renderiza o Dashboard se estiver logado, ou formulários de Login/Registro */}
      {isLoggedIn ? (
        <Dashboard
          username={username}
          onLogout={handleLogout}
          setMessage={setMessage}
          API_BASE_URL={API_BASE_URL}
        />
      ) : (
        <div>
          {/* Botões para alternar entre Login e Registro */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsLoginView(true)}
              className={`px-6 py-2 rounded-l-lg text-lg font-semibold transition-colors duration-200 ${
                isLoginView
                  ? "bg-[#0077B6] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLoginView(false)}
              className={`px-6 py-2 rounded-r-lg text-lg font-semibold transition-colors duration-200 ${
                !isLoginView
                  ? "bg-[#0077B6] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Registrar
            </button>
          </div>

          {/* Renderiza o formulário de Login ou Registro com base no estado */}
          {isLoginView ? (
            <LoginForm
              onAuthSuccess={handleAuthSuccess}
              setMessage={setMessage}
              API_BASE_URL={API_BASE_URL}
            />
          ) : (
            <RegisterForm
              onAuthSuccess={handleAuthSuccess}
              setMessage={setMessage}
              API_BASE_URL={API_BASE_URL}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
