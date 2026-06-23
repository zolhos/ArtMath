---
name: create-math-preset
description: Instruções e templates para criar e plugar novos presets de arte matemática no motor gráfico modular do ArtMath.
---

# Criador de Presets do ArtMath

Este skill orienta o agente ou desenvolvedor sobre como adicionar um novo preset de arte matemática de forma modular no projeto.

## Interface do Preset

Todo preset deve ser exportado como um módulo ES padrão em `js/presets/<id>.js` e possuir a seguinte estrutura:

```javascript
export default {
  // Identificador único e nome de exibição
  id: 'meupreset',
  name: 'Meu Preset Artístico',
  icon: 'wind', // Nome de um ícone do Lucide Icons (ex: wind, orbit, snowflake, sun, activity)

  // Equações matemáticas formatadas e descrição textual que aparecerão no painel inferior
  math: 'F(x, y) = ...',
  desc: 'Uma descrição premium sobre a matemática e o comportamento deste preset.',

  // Sugestões de estilo padrão para o motor (opcional)
  suggestedOpacity: 0.5,
  suggestedContinuous: false,

  // Configurações que geram Sliders de UI automaticamente
  config: {
    minhaVariavel: { 
      label: 'Nome Amigável', 
      min: 0, 
      max: 10, 
      step: 0.1, 
      value: 5.0,
      reinit: false // Defina true se alterar este slider deve reiniciar a simulação chamando init()
    }
  },

  // Estado interno mutável do preset
  state: {},

  // Inicializador chamado na troca de presets ou redimensionamento do canvas
  init(canvas, ctx, presetConfig) {
    // Inicialize partículas, listas ou variáveis internas no this.state
  },

  // Desenho chamado a cada frame no requestAnimationFrame loop
  draw(canvas, ctx, globalState, presetConfig, time, mouse, getColor) {
    // Execute os cálculos matemáticos e renderize no canvas
    // Use `getColor(value)` (onde 0 <= value <= 1) para pegar cores interpoladas da paleta ativa
  },

  // Mutador acionado ao clicar em "Mutar Variáveis"
  onMutate(presetConfig) {
    // Altere valores em presetConfig.<variavel>.value de forma randômica e esteticamente harmoniosa
  },

  // Opcional: Clique do mouse no canvas
  onClick(presetConfig, mouse, triggerToast, rebuildUI) {
    // Lógica acionada ao clicar com o botão esquerdo no canvas
  }
};
```

## Passos para Registrar o Novo Preset

1. Crie o arquivo `js/presets/<meupreset>.js`.
2. Importe-o no indexador de presets [index.js](file:///Users/diegozolhos/Projects/ArtMath/js/presets/index.js).
3. Adicione o preset importado ao objeto `presets` exportado no final do arquivo.
4. O motor gráfico e a interface de usuário descobrirão o preset automaticamente, renderizando o botão com o ícone Lucide, atualizando a fórmula matemática e injetando os sliders de variáveis correspondentes na barra lateral!
