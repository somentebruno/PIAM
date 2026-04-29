# Design System - Portal de Aprovação de Mídias

## 📱 Mockup de Alta Fidelidade (Premium Device Preview)

Este componente é o padrão ouro para pré-visualização de mídias no portal. Ele foi projetado para oferecer máxima fidelidade visual, simulando um hardware real e interfaces nativas do Instagram em Light Mode.

### Princípios de Design Aplicados
- **Hardware Realista:** Frame baseado no iPhone 16 Pro (Natural Titanium).
- **Clipping Definitivo:** Uso de `clip-path` para garantir que o conteúdo nunca vaze pelas bordas arredondadas.
- **Fidelidade de Formato:** Suporte a Feed (1:1), Story (9:16) e Reels (9:16) com Safe Areas respeitadas.
- **Light Mode Nativo:** Interface branca limpa, tipografia escura e ícones de alta visibilidade.

### Especificações Técnicas
- **Dimensões do Dispositivo:** 340px x 680px (Fixo).
- **Arredondamento da Tela:** `3.8rem` (via `clip-path`).
- **Stack:** Tailwind CSS + Lucide Icons + React.

### Componente de Referência
O código fonte oficial reside em: `src/components/cards/instagram-mockup.tsx`

---

## 🎨 Paleta de Cores Institucional
- **Primária (Ação):** `#0095f6` (Instagram Blue)
- **Superfície:** `#FFFFFF` (White)
- **Hardware:** `#d1d1d6` (Natural Titanium / Silver)
- **Fundo de Preview:** `#fafafa` (Light Gray)

## 🔠 Tipografia
- **UI:** Inter / Geist (Sans-serif)
- **Pesos:** 400 (Regular), 700 (Bold)

---

> [!IMPORTANT]
> **Regra de Ouro:** Nunca altere a escala do hardware manualmente. Use o componente `InstagramMockup` para garantir que a percepção de tamanho da mídia seja proporcional ao uso real em dispositivos móveis.
