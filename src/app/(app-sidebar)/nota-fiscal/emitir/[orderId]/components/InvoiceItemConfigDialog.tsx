'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

// UI
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

// Types
import type { NfePrepareItem } from '@/types/fiscal/nfe-prepare'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    item: NfePrepareItem
    onSave: (updatedItem: NfePrepareItem) => void
}

export function InvoiceItemConfigDialog({
    open,
    onOpenChange,
    item,
    onSave,
}: Props) {
    const [formData, setFormData] = useState<NfePrepareItem>(item)

    useEffect(() => {
        setFormData(item)
    }, [item, open])

    const updateField = (field: keyof NfePrepareItem, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSave = () => {
        if (formData.ncm && formData.ncm.replace(/\D/g, '').length !== 8) {
            toast.error('O NCM deve conter 8 dígitos')
            return
        }

        onSave({
            ...formData,
            needsConfiguration: false, // Assume configured after save
        })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Configuração Fiscal do Item</DialogTitle>
                    <div className="text-sm text-gray-500">
                        {item.itemNumber} - {item.description}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                        <div className="space-y-2">
                            <Label>NCM</Label>
                            <Input
                                value={formData.ncm || ''}
                                onChange={(e) => updateField('ncm', e.target.value)}
                                maxLength={8}
                                placeholder="0000.00.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CFOP</Label>
                            <Input
                                value={formData.cfop || ''}
                                onChange={(e) => updateField('cfop', e.target.value)}
                                maxLength={4}
                                placeholder="5102"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>EAN (GTIN)</Label>
                            <Input
                                value={formData.ean || ''}
                                onChange={(e) => updateField('ean', e.target.value)}
                                placeholder="SEM GTIN"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>EAN Tributável</Label>
                            <Input
                                value={formData.ceantrib || ''}
                                onChange={(e) => updateField('ceantrib', e.target.value)}
                                placeholder="SEM GTIN"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Unidade Comercial</Label>
                            <Input
                                value={formData.uCom || ''}
                                onChange={(e) => updateField('uCom', e.target.value)}
                                placeholder="UN"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Código do Produto</Label>
                            <Input
                                value={formData.productCode || ''}
                                onChange={(e) => updateField('productCode', e.target.value)}
                            />
                        </div>

                        {/* ICMS */}
                        <div className="md:col-span-2 pt-2 pb-1 border-b border-gray-100 font-medium text-gray-700">
                            ICMS / PIS / COFINS
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>CST ICMS / CSOSN</Label>
                            <Select
                                value={formData.cstIcms}
                                onValueChange={(val) => updateField('cstIcms', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="101">
                                        101 - Tributada pelo Simples Nacional com permissão de crédito
                                    </SelectItem>
                                    <SelectItem value="102">
                                        102 - Tributada pelo Simples Nacional sem permissão de crédito
                                    </SelectItem>
                                    <SelectItem value="103">
                                        103 - Isenção do ICMS no Simples Nacional para faixa de
                                        receita bruta
                                    </SelectItem>
                                    <SelectItem value="201">
                                        201 - Tributada pelo Simples Nacional com permissão de crédito e cobrança do ICMS ST
                                    </SelectItem>
                                    <SelectItem value="202">
                                        202 - Tributada pelo Simples Nacional sem permissão de crédito e cobrança do ICMS ST
                                    </SelectItem>
                                    <SelectItem value="203">
                                        203 - Isenção do ICMS no Simples Nacional para faixa de receita bruta e cobrança do ICMS ST
                                    </SelectItem>
                                    <SelectItem value="300">
                                        300 - Imune
                                    </SelectItem>
                                    <SelectItem value="400">
                                        400 - Não tributada pelo Simples Nacional
                                    </SelectItem>
                                    <SelectItem value="500">
                                        500 - ICMS cobrado anteriormente por substituição tributária
                                        (substituído) ou por antecipação
                                    </SelectItem>
                                    <SelectItem value="900">900 - Outros</SelectItem>
                                    <SelectItem value="00">00 - Tributada integralmente</SelectItem>
                                    <SelectItem value="10">
                                        10 - Tributada e com cobrança do ICMS por substituição
                                        tributária
                                    </SelectItem>
                                    <SelectItem value="20">20 - Com redução de base de cálculo</SelectItem>
                                    <SelectItem value="30">
                                        30 - Isenta ou não tributada e com cobrança do ICMS por
                                        substituição tributária
                                    </SelectItem>
                                    <SelectItem value="40">40 - Isenta</SelectItem>
                                    <SelectItem value="41">41 - Não tributada</SelectItem>
                                    <SelectItem value="50">50 - Suspensão</SelectItem>
                                    <SelectItem value="51">51 - Diferimento</SelectItem>
                                    <SelectItem value="60">
                                        60 - ICMS cobrado anteriormente por substituição tributária
                                    </SelectItem>
                                    <SelectItem value="70">
                                        70 - Com redução de base de cálculo e cobrança do ICMS por
                                        substituição tributária
                                    </SelectItem>
                                    <SelectItem value="90">90 - Outros (Regime Normal)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>CST PIS</Label>
                            <Input
                                value={formData.cstPis || ''}
                                onChange={(e) => updateField('cstPis', e.target.value)}
                                maxLength={2}
                                placeholder="01, 07, 49..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CST COFINS</Label>
                            <Input
                                value={formData.cstCofins || ''}
                                onChange={(e) => updateField('cstCofins', e.target.value)}
                                maxLength={2}
                                placeholder="01, 07, 49..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CST IPI</Label>
                            <Input
                                value={formData.cstIpi || ''}
                                onChange={(e) => updateField('cstIpi', e.target.value)}
                                placeholder="50, 52, 53..."
                            />
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2">
                    <Button variant="neutralOutline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleSave}>
                        Salvar Configuração
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
