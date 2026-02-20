import React, { useMemo, useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Checkbox,
    Chip,
    ScrollShadow
} from "@heroui/react";
import { Copy, AlertCircle } from "lucide-react";
import { Variable, FormulaStep } from "@/utils/formula";

function validateTargetMapping(
    sourceSteps: FormulaStep[],
    target: Variable
): ValidationResult {
    const mappedSteps: FormulaStep[] = [];

    for (const step of sourceSteps) {
        if (step.type === 'variable' && step.value.id === target.id) {
            return { isValid: false, reason: "Referencia circular: La fórmula origen usa esta variable." };
        }

        if (step.type === 'goal_variable') {
            const sourceYear = step.value.year;
            const match = target.goals?.find(g => g.year === sourceYear);
            if (!match) {
                return { isValid: false, reason: `Falta meta para el año ${sourceYear}` };
            }
            mappedSteps.push({ ...step, value: { ...match, label: `Meta [${match.year}]` } });
            continue;
        }

        if (step.type === 'quadrennium_variable') {
            const sourceStart = step.value.startYear;
            const sourceEnd = step.value.endYear;
            const match = target.quadrenniums?.find(q =>
                q.startYear === sourceStart && q.endYear === sourceEnd
            );
            if (!match) {
                return { isValid: false, reason: `Falta cuatrenio ${sourceStart}-${sourceEnd}` };
            }
            mappedSteps.push({ ...step, value: { ...match, label: `Cuatrenio [${match.startYear}-${match.endYear}]` } });
            continue;
        }

        mappedSteps.push(step);
    }

    return { isValid: true, mappedSteps };
}

interface ReplicateFormulaModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceVariable: Variable | null;
    allVariables: Variable[];
    onReplicate: (targetIds: string[], mappedFormulas: Record<string, FormulaStep[]>) => void;
}

interface ValidationResult {
    isValid: boolean;
    reason?: string;
    mappedSteps?: FormulaStep[];
}

export const ReplicateFormulaModal = ({
    isOpen,
    onClose,
    sourceVariable,
    allVariables,
    onReplicate
}: ReplicateFormulaModalProps) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Calculate validation status for all potential targets
    const validationMap = useMemo(() => {
        const map: Record<string, ValidationResult> = {};
        if (!sourceVariable?.formula) return map;

        const sourceSteps = sourceVariable.formula;

        allVariables.forEach(target => {
            if (target.id === sourceVariable.id) return;
            map[target.id] = validateTargetMapping(sourceSteps, target);
        });

        return map;
    }, [sourceVariable, allVariables]);

    // Candidates are valid variables excluding source
    const candidates = useMemo(() => {
        return allVariables.filter(v => v.id !== sourceVariable?.id);
    }, [allVariables, sourceVariable]);

    const handleToggle = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleToggleAll = () => {
        const validCandidates = candidates.filter(v => validationMap[v.id]?.isValid);
        if (selectedIds.size === validCandidates.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(validCandidates.map(v => v.id)));
        }
    };

    const handleConfirm = () => {
        const mappedFormulas: Record<string, FormulaStep[]> = {};
        selectedIds.forEach(id => {
            const validResult = validationMap[id];
            if (validResult?.mappedSteps) {
                mappedFormulas[id] = validResult.mappedSteps;
            }
        });
        onReplicate(Array.from(selectedIds), mappedFormulas);
        onClose();
        setSelectedIds(new Set());
    };

    // Reset selection on open
    useEffect(() => {
        if (isOpen) setSelectedIds(new Set());
    }, [isOpen]);

    const validCount = candidates.filter(v => validationMap[v.id]?.isValid).length;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Copy size={20} className="text-primary" />
                        <h3>Replicar Fórmula</h3>
                    </div>
                    <p className="text-sm font-normal text-default-500">
                        Copiar la fórmula de <span className="font-semibold text-foreground">{sourceVariable?.name}</span> a otras variables compatibles.
                    </p>
                </ModalHeader>
                <ModalBody>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-default-500">{selectedIds.size} seleccionados</span>
                        <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={handleToggleAll}
                            isDisabled={validCount === 0}
                        >
                            {selectedIds.size === validCount ? "Deseleccionar todos" : "Seleccionar válidos"}
                        </Button>
                    </div>

                    <ScrollShadow className="h-[300px] border border-default-200 dark:border-default-700 rounded-xl divide-y divide-default-100 dark:divide-default-800">
                        {candidates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-default-400">
                                <span>No hay otras variables disponibles</span>
                            </div>
                        ) : (
                            candidates.map(variable => {
                                const validation = validationMap[variable.id];
                                const isSelected = selectedIds.has(variable.id);

                                return (
                                    <div
                                        key={variable.id}
                                        className={`p-3 flex items-center gap-3 transition-colors ${validation?.isValid ? 'hover:bg-default-50' : 'opacity-60 bg-danger-50/20'}`}
                                    >
                                        <Checkbox
                                            isSelected={isSelected}
                                            onValueChange={() => handleToggle(variable.id)}
                                            isDisabled={!validation?.isValid}
                                            classNames={{ wrapper: "shrink-0" }}
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-medium truncate">
                                                    {variable.name}
                                                </span>
                                                {variable.code && (
                                                    <Chip size="sm" variant="flat" className="h-5 text-[10px] px-1">
                                                        {variable.code}
                                                    </Chip>
                                                )}
                                            </div>

                                            {!validation?.isValid && (
                                                <div className="flex items-center gap-1.5 text-danger text-xs">
                                                    <AlertCircle size={12} />
                                                    <span>{validation?.reason}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </ScrollShadow>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleConfirm}
                        isDisabled={selectedIds.size === 0}
                        startContent={<Copy size={16} />}
                    >
                        Replicar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
