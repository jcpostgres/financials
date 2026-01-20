'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DailyClosesPage() {
    const { dailyCloses = [] } = useAppState();
    const { role } = useAuth();
    const { toast } = useToast();

    const handleExport = () => {
        toast({
            title: "Función no disponible",
            description: "La exportación a PDF o Excel no está disponible en este momento.",
            variant: "destructive"
        });
    }

    if (role !== 'admin') {
        return (
            <div>
                <PageHeader title="Acceso Denegado" description="Esta sección es solo para administradores." />
            </div>
        );
    }

    const sortedCloses = [...dailyCloses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <PageHeader title="Cierres de Caja" description="Historial de cierres de caja diarios.">
                <Button onClick={handleExport} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar (No disponible)
                </Button>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Cierres</CardTitle>
                </CardHeader>
                <CardContent>
                    {sortedCloses.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No hay cierres de caja registrados.</p>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {sortedCloses.map(close => (
                                <AccordionItem value={close.id} key={close.id}>
                                    <AccordionTrigger>
                                        <div className="flex justify-between w-full pr-4">
                                            <span>{new Date(close.date).toLocaleDateString()}</span>
                                            <span className="text-green-400">{formatCurrency(close.netProfit)}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <h4 className="font-semibold mb-2">Resumen del Día</h4>
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div><p className="text-sm text-muted-foreground">Ingresos Totales</p><p>{formatCurrency(close.totalIncome)}</p></div>
                                                <div><p className="text-sm text-muted-foreground">Gastos Totales</p><p>{formatCurrency(close.totalExpenses)}</p></div>
                                                <div><p className="text-sm text-muted-foreground">Ganancia Neta</p><p>{formatCurrency(close.netProfit)}</p></div>
                                            </div>
                                            <h4 className="font-semibold mb-2 mt-4">Transacciones ({close.transactions.length})</h4>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Hora</TableHead>
                                                        <TableHead>Método</TableHead>
                                                        <TableHead className="text-right">Monto</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {close.transactions.map(tx => (
                                                        <TableRow key={tx.id}>
                                                            <TableCell>{new Date(tx.endTime).toLocaleTimeString()}</TableCell>
                                                            <TableCell>{tx.paymentMethod}</TableCell>
                                                            <TableCell className="text-right">{formatCurrency(tx.totalAmount)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
