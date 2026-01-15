import { VisualPlanType } from '@/types/plans'

// Módulos agora são buscados da API em /plan/public/modules

// TODO: Excluir
const _plansMock: VisualPlanType[] = [
  {
    id: '9de3b31a-5e19-4735-89d0-2eef57ac0010',
    name: 'Start',
    basePrice: 11500,
    isActive: true,
    sections: {
      concept: {
        description:
          'Na jornada da excelência, tudo começa com a organização e estruturação das informações. Esse ponto de partida cria as bases para que o negócio avance de forma organizada e profissional.',
        objective:
          'Digitalizar e estruturar as informações principais, garantindo um início profissional e funcional.',
        mainActions: [
          'Cadastro de clientes, fornecedores, colaboradores e produtos.',
          'Organização financeira básica: plano de contas, despesas fixas, folha de pagamento e receitas.',
          'Implementação de um sistema simples para emissão de pedidos, controle financeiro básico e aparência profissional.',
        ],
        expectedResults: {
          text: 'A empresa sai do improviso, garantindo que nenhum trabalho seja esquecido, com informações organizadas e uma imagem mais profissional.',
        },
      },
      features: [
        {
          title: 'Empresa e sistema',
          items: [
            '3 usuários',
            'Cadastro de 1 CNPJ',
            'Padrões de medida',
            'Cadastro de colaboradores',
            'Perfis de usuário',
            'Setores',
          ],
          videoUrl: 'https://vimeo.com/495579294',
        },
        {
          title: 'Vendas',
          items: ['Orçamentos', 'Ordens de serviço'],
          videoUrl: 'https://vimeo.com/495579294',
        },
        {
          title: 'Financeiro',
          items: [
            'Fluxo financeiro',
            'Formas de pagamento',
            'Despesas fixas',
            'Folha de pagamento (Simplificada)',
            'Plano de contas',
          ],
          videoUrl: 'https://vimeo.com/495579294',
        },
        {
          title: 'Produtos',
          items: ['Produtos sem composição'],
          videoUrl: 'https://vimeo.com/495579294',
        },
        {
          title: 'Cadastros',
          items: ['Clientes (Simplificado)', 'Fornecedores (Simplificado)'],
          videoUrl: 'https://vimeo.com/495579294',
        },
      ],
    },
  },
  {
    id: 'bfd8690f-846c-4a7c-82d6-6bd9c2546c83',
    name: 'Lite',
    basePrice: 23000,
    isActive: true,
    badge: {
      text: 'Próximo nível',
      variant: 'light',
    },
    sections: {
      concept: {
        description:
          'Com as bases lançadas na Etapa Start, o próximo passo é fortalecer a estabilidade financeira e comercial do negócio por meio de ferramentas mais robustas.',
        objective:
          'Aprofundar o controle financeiro da empresa enquanto integra informações comerciais (CRM) para facilitar tomadas de decisão estratégicas.',
        mainActions: [
          'Cadastro de produtos com composições básicas.',
          'Controle financeiro avançado:',
          'Separação por contas bancárias.',
          'Definição de limites de crédito para clientes.',
          'Opção para repasse automático das taxas financeiras.',
          'Introdução ao CRM (Gestão Comercial):',
          'Status das negociações em andamento.',
          'Motivos dos cancelamentos registrados no sistema.',
          'Histórico completo dos clientes:',
        ],
        expectedResults: {
          text: 'A empresa ganha previsibilidade financeira:',
          list: [
            'Redução significativa nas perdas financeiras;',
            'Melhor controle sobre vendas/compras;',
            'Decisões comerciais mais assertivas graças ao CRM integrado.',
          ],
        },
        footer:
          'As informações cadastradas aqui evoluem diretamente pra próxima etapa — sem retrabalho!',
      },
    },
  },
  {
    id: '6c55c147-a82d-4698-8e82-5c4e1e3d3e95',
    name: 'Pro',
    basePrice: 0,
    isActive: false,
    badge: {
      text: 'Em breve',
      variant: 'orangeLight',
    },
    sections: {
      concept: {
        description:
          'Essa é a grande virada! Com a estabilidade financeira consolidada, é hora de aprofundar o conhecimento sobre custos e estruturar os processos para maior eficiência.',
        objective:
          'Compreender os custos reais e criar padrões para processos e orçamentos.',
        mainActions: [
          'Cadastro detalhado de custos: mão de obra, materiais e equipamentos.',
          'Identificação de trabalhos mais lucrativos e eliminação de serviços deficitários.',
          'Padronização de processos de trabalho, criando fluxos claros para orçamentos e produção.',
          'Delegação de funções antes centralizadas no dono da empresa baseada nesses processos.',
        ],
        expectedResults: {
          text: 'A empresa ganha clareza sobre sua operação, reduz sua linha de produtos para focar no que é mais lucrativo e padroniza processos, diminuindo a dependência exclusiva do dono.',
        },
      },
    },
  },
  {
    id: 'uuid()',
    name: 'Elite',
    basePrice: 0,
    isActive: false,
    badge: {
      text: 'Em breve',
      variant: 'orangeLight',
    },
    sections: {
      concept: {
        description:
          'Nesta etapa, a empresa passa a contar com um gerenciador de produção exclusivo, desenvolvido para atender às necessidades específicas de empresas de comunicação visual e gráficas.',
        objective:
          'Integrar todos os setores ao sistema, garantindo um gerenciamento eficiente da produção com base em dados reais.',
        mainActions: [
          'Implementação do gerenciador de produção:',
          'Adaptável à estrutura específica da empresa.',
          'Baseado nas composições detalhadas dos produtos criadas na Etapa 3.',
          'Treinamento direcionado:',
          'Cada setor aprende como usar o sistema dentro das suas funções específicas.',
          'Análise avançada da produtividade:',
          'Medição precisa por setor.',
          'Avaliação individual dos colaboradores com base nos tempos estimados versus realizados.',
        ],
        expectedResults: {
          list: [
            'Produção totalmente integrada entre os setores;',
            'Redução de erros operacionais;',
            'Identificação clara de gargalos produtivos (setores ou indivíduos);',
            'Melhor aproveitamento dos recursos disponíveis (tempo, máquinas e materiais).',
          ],
        },
        footer:
          'O gerenciador foi projetado exclusivamente para empresas gráficas e de comunicação visual, oferecendo flexibilidade máxima sem complicações desnecessárias!',
      },
    },
  },
  {
    id: '73293adc-25c8-463a-8815-5088811496c6',
    name: 'Full',
    basePrice: 0,
    isActive: false,
    badge: {
      text: 'Em breve',
      variant: 'orangeLight',
    },
    sections: {
      concept: {
        description:
          'No ponto mais avançado da jornada, o foco é integrar todas as etapas anteriores para um gerenciamento completo e eficiente de estoque.',
        objective:
          'Garantir que o estoque seja gerido com precisão, evitando desperdícios e alinhando-o às demandas da produção.',
        mainActions: [
          'Entrada de materiais correta no sistema.',
          'Composição detalhada dos trabalhos, considerando aproveitamento e substituição de materiais na produção.',
          'Integração com o gerenciamento de produção para rastrear o uso real de materiais.',
          'Análise de custos estimados versus realizados, com ajustes nos processos para melhorias futuras.',
        ],
        expectedResults: {
          text: 'A empresa atinge excelência operacional, com controle total sobre custos, estoques e processos, resultando em mais eficiência e lucratividade.',
        },
      },
    },
  },
]
