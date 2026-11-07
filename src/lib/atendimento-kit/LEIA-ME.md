# Cópia da base do kit de atendimento (parte do navegador)

Estes arquivos são cópia exata de `atrupe-back/atendimento/base/ui` e `atrupe-back/atendimento/base/shared`
(kit `whatsapp-support` 1.0.0). **Não edite aqui**: a adaptação ao Atrupe fica em
`src/app/(app-sidebar)/admin/atendimento/_components/` e em `src/app/api/atendimento/`.

O kit fica instalado no backend, que é onde roda o servidor do atendimento. Quando o kit for atualizado lá
(`kit.mjs update atendimento`), copie de novo, sem mudar nada:

```
cp ../atrupe-back/atendimento/base/ui/{client,connect}.{mjs,d.mts} src/lib/atendimento-kit/ui/
cp ../atrupe-back/atendimento/base/shared/{settings,report}.{mjs,d.mts} src/lib/atendimento-kit/shared/
```

`validateSettings` (em `shared/settings.mjs`) é a mesma regra que a API usa para gravar o contexto do robô:
a tela confere antes de enviar, e a API confere de novo.
