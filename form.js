document.getElementById('adicionarPresente').addEventListener('click', function() {
    const presentesContainer = document.getElementById('presentesContainer');
    const numeroPresentes = presentesContainer.getElementsByClassName('input-group').length + 1;

    // Criando o novo grupo de inputs para o presente
    const novoPresente = document.createElement('div');
    novoPresente.classList.add('input-group');
    
    // Adicionando o texto do presente
    const span = document.createElement('span');
    span.classList.add('input-group-text');
    span.textContent = `Presente ${numeroPresentes}`;

    // Adicionando os inputs para descrição e link do presente
    const inputDescricao = document.createElement('input');
    inputDescricao.type = 'text';
    inputDescricao.placeholder = 'Descrição do presente';
    inputDescricao.classList.add('form-control');
    inputDescricao.id = `presente${numeroPresentes}`;

    const inputLink = document.createElement('input');
    inputLink.type = 'text';
    inputLink.placeholder = 'Link do presente';
    inputLink.classList.add('form-control');
    inputLink.id = `url${numeroPresentes}`;

    // Organizando os elementos
    novoPresente.appendChild(span);
    novoPresente.appendChild(inputDescricao);
    novoPresente.appendChild(inputLink);

    // Adicionando o novo input group no container
    presentesContainer.appendChild(novoPresente);
});

const form = document.querySelector("#form");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Capturando o nome
    var nome = document.getElementById("nome").value;

    // Inicializando a variável my_text com o nome
    var my_text = `Nome: ${nome}%0A`;

    // Pegando todos os grupos de presentes
    const presentes = document.querySelectorAll('.input-group');

    // Função para escapar caracteres especiais do Markdown
    function escapeMarkdown(text) {
        return text
            .replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1') // Escapa caracteres especiais do Markdown
            .replace(/:/g, '\\:') // Escape de ':' para garantir que não seja interpretado em links
            .replace(/\n/g, '%0A'); // Corrige quebras de linha
    }

    // Função para encurtar o link usando a API do Bitly
    // Função para encurtar o link usando o Is.gd
    function encurtarLink(url) {
        return new Promise((resolve, reject) => {
            const apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`;

            // Realizando a requisição GET para o Is.gd
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.shorturl) {
                        resolve(data.shorturl);  // Retorna o link encurtado
                    } else {
                        reject("Erro ao encurtar o link, resposta inválida.");
                    }
                })
                .catch(err => reject("Erro ao encurtar o link: " + err));  // Trata erros de requisição
        });
    }


    // Função assíncrona para processar os presentes
    async function processarPresentes() {
        for (let index = 0; index < presentes.length; index++) {
            const presente = presentes[index];

            // Pegando a descrição e o link de cada presente
            const descricao = presente.querySelector('input[placeholder="Descrição do presente"]').value;
            const link = presente.querySelector('input[placeholder="Link do presente"]').value;

            // Encurtando o link
            try {
                const linkEncurtado = await encurtarLink(link);

                // Escapando a descrição para evitar conflitos com o Markdown
                const descricaoEscapada = escapeMarkdown(descricao);

                // Adicionando a descrição e o link à mensagem
                my_text += `- Presente ${index + 1}: ${descricaoEscapada} (Link: ${linkEncurtado})%0A`;

            } catch (error) {
                console.error("Erro ao encurtar o link", error);
                // Caso o link não seja encurtado, podemos continuar com o link original
                my_text += `- Presente ${index + 1}: ${descricao} (Link: ${link})%0A`;
            }
        }

        // Preparando a URL para enviar a mensagem no Telegram
        var token = "7517970730:AAFEOYq_WeIP7yblJV8pczNBHzuWCPwO70s";  // Insira o seu token do bot
        var chat_id = "-4569295160";  // Insira o chat_id do destinatário
        var url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&parse_mode=Markdown&text=${my_text}`;

        // Enviando a requisição para o Telegram
        let api = new XMLHttpRequest();
        api.open("GET", url, true);
        api.send();

        alert("Lista de presentes enviada com sucesso.");
    }

    // Chama a função assíncrona para processar os presentes e enviar a mensagem
    processarPresentes();
});