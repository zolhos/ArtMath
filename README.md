# ArtMath: Estúdio de Arte Algorítmica & Showcase Agêntico

> "A Matemática, devidamente encarada, possui não apenas a verdade, mas a suprema beleza — uma beleza fria e austera, como a de uma escultura." — Bertrand Russell

**ArtMath** é um estúdio interativo de arte algorítmica desenvolvido para rodar de forma 100% estática e modular no navegador (ideal para GitHub Pages). Este projeto serve como um **playground visual** onde equações algébricas, teoria do caos, geometria sagrada e análise complexa ganham vida e cor por meio do elemento HTML5 Canvas.

Mais do que um motor de simulação, o **ArtMath** é um portfólio de engenharia de software moderna, construído sob a ótica da **programação agêntica** e da **colaboração humano-IA**.

---

## 🌌 Sobre o Criador: Diego Gonçalves

Olá! Sou o **Diego Gonçalves**, e este projeto une minhas maiores paixões e trajetórias intelectuais:

*   **🎓 Mestre em Álgebra:** Minha formação acadêmica me ensinou a enxergar estruturas invisíveis sob os números. Este estúdio transpõe a rigidez teórica da álgebra e das equações diferenciais para a expressividade plástica das cores e formas.
*   **🚀 Entusiasta de Astronomia & Visitante da NASA:** Minha admiração pela mecânica celeste e a imensidão do cosmos inspira o comportamento gravitacional de campos vetoriais e atratores tridimensionais que você encontra aqui.
*   **💡 Defensor da Aprendizagem Criativa & Visitante do MIT:** Inspirado pelas ideias do *Lifelong Kindergarten* do MIT Media Lab, acredito no poder do aprendizado através do fazer, da exploração lúdica (*tinkering*) e do design estético interativo.
*   **🤖 Desenvolvedor de Inteligência Artificial:** Especialista em projetar sistemas e fluxos de trabalho usando agentes autônomos de IA. Este repositório é a prova prática de como delegar tarefas estruturadas a IAs com base em padrões de design portáveis.

---

## 🎨 Presets Matemáticos Inclusos

O motor renderiza com fluidez de 60 FPS e suporte a paletas cromáticas interpoladas e mistura aditiva (*glow effect*):

1.  **Vector Field (Campos de Fluxo):** Partículas que flutuam sobre um mapa de direções trigonométricas complexas que se deformam harmonicamente no tempo.
2.  **Atrator Clifford:** Uma órbita caótica derivada de equações determinísticas iteradas recursivamente, gerando espirais e nébulas espaciais.
3.  **Harmonia Circular:** Geometria sagrada interativa baseada em polares e ressonância trigonométrica.
4.  **Árvore Fractal (L-System):** Estrutura natural recursiva que oscila dinamicamente simulando a elasticidade de galhos sob o vento.
5.  **Gerador de Mandalas (Caleidoscópio):** Um simulador físico de jogo de espelhos radial. Partículas flutuam dentro de uma cunha e são espelhadas bilateralmente com sliders de deformação de círculo em flores/estrelas.
6.  **Atrator de Lorenz 3D:** Renderização tridimensional das equações diferenciais de convecção atmosférica, girando continuamente na tela como uma borboleta caótica.
7.  **Conjunto de Mandelbrot:** O fractal mais clássico da matemática complexa ($z_{n+1} = z_n^2 + c$) com *color-cycling* dinâmico e suporte a aproximação interativa (dobre o zoom e mude o foco dando um clique em qualquer pixel do fractal).

---

## 🛠️ Arquitetura do Software & Extensibilidade

O estúdio foi refatorado de um arquivo monolítico para uma arquitetura modular baseada em plugins que rodam nativamente no navegador utilizando **ES Modules (JavaScript puro)**:

*   **`js/engine.js`**: O motor gráfico responsável pelo loop principal (`requestAnimationFrame`), cálculo de FPS, redimensionamento HiDPI (retina) e manipulação do canvas.
*   **`js/ui.js`**: O criador de interface dinâmico. Ele lê a estrutura de metadados do preset ativo e gera sliders e fórmulas matemáticas automaticamente na barra lateral.
*   **`js/svg-exporter.js`**: Uma classe utilitária (`SVGContext`) que simula a API 2D do Canvas em tempo de execução para gerar e exportar arquivos vetoriais **SVG** puros, inclusive capturando imagens pesadas (como o Mandelbrot) de forma otimizada.
*   **`js/presets/`**: Plugins que contêm apenas as fórmulas e regras de inicialização de cada tipo de arte matemática.

---

## 🤖 Demonstração Agêntica: O Padrão Anthropic Agent Skills

Para demonstrar minhas habilidades na orquestração de Inteligências Artificiais e na criação de código auto-sustentável, o repositório adota o padrão de especificação **Anthropic Agent Skills**:

Na pasta **`.agents/skills/create-math-preset/`**, você encontrará o arquivo [SKILL.md](file:///.agents/skills/create-math-preset/SKILL.md). Ele ensina detalhadamente a qualquer agente de codificação de IA (como o Claude Code ou o Gemini Antigravity) como projetar, programar e plugar um novo preset de arte matemática de forma 100% autônoma. 

> **Exemplo Prático:** O preset do **Atrator de Lorenz 3D** (`lorenz.js`) e do **Mandelbrot** (`mandelbrot.js`) foram criados por IA seguindo estritamente as diretrizes matemáticas e de codificação documentadas nessa Skill, provando a eficácia e modularidade do sistema.

---

## 🚀 Como Executar o Projeto Localmente

Como o projeto faz uso de ES Modules para modularização dos arquivos JS, o navegador bloqueará requisições de arquivos locais (`file:///`) devido às políticas de CORS. Para rodar localmente, você precisará de um servidor HTTP simples.

1.  Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2.  Instale as dependências de desenvolvimento (Vite):
    ```bash
    npm install
    ```
3.  Inicie o servidor local:
    ```bash
    npm run dev
    ```
4.  Abra o link gerado (geralmente `http://localhost:5173`) no seu navegador.
