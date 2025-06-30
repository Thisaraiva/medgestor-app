// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Configura o Tailwind CSS para escanear todos os arquivos JavaScript e JSX
  // dentro da pasta 'src' e suas subpastas.
  // Isso permite que o Tailwind identifique as classes que você está usando
  // e gere apenas o CSS necessário, otimizando o tamanho do arquivo final.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Inclui todos os arquivos .js, .jsx, .ts, .tsx na pasta src
    "./public/index.html",       // Inclui o arquivo index.html, caso haja classes Tailwind nele
  ],
  theme: {
    extend: {
      // Define uma paleta de cores personalizada para o projeto.
      // Isso permite usar nomes mais semânticos como 'primary', 'secondary', 'accent'.
      colors: {
        // Cor primária: um tom de azul escuro para cabeçalhos, botões principais, etc.
        primary: {
          DEFAULT: '#1a73e8', // Um azul vibrante do Google
          light: '#4285f4',   // Um azul mais claro
          dark: '#0f4c81',    // Um azul mais escuro
        },
        // Cor secundária: um tom de azul mais suave para fundos, bordas, etc.
        secondary: {
          DEFAULT: '#e8f0fe', // Um azul muito claro, quase branco
          dark: '#c5dafc',    // Um azul claro um pouco mais saturado
        },
        // Cores de texto para garantir contraste e legibilidade.
        text: {
          DEFAULT: '#333333', // Preto suave para o texto principal
          light: '#666666',   // Cinza para texto secundário
          muted: '#999999',   // Cinza mais claro para texto de dica
        },
        // Cores de fundo para a aplicação.
        background: {
          DEFAULT: '#ffffff', // Fundo branco principal
          light: '#f8f9fa',   // Um cinza muito claro para seções ou cards
        },
        // Cores para estados de sucesso, erro e aviso.
        success: '#28a745', // Verde
        error: '#dc3545',   // Vermelho
        warning: '#ffc107', // Amarelo
      },
      // Adicione animações personalizadas para o modal
      keyframes: {
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.3s ease-out forwards',
      },
      // Sombras personalizadas
      boxShadow: {
        'custom-light': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'custom-medium': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'custom-strong': '0 20px 25px rgba(0, 0, 0, 0.1)',
      },
      // Configurações de borda para elementos.
      borderRadius: {
        'xl': '0.75rem', // Bordas mais arredondadas para um visual suave
        '2xl': '1rem',
      },
    },
  },
  plugins: [
    // Adiciona o plugin @tailwindcss/forms para estilos de formulário consistentes.
    require('@tailwindcss/forms'),
  ],
};
