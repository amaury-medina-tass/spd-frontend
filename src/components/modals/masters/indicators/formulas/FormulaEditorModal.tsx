import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Select,
    SelectItem,
    Tabs,
    Tab,
    Spinner,
    Tooltip,
    Card,
    CardBody
} from "@heroui/react";
import {
    Variable as VariableIcon,
    Calculator,
    Save,
    HelpCircle,
    Sparkles,
    Copy,
    CheckCircle,
    ChevronLeft
} from "lucide-react";
import { ReplicateFormulaModal } from "./ReplicateFormulaModal";
import { FormulaGuideModal } from "./FormulaGuideModal";
import { useFormulaEditor } from "./hooks/useFormulaEditor";
import { EditorToolbar } from "./components/EditorToolbar";
import { EditorCanvas } from "./components/EditorCanvas";

interface FormulaEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any, unused?: any) => Promise<void>;
    title?: string;
    indicatorId: string;
    type?: 'action' | 'indicative';
}

export function FormulaEditorModal({
    isOpen,
    onClose,
    onSave,
    title = "Editor de Fórmulas",
    indicatorId,
    type = 'action'
}: FormulaEditorModalProps) {
    const editor = useFormulaEditor({ indicatorId, isOpen, onSave, type });

    const renderToolbar = () => (
        <EditorToolbar
            activeTab={editor.activeTab}
            selectedVariableId={editor.selectedVariableId}
            variables={editor.variables}
            goalIndicators={editor.goalIndicators}
            indicatorQuadrenniums={editor.indicatorQuadrenniums}
            validationState={editor.validationState}
            currentSteps={editor.currentSteps}
            years={editor.years}
            constantValue={editor.constantValue}
            setConstantValue={editor.setConstantValue}
            advanceYear={editor.advanceYear}
            setAdvanceYear={editor.setAdvanceYear}
            advanceMonths={editor.advanceMonths}
            setAdvanceMonths={editor.setAdvanceMonths}
            insertStep={editor.insertStep}
            addConstant={editor.addConstant}
            variableFormulas={editor.variableFormulas}
        />
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            scrollBehavior="inside"
            placement="center"
            classNames={{
                base: "bg-content1 mx-2 sm:mx-4 my-2 sm:my-4",
                header: "border-b border-divider px-4 sm:px-6",
                footer: "border-t border-divider px-4 sm:px-6",
                body: "p-0",
            }}
        >
            <ModalContent className="rounded-2xl overflow-hidden max-h-[95vh] flex flex-col">
                <ModalHeader className="py-3 shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                            <p className="text-xs text-default-400">Configure las fórmulas de cálculo</p>
                        </div>
                        <div className="flex items-center gap-2 mr-6">
                            <span className="text-xs text-default-400">Año:</span>
                            <Select
                                selectedKeys={[editor.selectedYear]}
                                onChange={(e) => editor.setSelectedYear(e.target.value)}
                                size="sm"
                                variant="bordered"
                                className="w-24"
                                aria-label="Año de vigencia"
                                classNames={{
                                    trigger: "h-8 min-h-8 bg-default-50 dark:bg-default-100/20"
                                }}
                            >
                                {editor.years.map((year) => (
                                    <SelectItem key={year}>{year}</SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="flex-1 overflow-hidden flex flex-col">
                    {/* Tabs at Top */}
                    <div className="px-4 pt-4 shrink-0">
                        <Tabs
                            selectedKey={editor.activeTab}
                            onSelectionChange={(key) => editor.setActiveTab(key as string)}
                            variant="solid"
                            color="primary"
                            classNames={{
                                tabList: "bg-default-100 dark:bg-default-50/10 p-1 gap-1",
                                tab: "text-sm font-medium h-9",
                                cursor: "shadow-sm"
                            }}
                        >
                            <Tab
                                key="variables"
                                title={
                                    <div className="flex items-center gap-2">
                                        <VariableIcon size={16} />
                                        <span>Fórmulas de Variables</span>
                                    </div>
                                }
                            />
                            <Tab
                                key="main"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Calculator size={16} />
                                        <span>Fórmula Principal</span>
                                    </div>
                                }
                            />
                        </Tabs>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {editor.isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Spinner size="lg" />
                            </div>
                        ) : (
                            <>
                                {/* Variables Tab */}
                                {editor.activeTab === "variables" && (
                                    <div className="space-y-4">
                                        {/* Variable Selection Cards */}
                                        {!editor.selectedVariableId && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-default-500">
                                                        Seleccione una variable para definir su fórmula de cálculo
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {editor.variables.map(v => {
                                                        const hasFormula = (editor.variableFormulas[v.id]?.length || 0) > 0;
                                                        return (
                                                            <Card
                                                                key={v.id}
                                                                isPressable
                                                                onPress={() => editor.setSelectedVariableId(v.id)}
                                                                className={`
                                                                    border-2 transition-all
                                                                    ${hasFormula
                                                                        ? 'border-success-200 dark:border-success-800 bg-success-50/50 dark:bg-success-900/10'
                                                                        : 'border-default-200 dark:border-default-700 hover:border-primary-300'}
                                                                `}
                                                            >
                                                                <CardBody className="p-4">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="font-semibold text-foreground truncate">
                                                                                {v.code || v.name}
                                                                            </p>
                                                                            {v.code && v.name !== v.code && (
                                                                                <p className="text-xs text-default-400 truncate mt-0.5">
                                                                                    {v.name}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        {hasFormula ? (
                                                                            <CheckCircle size={18} className="text-success-500 shrink-0" />
                                                                        ) : (
                                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning-100 dark:bg-warning-900/30 text-warning-600 shrink-0">
                                                                                Sin fórmula
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </CardBody>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}

                                        {/* Variable Formula Editor */}
                                        {editor.selectedVariableId && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            color="secondary"
                                                            startContent={<ChevronLeft size={14} />}
                                                            onPress={() => editor.setSelectedVariableId(null)}
                                                        >
                                                            Volver
                                                        </Button>
                                                        <div>
                                                            <p className="font-semibold text-foreground">
                                                                {editor.variables.find(v => v.id === editor.selectedVariableId)?.code ||
                                                                    editor.variables.find(v => v.id === editor.selectedVariableId)?.name}
                                                            </p>
                                                            <p className="text-xs text-default-400">
                                                                Defina cómo se calcula esta variable
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {editor.currentSteps.length > 0 && (
                                                        <Tooltip content="Copiar esta fórmula a otras variables">
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                color="secondary"
                                                                startContent={<Copy size={14} />}
                                                                onPress={() => editor.setIsReplicateModalOpen(true)}
                                                            >
                                                                Replicar
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <EditorCanvas
                                                    steps={editor.currentSteps}
                                                    cursorIndex={editor.cursorIndex}
                                                    setCursorIndex={editor.setCursorIndex}
                                                    removeStep={editor.removeStep}
                                                    undoLastStep={editor.undoLastStep}
                                                    clearAllSteps={editor.clearAllSteps}
                                                    validateCurrent={editor.validateCurrent}
                                                    renderToolbar={renderToolbar}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Main Formula Tab */}
                                {editor.activeTab === "main" && (
                                    <div className="space-y-3">
                                        <p className="text-sm text-default-500">
                                            Combine las variables configuradas para calcular el valor final del indicador
                                        </p>
                                        <EditorCanvas
                                            steps={editor.currentSteps}
                                            cursorIndex={editor.cursorIndex}
                                            setCursorIndex={editor.setCursorIndex}
                                            removeStep={editor.removeStep}
                                            undoLastStep={editor.undoLastStep}
                                            clearAllSteps={editor.clearAllSteps}
                                            validateCurrent={editor.validateCurrent}
                                            renderToolbar={renderToolbar}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </ModalBody>

                <ModalFooter className="py-3 shrink-0">
                    <Button
                        variant="light"
                        onPress={() => editor.setIsGuideOpen(true)}
                        startContent={<HelpCircle size={16} />}
                        className="mr-auto"
                    >
                        Ayuda
                    </Button>
                    <Button variant="flat" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={editor.handleSave}
                        isDisabled={editor.mainFormulaSteps.length === 0}
                    >
                        Guardar
                    </Button>
                </ModalFooter>
            </ModalContent>

            {/* Modals */}
            <FormulaGuideModal
                isOpen={editor.isGuideOpen}
                onClose={() => editor.setIsGuideOpen(false)}
            />

            {editor.selectedVariableId && (
                <ReplicateFormulaModal
                    isOpen={editor.isReplicateModalOpen}
                    onClose={() => editor.setIsReplicateModalOpen(false)}
                    sourceVariable={{
                        ...editor.variables.find(v => v.id === editor.selectedVariableId)!,
                        formula: editor.currentSteps
                    }}
                    allVariables={editor.variables}
                    onReplicate={editor.handleReplicate}
                />
            )}
        </Modal>
    );
}
