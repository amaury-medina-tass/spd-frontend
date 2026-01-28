import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    ScrollShadow,
    Divider,
    Chip
} from "@heroui/react";
import {
    HelpCircle,
    Calculator,
    FunctionSquare,
    Variable,
    CheckCircle2,
    TrendingUp,
    Target,
    AlertTriangle,
    Copy,
    Info
} from "lucide-react";

interface FormulaGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FormulaGuideModal = ({ isOpen, onClose }: FormulaGuideModalProps) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            size="3xl" 
            scrollBehavior="inside"
            classNames={{
                backdrop: "bg-black/50"
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 bg-default-50 border-b border-default-100">
                    <div className="flex items-center gap-2 text-primary">
                        <HelpCircle size={24} />
                        <h2 className="text-xl font-bold">Guía de Fórmulas e Indicadores</h2>
                    </div>
                    <p className="text-sm text-default-500 font-normal">
                        Aprenda a construir fórmulas complejas utilizando variables, funciones y datos históricos.
                    </p>
                </ModalHeader>

                <ModalBody className="p-0">
                    <ScrollShadow className="h-[500px] p-4 sm:p-6 space-y-6">
                        
                        {/* Section 1: Workflow */}
                        <section className="bg-warning-50/50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-800 rounded-xl p-4">
                            <h3 className="text-sm font-bold text-warning-700 dark:text-warning-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Info size={16} /> Flujo de Trabajo Recomendado
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-warning-100 text-warning-700 font-bold flex items-center justify-center shrink-0">1</div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Definir Sub-fórmulas de Variables</h4>
                                        <p className="text-sm text-default-500 mt-1">
                                            Antes de usar una variable en la fórmula principal, configure cómo se calcula.
                                            Seleccione una variable del panel (pestaña <span className="inline-flex items-center gap-1 bg-default-100 px-1 rounded text-xs"><Variable size={10}/> Variables</span>).
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-warning-100 text-warning-700 font-bold flex items-center justify-center shrink-0">2</div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Replicar (Opcional)</h4>
                                        <p className="text-sm text-default-500 mt-1">
                                            Si varias variables comparten la misma lógica (ej. consumidos anuales), use el botón 
                                            <span className="inline-flex items-center gap-1 mx-1 bg-default-100 px-1 rounded text-xs font-medium"><Copy size={10}/> Replicar</span>
                                            para copiar la fórmula a otras variables compatibles (que tengan las mismas metas/cuatrenios).
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-warning-100 text-warning-700 font-bold flex items-center justify-center shrink-0">3</div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Fórmula Principal</h4>
                                        <p className="text-sm text-default-500 mt-1">
                                            Una vez configuradas las variables, úselas en la pestaña "Fórmula Principal" para obtener el valor final del indicador.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Divider />

                        {/* Section 2: Elements */}
                        <section>
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Variable size={20} className="text-secondary" /> Elementos Disponibles
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg border border-default-200 dark:border-default-700">
                                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                        <Variable size={16} className="text-primary"/> Variables
                                    </h4>
                                    <p className="text-xs text-default-500 mb-2">
                                        Referencia al valor calculado de otra variable. Requiere que la variable tenga su propia fórmula definida.
                                    </p>
                                    <Chip size="sm" variant="flat" color="primary">VAR_PRESUPUESTO</Chip>
                                </div>

                                <div className="p-3 rounded-lg border border-default-200 dark:border-default-700">
                                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                        <TrendingUp size={16} className="text-warning"/> Avances
                                    </h4>
                                    <p className="text-xs text-default-500 mb-2">
                                        Valor reportado en un periodo (Mes/Año).
                                        <br/>
                                        <span className="text-danger font-medium">* Restricción:</span> Múltiples avances (2+ meses) solo se pueden insertar dentro de funciones vacías como <code>SUMA( )</code>.
                                    </p>
                                    <Chip size="sm" variant="flat" color="warning">Avance 2024</Chip>
                                </div>

                                <div className="p-3 rounded-lg border border-default-200 dark:border-default-700">
                                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                                        <Target size={16} className="text-success"/> Metas
                                    </h4>
                                    <p className="text-xs text-default-500 mb-2">
                                        Valor objetivo de la variable o indicador para un año específico.
                                    </p>
                                    <Chip size="sm" variant="flat" color="success">Meta [2025]</Chip>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Functions */}
                        <section>
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <FunctionSquare size={20} className="text-primary" /> Funciones y Restricciones
                            </h3>
                            <div className="border border-default-200 dark:border-default-700 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-default-50 border-b border-default-200">
                                        <tr>
                                            <th className="p-3 font-semibold text-default-700">Función</th>
                                            <th className="p-3 font-semibold text-default-700">Uso y Restricciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-default-100">
                                        <tr>
                                            <td className="p-3 font-mono text-primary font-medium">SUMA(a, b, ...)</td>
                                            <td className="p-3 text-default-600">
                                                Suma valores. Use comas (<code>,</code>) para separar argumentos.
                                                <br/>
                                                <span className="text-xs text-warning-600 block mt-1">
                                                    Nota: Dentro de SUMA/PROMEDIO, no se permiten operadores (+ -) directos. Use paréntesis internos si necesita operar: <code>SUMA(10, (5+2))</code>.
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono text-primary font-medium">SI(cond, true, false)</td>
                                            <td className="p-3 text-default-600">
                                                Condicional lógico. 
                                                <br/>
                                                Ej: <code>SI(VAR &gt; 100, 1, 0)</code>.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Section 4: Rules */}
                        <section className="bg-default-50 p-4 rounded-xl">
                            <h3 className="text-sm font-bold text-default-700 mb-3 flex items-center gap-2">
                                <CheckCircle2 size={16} /> Reglas Generales
                            </h3>
                            <ul className="text-sm text-default-600 space-y-2 list-disc list-inside">
                                <li>
                                    <strong className="text-foreground">Paréntesis:</strong> Toda función abierta debe cerrarse. El editor le ayudará habilitando/deshabilitando el cierre.
                                </li>
                                <li>
                                    <strong className="text-foreground">Validación Contextual:</strong> Los botones se deshabilitan si la acción no es válida en ese punto (ej. no puede poner dos operadores seguidos).
                                </li>
                                <li>
                                    <strong className="text-foreground">Replicación:</strong> Al replicar, el sistema valida que las variables destino tengan las mismas Metas (por nombre) que la original.
                                </li>
                            </ul>
                        </section>

                    </ScrollShadow>
                </ModalBody>
                <ModalFooter className="bg-default-50 border-t border-default-100">
                    <Button color="primary" onPress={onClose}>
                        Entendido
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
