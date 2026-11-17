'use client'

// Vitrine da gráfica offset (área 8 do openspec, §3.11.1 e §3.11.2, 17/11/2026):
// as telas do PRO com o cálculo de verdade, para conferir o desenho e as
// regras sem depender da API. O item no orçamento (cores, papel, sangria,
// tira e retira, escolha da máquina), a máquina offset no patrimônio (OF-7)
// e a tabela de tiragens. Começa no exemplo do cliente de 29/10: 50.000
// panfletos 10 × 21, 4x4, couché 90.

import { useMemo, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heading, Text } from '@/components/ui/typography'

import {
  CLIENT_JOB,
  MACHINES,
  PAPERS,
  rank,
  type OffsetJob,
  type OffsetMachine,
} from './calc'
import { OffsetItem } from './components/OffsetItem'
import { OffsetMachines } from './components/OffsetMachines'
import { OffsetRuns } from './components/OffsetRuns'

export const dynamic = 'force-dynamic'

export default function OffsetSandbox() {
  const [job, setJob] = useState<OffsetJob>(CLIENT_JOB)
  const [paperId, setPaperId] = useState(PAPERS[0].id)
  const [machines, setMachines] = useState<OffsetMachine[]>(MACHINES)
  const [machineId, setMachineId] = useState(MACHINES[2].id)
  const [chosenId, setChosenId] = useState('AUTO')
  const [markup, setMarkup] = useState(2)

  const paper = PAPERS.find((item) => item.id === paperId) || PAPERS[0]
  const { viable, unfit } = useMemo(
    () => rank(job, paper, machines),
    [job, paper, machines],
  )

  return (
    <main className="min-h-screen space-y-6 bg-gray-100 p-6">
      <header className="space-y-1">
        <Heading as="h1">Gráfica offset</Heading>
        <Text variant="page-subtitle">
          As telas da offset no Pro, com o cálculo de verdade e dados de
          exemplo. Começa no caso do cliente: 50.000 panfletos 10 × 21 cm, 4x4,
          em couché 90 g.
        </Text>
      </header>

      <Tabs defaultValue="item" variant="underline" intent="brand">
        <TabsList>
          <TabsTrigger value="item">Item no orçamento</TabsTrigger>
          <TabsTrigger value="maquinas">Máquina offset</TabsTrigger>
          <TabsTrigger value="tiragens">Tiragens</TabsTrigger>
        </TabsList>

        <TabsContent value="item" className="pt-4">
          <OffsetItem
            job={job}
            onJob={setJob}
            papers={PAPERS}
            paper={paper}
            onPaperId={setPaperId}
            viable={viable}
            unfit={unfit}
            chosenId={chosenId}
            onChosenId={setChosenId}
            markup={markup}
            onMarkup={setMarkup}
          />
        </TabsContent>

        <TabsContent value="maquinas" className="pt-4">
          <OffsetMachines
            machines={machines}
            machineId={machineId}
            onMachineId={setMachineId}
            onChange={(next) =>
              setMachines((current) =>
                current.map((item) => (item.id === next.id ? next : item)),
              )
            }
          />
        </TabsContent>

        <TabsContent value="tiragens" className="pt-4">
          <OffsetRuns
            job={job}
            paper={paper}
            machines={machines}
            markup={markup}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
