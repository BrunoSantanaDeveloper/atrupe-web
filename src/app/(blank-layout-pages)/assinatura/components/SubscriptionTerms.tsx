'use client'

import { useState, useEffect } from 'react'
import Image, { StaticImageData } from 'next/image'

import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { IconArrowDown, IconCircleCheck } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

// Assets
import start from '@/assets/images/start-logo.png'
import lite from '@/assets/images/lite-logo.png'
import pro from '@/assets/images/pro-logo.png'
import elite from '@/assets/images/elite-logo.png'
import full from '@/assets/images/full-logo.png'
import atrupeAcademy from '@/assets/images/academy-logo.png'

type PlanTableData = {
  name: string
  logo: StaticImageData
  subscriptionFee: string
  monthlyFee: string
  period: string
}

const plansTableData: PlanTableData[] = [
  {
    name: 'Start',
    logo: start,
    subscriptionFee: 'Isento',
    monthlyFee: 'R$ 147,00',
    period: '30 dias corridos',
  },
  {
    name: 'Lite',
    logo: lite,
    subscriptionFee: 'Isento',
    monthlyFee: 'R$ 230,00',
    period: '30 dias corridos',
  },
  {
    name: 'Pro',
    logo: pro,
    subscriptionFee: 'Isento',
    monthlyFee: 'Em desenvolvimento',
    period: '-',
  },
  {
    name: 'Elite',
    logo: elite,
    subscriptionFee: 'Isento',
    monthlyFee: 'Em desenvolvimento',
    period: '-',
  },
  {
    name: 'Full',
    logo: full,
    subscriptionFee: 'Isento',
    monthlyFee: 'Em desenvolvimento',
    period: '-',
  },
  {
    name: 'Atrupe Academy',
    logo: atrupeAcademy,
    subscriptionFee: 'Isento',
    monthlyFee: 'R$ 0,00',
    period: 'Enquanto estiver vigente o Atrupe',
  },
]

const additionalServicesData = [
  {
    name: 'Usuário adicional',
    subscriptionFee: 'Isento',
    monthlyFee: '15,00',
    period: '30 dias corridos',
  },
  {
    name: 'Emissor de Notas Fiscais',
    subscriptionFee: 'Isento',
    monthlyFee: 'R$ 70,00',
    period: '30 dias corridos',
  },
  {
    name: 'Emissor de Notas Fiscais adicional',
    subscriptionFee: 'Isento',
    monthlyFee: 'R$ 30,00',
    period: '30 dias corridos',
  },
]

export function SubscriptionTerms({
  onAgreeChange,
}: {
  onAgreeChange: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false)

  useEffect(() => {
    if (!open) {
      setIsScrolledToEnd(false)
      return
    }

    let scrollContainer: Element | null = null
    let handleScroll: (() => void) | null = null

    const timeout = setTimeout(() => {
      // Encontrar o container de scroll
      scrollContainer =
        document.querySelector('[aria-label="Termos de uso"]') ||
        document.querySelector('[data-radix-dialog-content]') ||
        document.querySelector('[role="dialog"]')

      if (scrollContainer) {
        handleScroll = () => {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer!
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 500
          if (isAtBottom) {
            setIsScrolledToEnd(true)
          }
        }

        scrollContainer.addEventListener('scroll', handleScroll)

        // Também verificar se já está no final ao abrir
        handleScroll()
      }
    }, 200)

    return () => {
      clearTimeout(timeout)
      if (scrollContainer && handleScroll) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-brand font-medium hover:underline"
        >
          Termos de Contratação
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[940px]">
        <DialogHeader>
          <DialogTitle>
            Contrato de Licença de uso de Software e Suporte Técnico
          </DialogTitle>
          <DialogDescription className="sr-only">
            Termos de uso
          </DialogDescription>
        </DialogHeader>
        <DialogBody
          className="relative text-justify text-sm space-y-8"
          aria-label="Termos de uso"
        >
          <div className="space-y-4">
            <p className="font-semibold">1. DAS PARTES:</p>
            <p>
              Por este instrumento particular, de um lado, Atrupe Sistemas
              Administrativos LTDA ME, com sede na Rua Manoel Vieira Garção, 10,
              Sala 601, Centro, CEP 88301-425, cidade de Itajaí/SC, inscrita no
              CNPJ sob nº 13.205.998/0001-02, neste ato representada por Maicol
              Igor de Souza, RG 3.254.016 e CPF 964.603.770-49, doravante
              simplesmente denominada &quot;Atrupe&quot;; E de outro lado o
              USUÁRIO cadastrado na plataforma ATRUPE, doravante denominado de
              &quot;USUÁRIO&quot;; Têm entre si como justo e acordado os
              presentes TERMOS E CONDIÇÕES DE USO DA PLATAFORMA ATRUPE
              (&quot;T&amp;C&quot;) que reger-se-á pelas cláusulas e condições
              seguintes, tendo como premissas
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">2. DAS DEFINIÇÕES:</p>
            <p>
              Os termos a seguir constantes neste T&amp;C terão o significado
              estabelecido abaixo, seja no plural ou no singular:
            </p>
            <p>
              <b>2.1 USUÁRIO: </b>
              pessoa física ou jurídica devidamente cadastrada na Plataforma da
              ATRUPE e que passa a utilizar o software de gestão pela ATRUPE
              e/ou o conteúdo disponibilizado pela ATRUPE por meio do sistema
              ATRUPE ACADEMY, pagando em contrapartida uma remuneração à ATRUPE
              pela licença de uso e suporte técnico, identificando-se por meio
              de um login e uma senha pessoal e intransferível para acesso ao
              software. Os dados cadastrados para criação de login e senha são
              pessoais e intransferíveis e se presumem verdadeiros para todos os
              fins e efeitos de direito, respondendo o USUÁRIO exclusiva e
              diretamente pela veracidade das informações ali cadastradas.
            </p>
            <p>
              <b>2.2 Garantia: </b>
              corresponde ao prazo de validade técnica, isto é, o período em que
              a titular dos direitos do programa (ATRUPE) fica obrigada no
              território nacional a assegurar ao USUÁRIO a prestação do suporte
              técnico relativo ao adequado funcionamento do programa.
            </p>
            <p>
              <b>2.3 Validade Técnica: </b> é o prazo que o titular dos direitos
              do software fica obrigada no território nacional a assegurar ao
              USUÁRIO a prestação de serviços técnicos complementares relativos
              ao adequado funcionamento do programa.
            </p>
            <p>
              <b>2.4 Suporte técnico: </b> engloba a manutenção preventiva,
              corretiva, de otimização e formativa. A manutenção preventiva
              refere-se a atitudes proativas da fornecedora do software visando
              evitar erros no programa. A manutenção corretiva se dá quando já
              ocorreram problemas com o software e pretende-se consertar.
              Manutenção de otimização visa dar mais funcionalidade ao software
              por meio da complementação de recursos no mesmo (atualizações). E
              manutenção formativa está relacionada com o empenho do fornecedor
              do software em passar todas as informações sobre o seu
              funcionamento.
            </p>
            <p>
              <b>2.5 Produto ou Serviço: </b> significa todo e qualquer serviço
              ou produto obtido e/ou gerado por intermédio da plataforma ATRUPE.
            </p>
            <p>
              <b>2.6 Portal; Sistema; Software; Aplicativo e/ou Plataforma: </b>
              significa o local, digital em qualquer suporte, de
              disponibilização dos produtos e/ou serviços ATRUPE, para acesso
              pelo USUÁRIO sendo de propriedade exclusiva da ATRUPE.
            </p>
            <p>
              <b>2.7 Tabela de Preços Avulsos: </b> é a tabela de utilização
              avulsa dos serviços, contida no &quot;ANEXO I&quot; deste T&C,
              revisada periodicamente pela ATRUPE;
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">3. DO OBJETO E SUA DESCRIÇÃO:</p>
            <p>
              <b>3.1</b> O objeto do presente contrato é o licenciamento de uso
              temporário, não exclusivo e não transferível, na forma de
              código-objeto, de software denominado &quot;Atrupe: Sistema online
              de Gerenciamento para empresas de comunicação visual&quot; bem
              como, o serviço de Suporte Técnico e ainda a plataforma de
              conteúdo &quot;Atrupe Academy&quot;.
            </p>
            <p>
              <b>3.2</b> O PRODUTO é oferecido em cinco versões: a) modalidade
              &quot;Atrupe Start&quot;; b) modalidade &quot;Atrupe Lite&quot; c)
              modalidade &quot;Atrupe Pro&quot; d) modalidade &quot;Atrupe
              Elite&quot; e) modalidade &quot;Atrupe Full&quot;. Cada modalidade
              possui as seguintes funcionalidades:
            </p>
            <p>
              <b>3.2.1 ATRUPE START:</b> Ferramentas básicas para organização
              inicial da empresa, incluindo:
              <br />- Cadastro de até 3 usuários, produtos, fornecedores e
              clientes;
              <br />- Criação de orçamentos e ordens de serviço;
              <br />- Controle financeiro básico (despesas programadas, receitas
              e pagamentos);
              <br />- Geração de relatórios básicos;
              <br />- Backup automático em banco de dados na nuvem;
              <br />- Manual online disponível ao USUÁRIO;
              <br />- Suporte técnico
            </p>
            <p>
              <b>3.2.2 ATRUPE LITE:</b> Além das ferramentas presentes no ATRUPE
              START, esta versão inclui:
              <br />- Cadastro de até 5 usuários
              <br />- Controle financeiro avançado com separação por contas
              bancárias;
              <br />- Definição de limites de crédito para clientes;
              <br />- Repasse automático das taxas financeiras;
              <br />- Introdução ao CRM (Gestão Comercial), com status das
              negociações em andamento, motivos dos cancelamentos registrados no
              sistema e histórico completo dos clientes.
            </p>
            <p>
              <b>3.2.3 ATRUPE PRO:</b> Inclui todas as ferramentas do ATRUPE
              LITE mais os seguintes recursos:
              <br />- Cadastro de até 7 usuários
              <br />- Cadastro detalhado de custos (operacionais, mão-de-obra,
              materiais e equipamentos);
              <br />- Composição detalhada para orçamentos baseados nos custos
              reais;
              <br />- Padronização dos processos operacionais (composições de
              produtos e serviços);
            </p>
            <p>
              <b>3.2.4 ATRUPE ELITE:</b> Além das funcionalidades do ATRUPE PRO,
              esta versão oferece um gerenciador exclusivo para integração da
              produção empresarial, incluindo:
              <br />- Cadastro de até 9 usuários
              <br />- Gerenciamento personalizado por setores ou fluxos
              específicos da empresa (PCP);
              <br />- Medição precisa da produtividade por setor ou colaborador
              individualmente;
            </p>
            <p>
              <b>3.2.5 ATRUPE FULL:</b> Versão mais completa que integra todas
              as etapas anteriores com foco no gerenciamento eficiente do
              estoque e análise detalhada dos custos estimados versus
              realizados. Funcionalidades incluem:
              <br />- Cadastro de até 11 usuários
              <br />- Entrada de estoque;
              <br />- Rastreamento e baixa dos materiais na produção;
              <br />- Análise continua dos processos produtivos visando
              melhorias futuras.
            </p>
            <p>
              <b>3.3</b> Este contrato NÃO abrange:
              <br />
              a) o acesso ao código-fonte do software por se tratar de direito
              patrimonial e moral do ATRUPE, ficando desde já expressamente
              proibido tal acesso;
              <br />
              b) a conexão com a internet e nem o suporte técnico para conexão
              com a internet;
              <br />
              c) suporte técnico para manutenção de rede interna e computadores
              do USUÁRIO;
            </p>
            <p>
              <b>3.4</b> O USUÁRIO poderá realizar a migração entre os módulos
              do sistema ATRUPE diretamente pela plataforma, seguindo
              obrigatoriamente as etapas sequenciais: &quot;Atrupe Start&quot;,
              &quot;Atrupe Lite&quot;, &quot;Atrupe Pro&quot;, &quot;Atrupe
              Elite&quot; e &quot;Atrupe Full&quot;. Funcionalidades ou módulos
              adicionais também poderão ser contratados pelo USUÁRIO conforme a
              disponibilidade oferecida no sistema. A ativação de novos módulos
              será realizada automaticamente no momento da alteração efetuada
              pelo USUÁRIO na plataforma, com os valores correspondentes
              ajustados na próxima cobrança mensal.
            </p>
            <p>
              <b>3.5</b> O acesso ao Software do presente contrato se dará na
              forma online através do site por meio de login e senha previamente
              cadastrado. É facultado ao USUÁRIO a criação de perfis
              subsidiários, como forma de melhor gestão interna, os quais
              utilizarão o software por meio de logins e senhas próprias, de
              forma simultânea, cada um em um computador diferente que tenha
              conexão com a internet.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">4. DA GARANTIA:</p>
            <p>
              <b>4.1</b> Este software foi cuidadosamente verificado e testado
              em todos os estágios de sua produção. Não obstante, a ATRUPE
              oferece garantia no presente contrato que corresponde ao prazo de
              validade técnica. O prazo da validade técnica corresponde ao
              período de vigência do contrato.
            </p>
            <p>
              <b>4.2</b> O suporte técnico fornecido pela ATRUPE visa evitar e
              corrigir erros no software, bem como facilitar sua utilização para
              garantir adequação à utilização das ferramentas previstas no item
              3 deste contrato, conforme o módulo contratado.
            </p>
            <p>
              <b>Parágrafo único:</b> a garantia deste contrato não engloba
              outras expressas ou implícitas de qualquer natureza, como
              garantias de comercialidade, de atendimento à padrões de mercado,
              de adequação para uma finalidade específica, ou de não violação,
              entre outras.
            </p>
            <p>
              <b>4.3</b> O USUÁRIO concorda desde já com modificações,
              implementação de novos recursos ou ferramentas, melhorias e
              correções no software. A instalação de atualizações é feita
              automaticamente pela ATRUPE.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">5. DAS OBRIGAÇÕES DO USUÁRIO:</p>
            <p>
              <b>5.1</b> Ler minuciosamente o disposto no presente contrato.
              Havendo dúvidas quanto às cláusulas, entrar em contato com a
              ATRUPE para esclarecê-las. A aceitação dos termos e condições do
              presente contrato gera presunção de que o USUÁRIO leu o contrato,
              entendeu, e concordou com a sua integralidade.
            </p>
            <p>
              <b>5.2</b> Comunicar imediatamente, de forma inequívoca, qualquer
              erro constatado no software que o torne integral ou parcialmente
              inutilizável. A forma de registro dos erros se dará por meio de
              capturas das telas (print screen) que mostrem o referido erro. A
              comunicação inequívoca se dará por meio de whatsapp pelo número
              47-2122-9194 ou e-mail suporte@atrupe.com.br.
            </p>
            <p>
              <b>Parágrafo primeiro:</b> a comunicação com o suporte técnico via
              telefone nº 47-2122-9194 será realizada de forma complementar, de
              modo que o USUÁRIO fica desde já ciente que estes meios NÃO
              ISENTAM O USUÁRIO de registrar o erro por meio de e-mail, nos
              moldes da cláusula 5.2.
            </p>
            <p>
              <b>Parágrafo segundo:</b> A não comunicação de forma inequívoca
              dos erros constatados no software implica na decadência do direito
              de exigir o reparo. O erro não comunicado de forma inequívoca será
              tido como inexistente, impossibilitando a ATRUPE de solucionar o
              erro ou problema.
            </p>
            <p>
              <b>5.3</b> Manter os computadores de acesso ao Software online
              ATRUPE sempre com antivírus atualizado, assim como firewall
              ativados. Não abrir e-mails de remetentes desconhecidos. Não
              baixar softwares desconhecidos. Zelar pela segurança do software
              utilizando-se de todos os recursos possíveis que evitem a
              vulnerabilidade do sistema operacional do computador, do software
              ATRUPE e da conexão com a internet.
            </p>
            <p>
              <b>5.4</b> Utilizar hardwares compatíveis com o software ATRUPE,
              além de internet com capacidade mínima de 100 (cem) mega.
            </p>
            <p>
              <b>5.5</b> É VEDADO ao USUÁRIO ceder o uso do software para outra
              pessoa que não estejam devidamente cadastradas no sistema sem a
              prévia anuência da ATRUPE, bem como não pode utilizá-lo sem o
              devido licenciamento, sob pena de responsabilidade civil e
              criminal pelo uso indevido.
            </p>
            <p>
              <b>5.6</b> A Licença do Software concedida ao USUÁRIO limita-se a
              autorizar APENAS o USO, ficando expressamente vedado ao USUÁRIO:
              ceder, doar, alugar, vender, arrendar, emprestar, reproduzir,
              modificar, adaptar, traduzir, oferecer em garantia ou penhor;
              alienar ou transferir, total ou parcialmente, a qualquer título,
              de forma gratuita ou onerosa, enfim, dar qualquer outra destinação
              que não seja a simples UTILIZAÇÃO na forma disposta neste T&C.
            </p>
            <p>
              <b>5.7</b> O USUÁRIO assume a responsabilidade de contratar
              funcionários para operar o sistema ATRUPE com os seguintes
              conhecimentos técnicos em informática: uso do computador, suas
              funções, uso do sistema operacional sob o qual o software irá
              trabalhar; bem como que detenha conhecimentos técnicos relativos à
              área que o software se propõe a operar, isto é, comunicação visual
              e gráficas.
            </p>
            <p>
              <b>5.8</b> O USUÁRIO deverá manter seu login e sua senha de acesso
              ao sistema sob sigilo. Caso haja motivos para acreditar que a
              senha foi descoberta por terceiros, deverá alterá-la
              imediatamente. O USUÁRIO concorda que é inteiramente responsável
              pelos atos praticados, pelas informações inseridas no software
              através de sua conta e que a ATRUPE não a protege e nem se
              responsabiliza pelo uso não autorizado de sua conta por terceiros.
            </p>
            <p>
              <b>5.9</b> Conservar e atualizar imediatamente suas informações de
              cadastro de forma a mantê-las sempre verdadeiras, exatas, atuais e
              completas.
            </p>
            <p>
              <b>Parágrafo primeiro:</b> caso a ATRUPE tenha razões suficientes
              para suspeitar que tais informações sejam falsas, incorretas,
              desatualizadas ou incompletas, terá o direito de confirmá-las com
              o USUÁRIO, assim como, de suspender ou cancelar imediatamente,
              independentemente de notificação, a conta do USUÁRIO e recusar
              toda e qualquer utilização presente ou futura, não cabendo
              reembolso dos valores já pagos.
            </p>
            <p>
              <b>5.10</b> Realizar periodicamente backup de todos os dados
              lançados no software, através de ferramenta de geração de
              relatórios. Ciente de que a ATRUPE não se responsabiliza pela
              perda de tais dados.
            </p>
            <p>
              <b>5.11</b> Após a rescisão do presente contrato, o USUÁRIO
              obriga-se a extinguir e apagar todo o software eventualmente salvo
              nos hardwares que os contém, com exceção dos dados inseridos no
              software para operá-lo, que são de sua inteira propriedade.
            </p>
            <p>
              <b>5.12</b> Constituem obrigação de não-fazer do USUÁRIO a
              decompilação, desmontagem, engenharia reversa, entre outras formas
              de violação de direitos autorais; bem como modificar ou mesclar
              todas ou quaisquer das partes do software com outros softwares que
              não sejam objeto deste contrato.
            </p>
            <p>
              <b>5.13</b> O USUÁRIO obriga-se a disponibilizar suas instalações,
              equipamentos e pessoal, a fim de facilitar de forma geral o
              SUPORTE TÉCNICO a ser executado pela ATRUPE, quando necessário.
            </p>
            <p>
              <b>5.14</b> O USUÁRIO compromete-se a alimentar o software com as
              informações necessárias de cadastro (de USUÁRIOS, produtos,
              serviços, empresas fornecedores e clientes, custos, estoques,
              setores, entre outros) estando ciente de que o bom funcionamento
              depende dessa alimentação.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">6. DAS OBRIGAÇÕES DA ATRUPE:</p>
            <p>
              <b>6.1</b> Prestar o suporte técnico (manutenção preventiva,
              corretiva, de otimização e formativo) necessário para garantir o
              adequado funcionamento das ferramentas disponibilizadas, conforme
              previsão do item 3 do presente contrato. Os dias e horários de
              atendimento para suporte técnico são em dias úteis (segunda à
              sexta feita, exceto feriados nacionais) das 8h às 12h e das
              13h30min. às 17h30min.
            </p>
            <p>
              <b>Parágrafo primeiro:</b> A ATRUPE não está obrigada a realizar
              todas as alterações de otimização no software. As manutenções de
              otimização poderão ser originadas por solicitação do USUÁRIO, mas
              o LICENCIANTE reserva-se no direito de decidir sobre a
              implementação, tendo em vista o caráter genérico do sistema e o
              interesse de outros USUÁRIOS. As sugestões e solicitações de
              alterações originadas pelo USUÁRIO podem ser objeto de orçamento
              prévio e devem ser remuneradas à parte. Havendo otimização
              contratada pelo USUÁRIO, fica desde já ciente de que ficam
              incorporadas ao Software e sujeitas aos termos deste contrato,
              podendo inclusive ser disponibilizadas a outros USUÁRIOS que
              utilizem o mesmo modelo de software.
            </p>
            <p>
              <b>Parágrafo segundo:</b> O atendimento ao suporte técnico será
              efetuado necessariamente por e-mail e poderá ser complementado por
              meio de whatsapp e/ou Telefone. Não está incluso o suporte técnico
              presencial. Caso seja necessário o suporte técnico presencial o
              tempo aplicado será faturado separadamente.
            </p>
            <p>
              <b>6.2</b> Quando houver manutenções e atualizações no software
              que impeçam sua utilização pelo USUÁRIO, estas ocorrerão
              preferencialmente fora de horário comercial (horários que não
              sejam entre 8h às 18h de dias úteis) ou aos finais de semana
              (sábado e domingo).
            </p>
            <p>
              <b>6.3</b> Comunicar imediatamente e de forma inequívoca (e-mail,
              ou na intranet do USUÁRIO, ou por correspondência, ou outro
              recurso inequívoco) qualquer alteração, atualização e aditivo
              contratual, passando a viger tais alterações imediatamente.
            </p>
            <p>
              <b>Parágrafo único:</b> Alteração de valores deverá ser comunicada
              com antecedência de 30 (trinta) dias corridos.
            </p>
            <p>
              <b>6.4</b> Manter o software disponível e em funcionamento ao
              USUÁRIO enquanto vigente o presente T&C, ainda que o software
              venha a sair de circulação.
            </p>
            <p>
              <b>6.5</b> Dar retorno acerca de solicitações de suporte técnico
              no prazo máximo de 5 (cinco) dias úteis.
            </p>
            <p>
              <b>6.6</b> Efetuar reparo de erros no software em um prazo máximo
              de 30 (trinta) dias corridos.
            </p>
            <p>
              <b>Parágrafo único:</b> Tratando-se de erro que provoque
              inutilização integral do software, haverá o abatimento
              proporcional do preço, nos moldes do item 6.9.
            </p>
            <p>
              <b>6.7</b> Manter total sigilo sobre as informações confidenciais
              do USUÁRIO a que tiver acesso por conta do suporte técnico do
              software, bem como manter sigilo dos dados inseridos pelo USUÁRIO
              no software.
            </p>
            <p>
              <b>6.8</b> Prestar todo o suporte técnico necessário, durante o
              período de validade técnica, que engloba: manutenção preventiva,
              corretiva, de otimização e formativa.
            </p>
            <p>
              <b>6.9</b> No caso de interrupção integral do software objeto
              deste contrato e por período superior à 10 (dez) dias úteis, a
              ATRUPE se compromete a não cobrar o respectivo período,
              descontando-o da mensalidade.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">
              7. DOS VALORES E FORMA DE PAGAMENTO:
            </p>
            <p>
              <b>7.1</b> Para contratação dos SERVIÇOS, o USUÁRIO optará por um
              dos planos descritos no item &quot;3. DO OBJETO&quot;, mediante o
              pagamento do respectivo preço (disponível na tabela do Anexo I),
              momento em que será liberado o acesso ao software.
            </p>
            <p>
              <b>7.2</b> O valor referente à cada plano constará na TABELA DE
              PREÇOS AVULSOS vigentes anexa a este T&C.
            </p>
            <p>
              <b>7.3</b> O aceite por parte do USUÁRIO, será parte integrante e
              complementar deste T&C. O pagamento poderá ser realizado por meios
              das formas disponibilizadas pela Atrupe, através de link de
              pagamento enviado ao USUÁRIO.
            </p>
            <p>
              <b>7.4</b> Os pagamentos realizados por meio de boleto bancário
              poderão levar um período adicional para processamento, devido à
              atuação de intermediadoras de pagamento parceiras ou ao prazo
              necessário para confirmação pelas instituições financeiras. O
              prazo usual para confirmação e liberação do pagamento é de até 72
              (setenta e duas) horas úteis, podendo variar para mais ou para
              menos, conforme as condições aplicáveis.
            </p>
            <p>
              <b>Parágrafo primeiro:</b> a ATRUPE se reserva no direito de
              efetuar o envio deste para o e-mail cadastrado pelo USUÁRIO, no
              prazo mínimo de 5 (cinco) dias antes da data do término da
              licença.
            </p>
            <p>
              <b>Parágrafo segundo:</b> o não envio ou o não recebimento do
              e-mail com o boleto pelo USUÁRIO não o desobriga do pagamento e
              das multas incidentes pelo atraso.
            </p>
            <p>
              <b>7.5</b> O pagamento será efetuado em conformidade com a opção
              escolhida pelo USUÁRIO na plataforma, sempre observando o
              estabelecido nesse T&C.
            </p>
            <p>
              <b>7.6</b> A falta de pagamento de quaisquer valores nas
              respectivas datas de vencimento acarretará o bloqueio parcial do
              acesso do USUÁRIO à plataforma. Caso as pendências financeiras não
              sejam regularizadas em até 10 (dez) dias corridos após o
              vencimento, o acesso será bloqueado totalmente até que todas as
              pendências sejam quitadas.
            </p>
            <p>
              <b>Parágrafo primeiro:</b> O acesso à plataforma somente será
              restabelecido após a identificação pela ATRUPE do pagamento
              integral de todos os valores devidos.
            </p>
            <p>
              <b>Parágrafo segundo:</b> Caso o USUÁRIO não solucione a pendência
              financeira em até 30 (trinta) dias corridos, contados do
              vencimento do valor não pago, a ATRUPE se reserva no direito de
              rescindir o presente T&C e apagar, observado o prazo previsto no
              item 8.5, de forma definitiva e irrecuperável todas as INFORMAÇÕES
              do USUÁRIO na plataforma em seu cadastro, podendo, ainda proceder
              com a inclusão do nome do USUÁRIO no Serviço de Proteção ao
              Crédito (SPC) e a cobrança pela via judicial, incidindo além da
              multa, juros e atualização monetária, as custas processuais e os
              honorários advocatícios.
            </p>
            <p>
              <b>Parágrafo terceiro:</b> Mesmo com a indisponibilidade do
              sistema devido à falta de pagamento, as mensalidades continuarão
              sendo geradas e cobradas normalmente até que o cancelamento seja
              formalizado pelo USUÁRIO diretamente na plataforma, conforme
              disposto no artigo 8.1 deste contrato. Tal cobrança se justifica
              pela manutenção dos dados armazenados nos servidores da ATRUPE e
              pela disponibilidade do suporte técnico durante este período.
            </p>
            <p>
              <b>7.7</b> Pagamentos realizados fora do prazo de vencimento serão
              acrescidos de juros de 2% (dois por cento) ao mês, multa de 2%
              (dois por cento) sobre o valor em aberto, e reajuste pelo IGP-M.
            </p>
            <p>
              <b>7.8</b> O valor da mensalidade do presente contrato poderá ser
              reajustado a qualquer momento, desde que comunicado ao USUÁRIO com
              antecedência mínima de 30 (trinta) dias. O reajuste será realizado
              tomando-se por base o índice IGPM-FGV acumulado no período ou
              outro índice oficial que reflita de forma mais precisa a inflação
              do período.
            </p>
            <p>
              <b>Parágrafo único:</b> Poderá também haver renegociação do valor
              do presente contrato em caso de desequilíbrio econômico-financeiro
              para uma das partes, sendo a alteração aplicável após 30 (trinta)
              dias da comunicação prévia, conforme disposto na cláusula 6.3.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">8. DA RESCISÃO:</p>
            <p>
              <b>8.1</b> O presente contrato poderá ser rescindido
              unilateralmente pelo USUÁRIO diretamente através do sistema, sem
              necessidade de justificativa, desde que todas as mensalidades
              geradas até o momento do cancelamento estejam devidamente
              quitadas.
            </p>
            <p>
              <b>8.2</b> Poderá haver rescisão por justo motivo quando houver
              descumprimento de qualquer das cláusulas do presente contrato por
              alguma das partes. A rescisão por justo motivo implica na multa de
              10% sobre o valor correspondente à 12 (doze) mensalidades do
              contrato.
            </p>
            <p>
              <b>8.3</b> Poderá haver rescisão contratual independentemente de
              qualquer aviso ou interpelação judicial ou extrajudicial no caso
              de falência, recuperação judicial, extrajudicial ou liquidação de
              uma das partes.
            </p>
            <p>
              <b>8.4</b> Havendo a rescisão contratual o USUÁRIO fica obrigado,
              ainda assim, ao pagamento dos débitos em atraso, bem como fica
              obrigado a não usar o software após esse período, sob pena de
              responsabilidade civil e criminal.
            </p>
            <p>
              <b>8.5</b> Os dados inseridos pelo USUÁRIO no software estarão
              disponíveis para backup por meio dos relatórios gerados no
              sistema, podendo ser salvos pelo próprio USUÁRIO a qualquer
              momento, desde que o sistema esteja ativo e todas as mensalidades
              estejam devidamente quitadas.
            </p>
            <p>
              <b>Parágrafo único:</b> Após a rescisão contratual, a ATRUPE não
              se responsabilizará pela preservação dos dados inseridos pelo
              USUÁRIO e não terá qualquer obrigação de fornecê-los ou
              disponibilizá-los novamente.
            </p>
            <p>
              <b>8.6</b> Em nenhuma hipótese serão devolvidos quaisquer valores
              pagos pelo USUÁRIO em razão do aceite deste T&C.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">
              9. DA LIMITAÇÃO DA RESPONSABILIDADE DA ATRUPE:
            </p>
            <p>
              <b>9.1</b> Este contrato e seus aditamentos não garantem que o
              software será utilizado de forma ininterrupta e livre de erros ou
              defeitos. Os mecanismos de segurança e estabilidade incorporados
              ao software objeto deste contrato têm limitações próprias, sendo
              que a ATRUPE buscará sempre minimizar e evitar ao máximo a
              inutilização parcial ou integral por meio de seu suporte técnico
              de prevenção, correção, otimização e formação.
            </p>
            <p>
              <b>9.2</b> A ATRUPE não se responsabiliza:
              <br />
              a) por problemas, erros, danos e/ou prejuízos advindos de
              quaisquer alterações efetuadas no software sem sua autorização
              expressa;
              <br />
              b) por problemas, erros, danos e/ou prejuízos advindos de eventual
              negligência, imprudência e/ou imperícia do USUÁRIO ou dos perfis
              por ele cadastrado no sistema na utilização de computador e do
              software, estando estes últimos (USUÁRIO e seus perfis) cientes de
              que a ATRUPE fornece suporte formativo, bem como o uso do software
              fornecido exige pessoas com conhecimentos específicos, nos moldes
              da cláusula 5.7 deste contrato;
              <br />
              c) pelo não funcionamento do software e em consequência o seu
              desuso, em virtude de falta de alimentação de informações
              cadastrais que constitui obrigação do USUÁRIO nos moldes da
              cláusula 5.14;
              <br />
              d) por atos de terceiros que logrem êxito em visualizar, coletar
              ou excluir, por quaisquer meios, as informações inseridas pelo
              USUÁRIO, nem mesmo qualquer perda de informação causada por caso
              fortuito ou força maior;
              <br />
              e) por informações incompletas, incorretas, ou desatualizadas,
              lançadas no sistema pelo USUÁRIO;
              <br />
              f) pela perda de dados lançados no software em razão de problema
              de comunicação na internet ou outros problemas decorrentes de atos
              de terceiros;
              <br />
              g) por ações de terceiros como &apos;vírus&apos; de computador ou
              outros mecanismos externos alheios à vontade das partes, que
              interfiram no bom funcionamento do software;
              <br />
              h) por situações de caso fortuito ou força maior, tais como queda
              ou oscilação de energia, ar-condicionado, elementos radioativos,
              poluentes entre outros;
              <br />
              i) por danos ou prejuízos decorrentes de decisões administrativas,
              gerenciais ou comerciais tomadas com base nas informações
              fornecidas pelo software;
              <br />
              j) pelo uso não autorizado da conta do USUÁRIO por terceiros;
              <br />
              k) por informação pessoal que o USUÁRIO divulgar para terceiros,
              incluindo-se o seu login e senha;
              <br />
              l) pelos danos que o USUÁRIO possa sofrer em razão de ter
              divulgado suas informações pessoais;
              <br />
              m) pelos equipamentos ou plataformas de hardware de propriedade do
              USUÁRIO que servem de equipamento para acesso ao software;
              <br />
              n) por erros decorrentes da utilização de equipamentos ou
              plataformas de hardware de origem inidônea ou fabricado fora das
              especificações recomendadas ou comumente estabelecidas pelos
              fabricantes; bem como equipamentos ou plataformas de hardware que
              não acompanhem o estado da arte;
              <br />
              o) por problemas, erros, danos e/ou prejuízos advindos do sistema
              complementar terceirizado que oferece recurso de geração de nota
              fiscal;
              <br />
              p) por problemas, erros, perda de dados, danos e/ou prejuízos
              advindos do banco de dados em nuvem de empresa terceirizada;
            </p>
            <p>
              <b>9.3</b> Em nenhuma hipótese a responsabilidade do LICENCIANTE
              ultrapassará o montante dos valores pagos pelo USUÁRIO
              relativamente à licença de uso do software.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">10. DA PROPRIEDADE INTELECTUAL</p>
            <p>
              <b>10.1</b> O USUÁRIO reconhece que o software, bem como website,
              logotipos, marcas, documentação técnica e quaisquer outros
              materiais correlatos ao programa são de propriedade da ATRUPE,
              sendo protegidas pela legislação aplicável à propriedade
              intelectual e aos direitos autorais, especialmente as Leis
              9.609/98 e 9.610/98, ficando expressamente proibido a reprodução,
              comunicação, distribuição e transformação dos referidos elementos.
            </p>
            <p>
              <b>10.2</b> Este T&C não transfere ao USUÁRIO nenhum direito sobre
              a propriedade intelectual ou quaisquer outros direitos exclusivos,
              incluindo, patentes, desenhos, marcas, direitos autorais ou sobre
              informações confidenciais, segredos de negócios, ou ainda,
              relacionados à plataforma, de forma integral ou parcial. Não há
              qualquer cessão de direitos ou obrigações além daquelas
              expressamente dispostas neste T&C. Quaisquer direitos não
              expressamente concedidos sob o presente instrumento são
              reservados.
            </p>
            <p>
              <b>10.3</b> Em nenhuma hipótese o USUÁRIO terá acesso ao código
              fonte do software da ATRUPE, e jamais poderá empreender qualquer
              ação que prejudique a organização e/ou o seu uso, sem a
              autorização expressa da ATRUPE.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">11. DISPOSIÇÕES GERAIS:</p>
            <p>
              <b>11.1</b> Este contrato inicia-se a partir do momento em que o
              USUÁRIO efetuar o pagamento da modalidade contratada, prevista no
              Anexo I.
            </p>
            <p>
              <b>11.2</b> O pagamento sinaliza que o USUÁRIO está ciente dos
              termos e condições e que concorda com a sua integralidade.
            </p>
            <p>
              <b>11.3</b> Este contrato possui prazo determinado de 12 (doze)
              meses. Após esse período, não havendo manifestação expressa de
              vontade de rescisão contratual, passará a viger por prazo
              indeterminado, caso em que as cláusulas contratuais continuarão
              produzindo efeito entre as partes.
            </p>
            <p>
              <b>11.4</b> Este T&C obriga as partes e seus sucessores e somente
              o USUÁRIO possui licença não exclusiva para a utilização do
              software. A ATRUPE, na condição de titular dos direitos autorais
              do software objeto deste T&C, possui a liberdade de ceder seus
              direitos à terceiros, independentemente de comunicação e
              autorização do USUÁRIO.
            </p>
            <p>
              <b>11.5</b> As cláusulas do presente contrato serão interpretadas
              restritivamente, nos moldes da Lei 9.609 e 9.610/98.
            </p>
            <p>
              <b>11.6</b> O USUÁRIO autoriza desde já que a ATRUPE tenha acesso
              à relatório de registro de login e logoff efetuados, aos dados
              inseridos no software e relatório com registro de data e horário
              em que houve lançamento de informações pelos perfis cadastrados
              pelo USUÁRIO.
            </p>
            <p>
              <b>11.7</b> Este software não foi desenvolvido por encomenda, mas
              sim para uso genérico, razão pela qual a ATRUPE não pode garantir
              que o software atenderá a todas as necessidades específicas do
              USUÁRIO, limitando-se tão somente àquelas ferramentas previstas
              detalhadamente no item 3 deste contrato.
            </p>
            <p>
              <b>11.8</b> O não exercício pela ATRUPE de quaisquer de seus
              direitos ou faculdades estabelecidas neste T&C não configura
              desistência, transigência ou novação, podendo este, a qualquer
              tempo, exercê-lo em sua plenitude.
            </p>
            <p>
              <b>11.9</b> Havendo situações omissas no presente contrato, essas
              serão resolvidas de comum acordo, mediante reunião das partes para
              tal finalidade, devendo ser elaborado termo aditivo.
            </p>
            <p>
              <b>11.10</b> O USUÁRIO autoriza a utilização de seu nome, pela
              ATRUPE, podendo essa última apresentá-la como seu cliente em peças
              de propaganda e propostas comerciais.
            </p>
            <p>
              <b>11.11</b> Caso qualquer cláusula deste contrato seja julgada
              inválida, nula ou inaplicável por qualquer juízo competente, as
              demais cláusulas permanecerão válidas e em pleno vigor, como se
              tal invalidade, nulidade ou inaplicabilidade não tivesse ocorrido.
            </p>
            <p>
              <b>11.12</b> O conteúdo de cadastro das INFORMAÇÕES registrado no
              sistema é parte integrante e complementar deste T&C, para todos os
              fins de direito.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">12. DA PROTEÇÃO DE DADOS PESSOAIS</p>
            <p>
              <b>12.1 Coleta e Tratamento dos Dados Pessoais:</b> A ATRUPE
              coleta e trata os dados pessoais do USUÁRIO exclusivamente para
              fins relacionados à execução deste contrato, incluindo:
              <br />
              a) Cadastro na plataforma;
              <br />
              b) Prestação dos serviços contratados;
              <br />
              c) Comunicação com o USUÁRIO sobre atualizações, suporte técnico
              ou questões administrativas;
              <br />
              d) Cumprimento de obrigações legais ou regulatórias.
            </p>
            <p>
              <b>12.2 Armazenamento e Segurança dos Dados:</b> Os dados pessoais
              do USUÁRIO atualmente são armazenados em servidores seguros
              fornecidos atualmente pela Amazon Web Services (AWS), reconhecida
              mundialmente por sua confiabilidade e conformidade com padrões
              internacionais de segurança da informação. A infraestrutura conta
              com monitoramento 24 horas por dia, garantindo alta
              disponibilidade e proteção contra acessos não autorizados, perdas
              acidentais ou destruição indevida. A ATRUPE reserva-se o direito
              de alterar o provedor de serviços de armazenamento para outro que
              atenda aos mesmos padrões de segurança e confiabilidade, sempre
              que considerar necessário para garantir a continuidade e melhoria
              dos serviços prestados.
            </p>
            <p>
              Além disso, a ATRUPE adota medidas técnicas e organizacionais
              adicionais para proteger os dados do USUÁRIO, incluindo:
              <br />
              a) Uso de criptografia durante a transmissão de informações
              sensíveis;
              <br />
              b) Controle restrito de acesso aos sistemas internos que processam
              os dados;
              <br />
              c) Monitoramento contínuo das práticas de segurança digital para
              prevenir vulnerabilidades.
            </p>
            <p>
              <b>12.3 Compartilhamento dos Dados:</b> A ATRUPE poderá
              compartilhar os dados pessoais do USUÁRIO com terceiros apenas nas
              seguintes hipóteses:
              <br />
              a) Quando necessário para a prestação dos serviços contratados;
              <br />
              b) Para cumprimento de obrigações legais ou regulatórias;
              <br />
              c) Com parceiros comerciais previamente autorizados pelo USUÁRIO.
            </p>
            <p>
              <b>12.4 Direitos do Titular dos Dados:</b> O USUÁRIO tem direito a
              acessar, corrigir, atualizar ou excluir seus dados pessoais
              armazenados pela ATRUPE, conforme previsto na LGPD. Para exercer
              esses direitos, o USUÁRIO deverá enviar solicitação por meio do
              canal oficial: suporte@atrupe.com.br.
            </p>
            <p>
              <b>12.5 Retenção dos Dados:</b> Os dados pessoais serão mantidos
              pela ATRUPE enquanto durar a relação contratual entre as partes
              e/ou enquanto forem necessários para cumprir obrigações legais ou
              regulatórias. Após o término da relação contratual e observado o
              prazo previsto no item 8.5 deste contrato (relativo ao backup), os
              dados serão excluídos definitivamente.
            </p>
            <p>
              <b>12.6 Consentimento:</b> Ao aceitar este T&C, o USUÁRIO consente
              expressamente com a coleta e tratamento dos seus dados pessoais
              nos termos aqui descritos.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">13. DO FORO DE ELEIÇÃO:</p>
            <p>
              <b>13.1</b> Para dirimir eventuais e não esperadas demandas
              emergentes do presente contrato, elegem as parte o Foro da Comarca
              de Itajaí (SC), renunciando as partes a qualquer outro, por mais
              privilegiado que se apresente.
            </p>
            <p>
              Os contratantes declaram entre si: ter conhecimento integral do
              presente contrato; que o receberam previamente, a fim de que a
              mesma fosse examinada, inclusive com a liberdade de se assessorar
              por advogado de sua confiança; que as cláusulas e condições
              descritas são de inteira e integral compreensão e alcance dos
              objetivos do presente negócio pelo que nada poderá ser alegado
              futuramente sobre não ter tido conhecimento ou ter sido
              surpreendido; que as obrigações assumidas pelas partes estão de
              acordo com sua capacidade de cumpri-las; que se obrigam a guardar,
              tanto na execução como na conclusão do presente contrato os
              princípios da probidade e boa-fé.
            </p>
            <p>Itajaí/SC, 01 de maio de 2025.</p>
            <p>
              Atrupe Sistemas Administrativos
              <br />
              Maicol Igor de Souza
              <br />
              13.205.998/0001-02
            </p>
          </div>
          <div>
            <p className="font-semibold">ANEXO I – TABELA DE PREÇOS AVULSOS</p>

            <div className="mt-4">
              <Table className="border border-gray-400">
                <TableHeader>
                  <TableRow className="border-b border-gray-400">
                    <TableHead className="text-center border-r border-gray-400">
                      PRODUTO
                    </TableHead>
                    <TableHead className="text-center border-r border-gray-400">
                      TAXA DE ADESÃO
                    </TableHead>
                    <TableHead className="text-center border-r border-gray-400">
                      MENSALIDADE
                    </TableHead>
                    <TableHead className="text-center">PERÍODO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plansTableData.map((plan) => (
                    <TableRow
                      key={plan.name}
                      className="h-20 border-b border-gray-400"
                    >
                      <TableCell className="flex items-center gap-2">
                        <Image
                          src={plan.logo}
                          alt={plan.name}
                          width={100}
                          height={0}
                          className="w-auto h-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center border border-gray-400">
                        {plan.subscriptionFee}
                      </TableCell>
                      <TableCell className="text-center border-r border-gray-400">
                        {plan.monthlyFee}
                      </TableCell>
                      <TableCell className="text-center">
                        {plan.period}
                      </TableCell>
                    </TableRow>
                  ))}
                  {additionalServicesData.map((service, index) => (
                    <TableRow
                      key={service.name}
                      className={cn('h-20', {
                        'border-b border-gray-400':
                          index !== additionalServicesData.length - 1,
                      })}
                    >
                      <TableCell className="border-r border-gray-400">
                        {service.name}
                      </TableCell>
                      <TableCell className="text-center border-r border-gray-400">
                        {service.subscriptionFee}
                      </TableCell>
                      <TableCell className="text-center border-r border-gray-400">
                        {service.monthlyFee}
                      </TableCell>
                      <TableCell className="text-center">
                        {service.period}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div
            className={cn(
              'sticky pb-4 pt-12 -bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none transition-opacity duration-300 bg-gradient-to-t from-gray-100 to-gray-100/0',
              isScrolledToEnd && 'opacity-0',
            )}
          >
            <div className="flex h-8 justify-center items-center px-2 gap-2 bg-gray-200 text-gray rounded-full text-xs font-semibold border border-gray-300">
              <IconArrowDown className="size-5" />
              Leia todos os termos antes de aceitar
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => {
              setOpen(false)
              onAgreeChange(false)
            }}
          >
            Recusar
          </Button>
          <Button
            type="button"
            disabled={!isScrolledToEnd}
            onClick={() => {
              setOpen(false)
              onAgreeChange(true)
            }}
            RightIcon={IconCircleCheck}
          >
            Estou de acordo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
