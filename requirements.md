📄 PRD: Portal Interno de Aprovação de Mídias
1. Visão Geral do Produto
Uma plataforma web interna para centralizar o fluxo de criação, revisão e aprovação de peças de comunicação (imagens e vídeos) para redes sociais. O objetivo é eliminar o ruído da comunicação descentralizada, garantindo rastreabilidade, feedback estruturado e um repositório histórico do que foi publicado.

2. Stack Tecnológica (MVP)
Front-end / Back-end: Next.js (React).

Estilização: Tailwind CSS (Foco em design minimalista e responsividade).

Banco de Dados, Autenticação e Storage: Supabase.

3. Perfis de Acesso (RBAC)
Administrador: Acesso total. Pode convidar usuários, definir papéis e atuar em qualquer etapa do fluxo.

Criador: Cria os rascunhos, faz upload de mídias, edita e encaminha para aprovação.

Aprovador (Gestor): Visualiza a fila de demandas, avalia o conteúdo no formato de mockup, aprova, reprova e adiciona comentários obrigatórios em caso de ressalvas.

4. Requisitos Funcionais (RF)
RF01 - Módulo de Upload: O sistema deve permitir o upload de imagens (JPG/PNG) e vídeos (MP4), além de campos de texto para Legenda, Tags, Contas a marcar e Data/Hora sugerida.

RF02 - Pré-visualização (Mockup): O sistema deve renderizar a mídia e a legenda em um contêiner que simule a interface do Instagram, com alternância de visão entre Feed, Story e Reels.

RF03 - Fluxo de Status: O card deve transitar pelos status: Rascunho > Aguardando Aprovação > Aprovado com Ressalvas > Reprovado > Aprovado > Publicado.

RF04 - Exportação Rápida: Cards no status "Aprovado" devem exibir botões nativos para "Baixar Mídia" e "Copiar Legenda" (para a área de transferência).

RF05 - Transição Manual: O usuário deve poder mover o card de "Aprovado" para "Publicado" após realizar a postagem manual no Instagram.

RF06 - Autenticação e Convites: Login por E-mail/Senha. Sem tela de cadastro público. Novos usuários entram apenas via link de convite gerado pelo Administrador.

RF07 - Log de Auditoria: O sistema deve registrar uma linha do tempo automática, imutável e visível no card, contendo Ação, Usuário e Data/Hora de todas as mudanças de status.

5. Regras de Negócio (RN)
RN01 - Feedback Obrigatório: É proibido alterar o status para "Aprovado com Ressalvas" ou "Reprovado" sem preencher o campo de justificativa/comentário.

RN02 - Classificação da Ressalva: O aprovador deve marcar se o ajuste necessário é de "Legenda" e/ou "Mídia".

RN03 - Bifurcação de Correção: * Se a ressalva for só de Legenda, o Criador pode editar o texto e avançar direto para "Aprovado".

Se a ressalva envolver Mídia, o card retorna obrigatoriamente para "Aguardando Aprovação" após o novo upload.

RN04 - Versionamento Visual: Quando houver reenvio de mídia, o Aprovador deve ter a opção de comparar a "Versão Anterior" com a "Versão Nova".

RN05 - Segurança de Convites: Links de convite gerados pelo admin expiram em 48 horas.

6. Requisitos Não Funcionais (RNF) - UX/UI e Arquitetura
RNF01 - Design Minimalista (Clean UI): Uso predominante de tons neutros (branco/cinza claro), espaços em branco, tipografia sem serifa geométrica e uso de cores vibrantes apenas em status e chamadas de ação (CTAs).

RNF02 - Foco Mobile: A tela de visualização e exportação de cards aprovados deve ser perfeitamente responsiva e otimizada para navegação via smartphone.

RNF03 - Gestão de Storage: O upload de mídias deve ser gerenciado de forma assíncrona para não travar a interface do usuário durante o envio de vídeos pesados.