// script.js

// ==== Seleção de Elementos DOM ====
const corpo = document.body;
const alternarMenu = document.getElementById('alternar-menu');
const conteudoDropdown = document.getElementById('conteudo-dropdown');
const alternarTema = document.getElementById('alternar-tema');
const alternarMusica = document.getElementById('alternar-musica');
const canvasPersonagem = document.getElementById('canvas-sprite'); 
const ctx = canvasPersonagem.getContext('2d');
const botaoWhatsapp = document.querySelector('.botao-whatsapp');
const telaCarregamento = document.getElementById('tela-carregamento');

// Seleciona todos os itens do menu para lidar com a exibição de seções
const itensMenu = document.querySelectorAll('.item-menu[data-section]');
const secaoSobre = document.getElementById('secao-sobre');
const secaoCertificacoes = document.getElementById('secao-certificacoes');

// Seleciona os novos botões de fechar
const botaoFecharSobre = document.getElementById('botao-fechar-sobre');
const botaoFecharCertificacoes = document.getElementById('botao-fechar-certificacoes'); //


// ==== Assets de Áudio ====
// Som de abertura de baú para o menu
const somAbrirBau = new Audio('chest-open.mp3'); // chestOpenSound
somAbrirBau.volume = 0.1;

// Trilha sonora de fundo pixel art
const musicaFundo = new Audio('trilhasonora-fundo.mp3');
musicaFundo.loop = true; // Garante que a música toque em loop
musicaFundo.volume = 0.3; // Volume inicial da música

// ==== Variáveis de Estado ====
let menuEstaAberto = false;
let modoEscuroAtivo = true;
let musicaEstaTocando = false;
let posXPersonagem = 0; // characterX
let posYPersonagem = 0; // characterY

// ==== Controle de Carregamento de Assets ====
let assetsCarregadosContador = 0;
const totalAssetsParaCarregar = 3; //

// Função para verificar se todos os assets foram carregados (ou falharam no carregamento)
function verificarCarregamentoCompleto() {
    assetsCarregadosContador++;
    if (assetsCarregadosContador === totalAssetsParaCarregar) {
        esconderTelaCarregamento();
    }
}

// ==== Carregamento da Imagem do Personagem ====
const imagemPersonagemDesktop = new Image();
imagemPersonagemDesktop.src = 't3za-character.png';
imagemPersonagemDesktop.onload = verificarCarregamentoCompleto;
imagemPersonagemDesktop.onerror = () => {
    console.error("Erro ao carregar a imagem do personagem desktop.");
    verificarCarregamentoCompleto();
};

const imagemPersonagemMobile = new Image();
imagemPersonagemMobile.src = 't3za-character-telamenor.png';
imagemPersonagemMobile.onload = verificarCarregamentoCompleto;
imagemPersonagemMobile.onerror = () => {
    console.error("Erro ao carregar a imagem do personagem mobile.");
    verificarCarregamentoCompleto();
};

let imagemPersonagem = imagemPersonagemDesktop; // Padrão

// Listener para o carregamento da música
musicaFundo.addEventListener('canplaythrough', verificarCarregamentoCompleto); // A música está pronta para tocar
musicaFundo.addEventListener('error', () => {
    console.warn("Erro ao carregar a música de fundo. Verifique o caminho ou formato.");
    verificarCarregamentoCompleto();
});


// ==== Variáveis de Frame ====
const larguraFrame = 64;  // larguraFrame
const alturaFrame = 64; // alturaFrame
const frameFixo = 0;   // fixedFrame

// Redimensiona o canvas para garantir que ele se adapte ao tamanho do seu container
function redimensionarCanvas() { // resizeCanvas
    // Garante que o canvas seja sempre nítido para pixel art
    canvasPersonagem.style.width = '100%'; // Ajuste para ocupar a largura total do container pai
    canvasPersonagem.style.height = '100%'; // Ajuste para ocupar a altura total do container pai
    canvasPersonagem.width = 200 * window.devicePixelRatio;
    canvasPersonagem.height = 200 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    posXPersonagem = canvasPersonagem.width / (2 * window.devicePixelRatio);
    posYPersonagem = canvasPersonagem.height / (2 * window.devicePixelRatio);

    // Adiciona ou remove a classe 'personagem-oculto' com base no tamanho da janela
    if (window.innerWidth < 480 && window.innerHeight < 755) {
        corpo.classList.add('personagem-oculto');
    } else {
        corpo.classList.remove('personagem-oculto');
    }

    // Escolher a imagem com base na largura da tela
    if (window.innerWidth <= 480) {
        imagemPersonagem = imagemPersonagemMobile;
    } else {
        imagemPersonagem = imagemPersonagemDesktop;
    }

    desenharPersonagem(); // Redesenha o personagem após redimensionar
}

// ==== Funções de Utilidade ====

// Função para esconder a tela de carregamento
function esconderTelaCarregamento() {
    telaCarregamento.style.display = 'none';
    // Tenta iniciar a música, pode falhar devido a políticas de autoplay
    if (!musicaEstaTocando) { // Só tenta tocar se não estiver tocando
        musicaFundo.play().then(() => {
            musicaEstaTocando = true;
            atualizarBotaoMusica();
            console.log("Música de fundo iniciada.");
        }).catch(error => {
            console.warn("Não foi possível iniciar a música automaticamente:", error);
        });
    }
}


// Atualiza o ícone do botão de música
function atualizarBotaoMusica() { 
    const iconeMusica = alternarMusica.querySelector('.icone-pixel.icone-musica'); 
    if (musicaEstaTocando) {
        
        iconeMusica.src = 'icon-music-on.png';
        iconeMusica.alt = 'Música Ligada';
    } else {
        
        iconeMusica.src = 'icon-music-off.png';
        iconeMusica.alt = 'Música Desligada';
    }
}

// Alterna o tema claro/escuro
function alternarModoTema() { // toggleTheme - Renomeado para evitar conflito
    modoEscuroAtivo = !modoEscuroAtivo;
    if (modoEscuroAtivo) {
        corpo.classList.remove('modo-claro'); // light-mode
        corpo.classList.add('modo-escuro'); // dark-mode
    } else {
        corpo.classList.remove('modo-escuro'); // dark-mode
        corpo.classList.add('modo-claro'); // light-mode
    }
    // Atualiza o ícone do botão de tema
    const iconeTema = alternarTema.querySelector('.icone-pixel.icone-tema'); // themeIcon
    if (modoEscuroAtivo) {
        
        iconeTema.src = 'icon-moon.png';
        iconeTema.alt = 'Modo Escuro';
    } else {
        
        iconeTema.src = 'icon-sun.png';
        iconeTema.alt = 'Modo Claro';
    }
    localStorage.setItem('modoEscuroAtivo', modoEscuroAtivo); // Salva a preferência do utilizador
}

// Inicializa o tema com base na preferência salva ou padrão
function inicializarTema() { // initializeTheme
    const temaSalvo = localStorage.getItem('modoEscuroAtivo'); // savedTheme
    if (temaSalvo === 'false') { // Se for 'false' (string), inicializa no modo claro
        modoEscuroAtivo = false;
        corpo.classList.remove('modo-escuro'); // dark-mode
        corpo.classList.add('modo-claro'); // light-mode
    } else { // Padrão ou 'true'
        modoEscuroAtivo = true;
        corpo.classList.remove('modo-claro'); // light-mode
        corpo.classList.add('modo-escuro'); // dark-mode
    }
    // Define o ícone inicial correto
    const iconeTema = alternarTema.querySelector('.icone-pixel.icone-tema'); // themeIcon
    if (modoEscuroAtivo) {
        iconeTema.src = 'icon-moon.png';
        iconeTema.alt = 'Modo Escuro';
    } else {
        iconeTema.src = 'icon-sun.png';
        iconeTema.alt = 'Modo Claro';
    }
}


// Esconde todas as seções de conteúdo
function esconderTodasSecoes() { // hideAllSections
    secaoSobre.classList.remove('show');
    secaoCertificacoes.classList.remove('show');
}

// ==== Funções de Desenho do Canvas ====

// Desenha a imagem completa no canvas para preencher a área
function desenharPersonagem() {
    ctx.clearRect(0, 0, canvasPersonagem.width, canvasPersonagem.height); // Limpa o canvas

    if (imagemPersonagem.complete && imagemPersonagem.naturalWidth > 0) {
        // Desenha a imagem completa para preencher todo o canvas
        ctx.drawImage(
            imagemPersonagem,
            0, 0, // Posição de origem na imagem (canto superior esquerdo)
            imagemPersonagem.naturalWidth, imagemPersonagem.naturalHeight, // Dimensões da imagem original
            0, 0, // Posição de destino no canvas (canto superior esquerdo)
            canvasPersonagem.width, canvasPersonagem.height // Dimensões para preencher o canvas
        );
    } else {
        desenharPersonagemFallback(canvasPersonagem.width / 2, canvasPersonagem.height / 2);
    }
}

// Fallback para desenhar um quadrado se a imagem não carregar
function desenharPersonagemFallback(x, y) {
    ctx.fillStyle = 'white';
    ctx.fillRect(x - 50, y - 50, 100, 100); // Desenha um quadrado branco
    ctx.fillStyle = 'green'; // Olhos verdes
    ctx.fillRect(x - 30, y - 30, 10, 10);
    ctx.fillRect(x + 20, y - 30, 10, 10);
}

// ==== Listeners de Eventos ====

// Listener para o botão de menu drop down
alternarMenu.addEventListener('click', () => {
    menuEstaAberto = !menuEstaAberto;
    conteudoDropdown.classList.toggle('show', menuEstaAberto);
    if (menuEstaAberto) {
        somAbrirBau.play().catch(e => console.warn("Erro ao tocar som do baú:", e));
    }
});

// Listener para fechar o menu se clicar fora
document.addEventListener('click', (evento) => { // event
    if (!alternarMenu.contains(evento.target) && !conteudoDropdown.contains(evento.target)) {
        conteudoDropdown.classList.remove('show');
        menuEstaAberto = false;
    }
});

// Listener para os itens do menu (Sobre Mim, Certificações)
itensMenu.forEach(item => {
    item.addEventListener('click', (evento) => { // event
    evento.preventDefault();
    esconderTodasSecoes(); // Esconde todas as seções primeiro
    const idSecaoAlvo = 'secao-' + item.dataset.section; // targetSectionId
    const secaoAlvo = document.getElementById(idSecaoAlvo); // targetSection
    if (secaoAlvo) {
        secaoAlvo.classList.add('show'); // Mostra a seção clicada

            conteudoDropdown.classList.remove('show'); // Fecha o menu
            menuEstaAberto = false;
        }
    });
});

// Listeners para os botões de fechar das seções
botaoFecharSobre.addEventListener('click', () => {
    secaoSobre.classList.remove('show');
});

botaoFecharCertificacoes.addEventListener('click', () => {
    secaoCertificacoes.classList.remove('show');
});


// Listener para o botão de alternar tema
alternarTema.addEventListener('click', alternarModoTema);

// Listener para o botão de ativar/desativar música
alternarMusica.addEventListener('click', () => {
    if (musicaEstaTocando) {
        musicaFundo.pause();
        musicaEstaTocando = false;
        atualizarBotaoMusica(); // Atualiza o ícone imediatamente ao pausar
    } else {
        musicaFundo.play().then(() => {
            musicaEstaTocando = true;
            atualizarBotaoMusica(); // Atualiza o ícone APENAS se a música começar a tocar
        }).catch(error => {
            console.error("Erro ao tentar tocar a música:", error);
            musicaEstaTocando = false; // Garante que a flag esteja falsa se a reprodução falhar
            atualizarBotaoMusica(); // Atualiza o ícone para refletir que a música não está tocando
        });
    }
});

// Redimensionar canvas quando a janela for redimensionada
window.addEventListener('resize', redimensionarCanvas);


// ==== Inicialização ====
window.onload = () => {
    inicializarTema(); // Define o tema inicial
    redimensionarCanvas(); // Ajusta o canvas ao carregar
};