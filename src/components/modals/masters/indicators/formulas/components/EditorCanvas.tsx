import React from "react";
import { Button, Tooltip } from "@heroui/react";
import {
    Calculator,
    AlertCircle,
    CheckCircle2,
    Undo2,
    Trash2
} from "lucide-react";
import { FormulaStep, ValidationResult, getFormulaStatusMessage } from "@/utils/formula";
import { StepChip } from "./StepChip";

export interface EditorCanvasProps {
    steps: FormulaStep[];
    cursorIndex: number | null;
    setCursorIndex: (index: number | null) => void;
    removeStep: (index: number) => void;
    undoLastStep: () => void;
    clearAllSteps: () => void;
    validateCurrent: () => ValidationResult;
    renderToolbar: () => React.ReactNode;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
    steps,
    cursorIndex,
    setCursorIndex,
    removeStep,
    undoLastStep,
    clearAllSteps,
    validateCurrent,
    renderToolbar
}) => {
    const validation = validateCurrent();
    const statusObj = getFormulaStatusMessage(validation, steps.length);

    const statusStyles: Record<string, string> = {
        error: 'bg-danger-50 dark:bg-danger-950/30 text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800',
        success: 'bg-success-50 dark:bg-success-950/30 text-success-600 dark:text-success-400 border-success-200 dark:border-success-800',
        warning: 'bg-warning-50 dark:bg-warning-950/30 text-warning-600 dark:text-warning-400 border-warning-200 dark:border-warning-800',
    };
    const statusBarClass = statusStyles[statusObj.type] ?? 'bg-default-50 dark:bg-default-100/10 text-default-500 border-default-200 dark:border-default-800';

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-content1 rounded-xl border border-default-200 dark:border-default-800 shadow-sm overflow-hidden">
            {renderToolbar()}

            {/* Formula Canvas */}
            <div
                className={`
                    relative flex-1 p-4 flex flex-wrap items-start content-start gap-1.5 cursor-text
                    min-h-[120px] transition-colors
                    ${steps.length === 0 ? 'border-2 border-dashed border-default-200 dark:border-default-700 m-3 rounded-lg bg-default-50/50 dark:bg-default-100/5' : ''}
                `}
            >
                <button
                    type="button"
                    className="absolute inset-0 z-0 bg-transparent border-none cursor-text w-full h-full"
                    onClick={() => setCursorIndex(steps.length)}
                    aria-label="Editor de fórmula"
                />
                {steps.length === 0 && (
                    <div className="relative z-10 pointer-events-none w-full h-full flex flex-col items-center justify-center text-default-400 select-none py-8">
                        <Calculator size={32} className="mb-2 opacity-30" />
                        <span className="text-sm">La fórmula está vacía</span>
                        <span className="text-xs mt-1">Use los controles de arriba para construir su fórmula</span>
                    </div>
                )}

                {steps.map((step, index) => (
                    <React.Fragment key={`${step.type}-${index}`}>
                        {cursorIndex === index && (
                            <div className="relative z-10 w-0.5 h-6 bg-primary rounded-full animate-pulse" />
                        )}
                        <span className="relative z-10 pointer-events-auto">
                            <StepChip step={step} onDelete={() => removeStep(index)} />
                        </span>
                    </React.Fragment>
                ))}
                {cursorIndex === steps.length && steps.length > 0 && (
                    <div className="relative z-10 w-0.5 h-6 bg-primary rounded-full animate-pulse" />
                )}
            </div>

            {/* Status Bar */}
            <div className={`
                px-4 py-2 text-xs border-t flex items-center justify-between
                ${statusBarClass}
            `}>
                <div className="flex items-center gap-2 font-medium">
                    {statusObj.type === 'error' && <AlertCircle size={14} />}
                    {statusObj.type === 'success' && <CheckCircle2 size={14} />}
                    {statusObj.type === 'warning' && <AlertCircle size={14} />}
                    <span>{statusObj.message}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Tooltip content="Deshacer último">
                        <Button
                            size="sm"
                            isIconOnly
                            variant="light"
                            isDisabled={steps.length === 0}
                            onPress={undoLastStep}
                            className="w-7 h-7 min-w-7"
                        >
                            <Undo2 size={14} />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Borrar todo">
                        <Button
                            size="sm"
                            isIconOnly
                            variant="light"
                            color="danger"
                            isDisabled={steps.length === 0}
                            onPress={clearAllSteps}
                            className="w-7 h-7 min-w-7"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};
