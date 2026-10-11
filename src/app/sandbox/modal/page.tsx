'use client'

import React, { useState } from 'react'
import {
  FeedbackModal,
  ModalVariant,
  ModalLayout,
  ModalIntent,
} from '@/components/common/feedback-modal'

export const dynamic = 'force-dynamic'

export default function ModalSandboxPage() {
  const [modalOpen, setModalOpen] = useState(false)

  const [config, setConfig] = useState({
    variant: 'success' as ModalVariant,
    layout: 'vertical' as ModalLayout,
    title: '',
    description: '' as React.ReactNode,
    customIcon: undefined as React.ReactNode | undefined,
    primaryAction: { label: '' } as { label: string; intent?: ModalIntent },
    secondaryAction: undefined as { label: string } | undefined,
    tertiaryAction: undefined as
      | { label: string; intent?: 'neutral' | 'success' | 'danger' }
      | undefined,
    showCheckbox: false,
    footerLayout: 'right' as 'right' | 'left' | 'fill' | 'space-between',
    reverseActions: false,
    footerLeftContent: undefined as React.ReactNode | undefined,
    children: undefined as React.ReactNode | undefined,
  })

  const openModal = (newConfig: Partial<typeof config>) => {
    setConfig(newConfig as typeof config)
    setModalOpen(true)
  }

  // Helpers Básicos omitidos por brevidade neste bloco principal, mas estarão presentes
  const openSuccessVertical = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Aqui vai o título do modal',
      description: 'Aqui vai um texto informando mais detalhes sobre a ação',
      primaryAction: { label: 'Confirmar' },
      secondaryAction: { label: 'Cancelar' },
    })
  const openWarningVertical = () =>
    openModal({
      variant: 'warning',
      layout: 'vertical',
      title: 'Alterações não salvas',
      description: 'Deseja salvar ou descartar as alterações?',
      primaryAction: { label: 'Salvar alterações', intent: 'success' },
      secondaryAction: { label: 'Descartar' },
    })
  const openDangerVertical = () =>
    openModal({
      variant: 'danger',
      layout: 'vertical',
      title: 'Deseja deletar a informação?',
      description: 'Essa ação não pode ser desfeita.',
      primaryAction: { label: 'Deletar', intent: 'danger' },
      secondaryAction: { label: 'Cancelar' },
    })

  // ── Helpers Transacionais (Bloco 1) ──
  const openShareSocial = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Aqui vai o título do modal',
      description: 'Lorem Ipsum is simply dummy text.',
      primaryAction: { label: 'Confirmar' },
      secondaryAction: { label: 'Cancelar' },
      children: (
        <div className="flex flex-col gap-4 w-full mt-2">
          {[
            { label: 'Share on Twitter', bg: '#099260' },
            { label: 'Share on Medium', bg: '#099260' },
            { label: 'Share on Facebook', bg: '#f2f4f7' },
          ].map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-gray-300 bg-white" />
              <p className="text-sm font-medium text-gray-700">{p.label}</p>
            </div>
          ))}
        </div>
      ),
    })

  // ── Helpers Fluxos Avançados (Bloco 2 - Figma Novo) ──

  const openEmailVerification = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Por favor verifique seu email.',
      description: (
        <span className="text-sm text-gray-500">
          Enviamos um código para{' '}
          <strong className="font-semibold text-gray-500">
            maicol@atrupe.com.br
          </strong>
        </span>
      ),
      primaryAction: { label: 'Verificar' },
      secondaryAction: { label: 'Cancelar' },
      children: (
        <div className="flex flex-col items-center gap-4 mt-2 w-full">
          <div className="flex justify-center items-start gap-2 sm:gap-3 w-full">
            {['3', '0', '6', '6'].map((d, i) => (
              <div
                key={i}
                className={`flex justify-center items-center h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-white border shadow-sm ${i === 3 ? 'border-brand-100 border-4' : 'border-brand-300'}`}
              >
                <span className="text-5xl font-medium text-brand-600">{d}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 cursor-pointer hover:underline text-center">
            Não recebeu um código? Clique para reenviar.
          </p>
        </div>
      ),
    })

  const openImageCover = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Aqui vai o título do modal',
      description:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      primaryAction: { label: 'Confirmar' },
      secondaryAction: { label: 'Cancelar' },
      customIcon: (
        <div className="w-full h-[200px] rounded-lg bg-gray-200 overflow-hidden relative flex items-center justify-center">
          <span className="text-gray-400 font-medium">Cover Image</span>
        </div>
      ),
    })

  const openPricingPlan = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Altere seu plano',
      description: 'Preços flexíveis que crescem com você.',
      primaryAction: { label: 'Confirmar' },
      secondaryAction: { label: 'Cancelar' },
      children: (
        <div className="flex flex-col w-full gap-3 mt-2">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-success-50 border border-brand-300 cursor-pointer relative">
            <div className="w-5 h-5 mt-0.5 rounded-full bg-success-500 text-white flex items-center justify-center absolute right-4 top-4">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M11.33 5.5L6.75 10.08L4.66 8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0 text-success-600">
              ◆
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-brand-800">
                Basic plan <span className="text-brand-300 ml-1">$10/mês</span>
              </p>
              <p className="text-sm text-brand-300">
                Up to 10 users and 20GB individual data.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 relative">
            <div className="w-4 h-4 rounded-full border border-gray-300 absolute right-4 top-4" />
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-700">
              ❖
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-700">
                Business plan{' '}
                <span className="text-gray-500 ml-1">$20/mês</span>
              </p>
              <p className="text-sm text-gray-500">
                Up to 20 users and 40GB individual data.
              </p>
            </div>
          </div>
        </div>
      ),
    })

  const openPasswordValidation = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Por favor, insira sua senha',
      description: 'Digite sua senha para fazer essa alteração.',
      primaryAction: { label: 'Sign in' },
      secondaryAction: { label: 'Cancelar' },
      children: (
        <div className="flex flex-col w-full gap-4 mt-2">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">
              Email or username
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm text-base text-gray-900">
              maicol@atrupe.com.br
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm text-base text-gray-500">
              ••••••••
            </div>
          </div>
        </div>
      ),
    })

  const openVideoGuide = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Bem-vindo ao seu painel',
      description:
        'Estamos felizes por ter você a bordo. Aqui estão algumas dicas rápidas.',
      primaryAction: { label: 'Próximo' },
      secondaryAction: { label: 'Pular' },
      customIcon: (
        <div className="w-full h-48 rounded-lg bg-gray-900 border border-gray-800 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center z-10 hover:bg-white/40 cursor-pointer transition-colors">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1" />
          </div>
          <div className="absolute left-6 bottom-6 flex flex-col items-start gap-1 z-10">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-white backdrop-blur-md">
              Part 1
            </span>
            <span className="text-2xl font-medium text-white shadow-sm">
              How to iniciar
            </span>
          </div>
          <div className="absolute left-6 bottom-2 flex gap-1 z-10 w-[80%] h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="w-[15%] h-full bg-white rounded-full" />
          </div>
        </div>
      ),
      children: (
        <div className="flex justify-center items-center gap-3 w-full mt-2">
          <div className="w-2 h-2 rounded-full bg-success-500" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
        </div>
      ),
    })

  const openPaymentUpdate = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Atualizar forma de pagamento',
      description: 'Atualize os dados do seu cartão.',
      primaryAction: { label: 'Atualizar' },
      secondaryAction: { label: 'Cancelar' },
      children: (
        <div className="flex flex-col gap-4 w-full mt-2">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">
              Nome no cartão
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm text-base text-gray-900">
              Olivia Rhye
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">
              Número do cartão
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm text-base text-gray-900 flex items-center gap-2">
              <div className="w-8 h-5 bg-gray-200 rounded flex gap-0.5 p-0.5 items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80 -ml-1.5" />
              </div>
              1234 1234 1234 1234
            </div>
          </div>
          <div className="flex gap-4 w-full">
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-sm font-medium text-gray-700">
                Expira
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm text-base text-gray-900">
                06/2024
              </div>
            </div>
            <div className="flex flex-col gap-1.5 w-1/2">
              <label className="text-sm font-medium text-gray-700">CVV</label>
              <div className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm text-base text-gray-900">
                •••
              </div>
            </div>
          </div>
        </div>
      ),
    })

  const openPaymentCover = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Atualizar forma de pagamento',
      description: 'Atualize os dados do seu cartão.',
      primaryAction: { label: 'Atualizar' },
      secondaryAction: { label: 'Cancelar' },
      customIcon: (
        <div className="w-full h-[254px] rounded-lg bg-gray-900 border border-gray-800 relative flex items-center justify-center overflow-hidden mb-2">
          {/* Glassmorphic Card Simulation */}
          <div className="w-[316px] h-[190px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl relative overflow-hidden p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-white font-semibold tracking-wider">
                Untitled.
              </span>
              <div className="w-10 h-6 bg-white/20 rounded flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">VISA</span>
              </div>
            </div>
            <div className="mt-8">
              <span className="text-white font-mono tracking-widest text-lg drop-shadow-md">
                1234 1234 1234 1234
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-white text-xs font-semibold tracking-widest text-opacity-90">
                OLIVIA RHYE
              </span>
              <span className="text-white text-xs font-semibold tracking-widest text-opacity-90">
                06/24
              </span>
            </div>
          </div>
        </div>
      ),
      children: (
        <div className="flex flex-col gap-4 w-full mt-2">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">
              Nome no cartão
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm text-base text-gray-900">
              Olivia Rhye
            </div>
          </div>
        </div>
      ),
    })

  const openTwoFactorAuth = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Configure a autenticação de dois fatores',
      description:
        'Para autorizar transações, escaneie este código QR com seu aplicativo Google Authenticator e insira o código de verificação abaixo.',
      primaryAction: { label: 'Verificar' },
      secondaryAction: { label: 'Cancelar' },
      children: (
        <div className="flex flex-col w-full gap-4 mt-2 items-center">
          <div className="w-full max-w-[311px] h-32 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center px-4">
            {/* Generic QR box simulation */}
            <div className="w-[100px] h-[100px] border-[8px] border-black p-2 bg-white relative">
              <div className="absolute top-1 left-1 w-4 h-4 bg-black" />
              <div className="absolute top-1 right-1 w-4 h-4 bg-black" />
              <div className="absolute bottom-1 left-1 w-4 h-4 bg-black" />
              <div className="absolute top-6 left-6 w-8 h-8 flex flex-wrap gap-1">
                <div className="w-2 h-2 bg-black" />
                <div className="w-2 h-2 bg-black" />
                <div className="w-2 h-2 bg-white" />
                <div className="w-2 h-2 bg-black" />
                <div className="w-2 h-2 bg-black" />
                <div className="w-2 h-2 bg-white" />
              </div>
            </div>
            <div className="flex flex-col ml-4 gap-1 w-full flex-grow">
              <div className="w-full h-2 bg-black rounded" />
              <div className="w-3/4 h-2 bg-black rounded" />
              <div className="w-1/2 h-2 bg-black rounded" />
              <div className="w-full h-2 bg-black rounded mt-2" />
              <div className="w-5/6 h-2 bg-black rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-gray-700">
              Código de Verificação
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 shadow-sm text-base text-gray-500">
              000 000
            </div>
          </div>
        </div>
      ),
    })

  // ── Helpers Footers (Bloco 3) ──
  const openConfirmLeft = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Confirmar ação?',
      description: 'Exemplo de rodapé alinhado à esquerda.',
      primaryAction: { label: 'Confirmar' },
      secondaryAction: { label: 'Cancelar' },
      footerLayout: 'left',
    })

  const openReverseRight = () =>
    openModal({
      variant: 'danger',
      layout: 'vertical',
      title: 'Apagar registro?',
      description:
        'Exemplo de botões invertidos (Cancelar na esquerda, Deletar na direita).',
      primaryAction: { label: 'Deletar', intent: 'danger' },
      secondaryAction: { label: 'Cancelar' },
      reverseActions: true,
      footerLayout: 'right',
    })

  const openTertiaryAction = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Atualização disponível',
      description: 'O que deseja fazer?',
      primaryAction: { label: 'Confirmar' },
      secondaryAction: { label: 'Cancelar' },
      tertiaryAction: { label: 'Leia mais', intent: 'neutral' },
      footerLayout: 'fill',
    })

  const openLeftConfig = () =>
    openModal({
      variant: 'success',
      layout: 'vertical',
      title: 'Nova feature liberada',
      description: 'Habilite esta funcionalidade em configurações.',
      primaryAction: { label: 'Confirmar' },
      secondaryAction: { label: 'Cancelar' },
      footerLeftContent: (
        <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Configurações
        </button>
      ),
    })

  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-32">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Feedback Modal — Sandbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Catálogo completo de modais construídos sobre a primitiva Base.
          </p>
        </div>

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
            Estruturas Básicas
          </h2>
          <div className="flex gap-4">
            <button
              onClick={openSuccessVertical}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Primitiva Sucesso
            </button>
            <button
              onClick={openWarningVertical}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Primitiva Aviso
            </button>
            <button
              onClick={openDangerVertical}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Primitiva Erro
            </button>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden mt-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
            Avançados - Grupo 1 (Transacionais Iniciais)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={openShareSocial}
              className="px-4 py-3 border rounded-lg hover:bg-gray-50 text-left text-sm"
            >
              Share on Social
            </button>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden mt-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
            Avançados - Grupo 2 (Figma Complementar)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={openEmailVerification}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              OTP Verification (Email)
            </button>
            <button
              onClick={openImageCover}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              Image Cover Banner
            </button>
            <button
              onClick={openVideoGuide}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              Video Player Guide
            </button>
            <button
              onClick={openPricingPlan}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              Pricing / Plan Update
            </button>
            <button
              onClick={openPaymentUpdate}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              Credit Card Form
            </button>
            <button
              onClick={openPaymentCover}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              CC Form + Card Avatar
            </button>
            <button
              onClick={openTwoFactorAuth}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              2FA Setup (QR Code)
            </button>
            <button
              onClick={openPasswordValidation}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              Password Gateway
            </button>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden mt-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
            Avançados - Grupo 3 (Footers do Figma)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={openConfirmLeft}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              Botoões à Esquerda
            </button>
            <button
              onClick={openReverseRight}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              Cancelar na Esq, Deletar na Dir
            </button>
            <button
              onClick={openTertiaryAction}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              Tertiary Action (Leia mais)
            </button>
            <button
              onClick={openLeftConfig}
              className="px-4 py-3 border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 font-medium"
            >
              Link &quot;Configurações&quot; à Esquerda
            </button>
          </div>
        </section>
      </div>

      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        variant={config.variant}
        layout={config.layout}
        title={config.title}
        description={config.description}
        customIcon={config.customIcon}
        primaryAction={{
          label: config.primaryAction.label,
          intent: config.primaryAction.intent,
          onClick: () => setModalOpen(false),
        }}
        secondaryAction={
          config.secondaryAction
            ? {
                label: config.secondaryAction.label,
                onClick: () => setModalOpen(false),
              }
            : undefined
        }
        tertiaryAction={
          config.tertiaryAction
            ? {
                label: config.tertiaryAction.label,
                intent: config.tertiaryAction.intent,
                onClick: () => setModalOpen(false),
              }
            : undefined
        }
        footerLayout={config.footerLayout}
        reverseActions={config.reverseActions}
        footerLeftContent={config.footerLeftContent}
      >
        {config.children}
      </FeedbackModal>
    </div>
  )
}
