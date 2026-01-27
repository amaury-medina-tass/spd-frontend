import React, { useState, useEffect, useMemo, useRef } from "react"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Card,
    CardBody,
    Input,
    Select,
    SelectItem,
    Chip,
    Divider,
    Spacer,
    Tooltip,
    Spinner,
    Listbox,
    ListboxItem
} from "@heroui/react"
import {
    Calendar,
    Search,
    Info,
    ChevronRight,
    Calculator,
    Save,
    X,
    Trash2,
    Plus,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Variable as VariableIcon,
    FunctionSquare,
    Type
} from "lucide-react"

import {
    FormulaStep,
    Variable,
    GoalVariable,
    GoalIndicator,
    ValidationResult,
    parseFormulaString,
    validateFormula,
    buildAST,
    getFormulaStatusMessage,
    FORMULA_FUNCTIONS,
    FORMULA_OPERATORS,
    COMPARISON_OPERATORS
} from "@/utils/formula"

// --- Types ---
interface FormulaEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formula: string, ast: any) => Promise<void>;
    initialFormula?: string;
    variables?: Variable[];
    goalsVariables?: GoalVariable[];
    goalsIndicators?: GoalIndicator[];
    title?: string;
    indicatorId: string; // Added to match reference data prop
}

// --- Icons / Helpers ---
const StepChip = ({ step, onDelete }: { step: FormulaStep; onDelete?: () => void }) => {
    let color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" = "default";
    let icon = null;

    switch (step.type) {
        case 'variable':
            color = "primary";
            icon = <VariableIcon size={12} />;
            break;
        case 'function':
            color = "secondary";
            icon = <FunctionSquare size={12} />;
            break;
        case 'operator':
        case 'comparison':
            color = "warning";
            break;
        case 'constant':
            color = "default";
            icon = <Type size={12} />;
            break;
        case 'goal_variable':
        case 'goal_indicator':
            color = "success";
            break;
        case 'baseline':
            color = "secondary";
            break;
    }

    return (
        <Chip
            size="sm"
            variant="flat"
            color={color}
            onClose={onDelete}
            startContent={icon ? <span className="ml-1">{icon}</span> : undefined}
            className="m-0.5"
        >
            {step.type === 'variable' ? step.value.name :
             step.type === 'function' ? step.value.name :
             step.type === 'operator' ? step.value.symbol :
             step.type === 'comparison' ? step.value.symbol :
             step.type === 'constant' ? step.value :
             step.type === 'goal_variable' ? step.value.label :
             step.type === 'goal_indicator' ? step.value.label :
             step.type === 'baseline' ? step.value.label :
             step.value}
        </Chip>
    );
};

export function FormulaEditorModal({
    isOpen,
    onClose,
    onSave,
    initialFormula = "",
    variables: initialVariables = [],
    goalsVariables: initialGoalsVariables = [],
    goalsIndicators: initialGoalsIndicators = [],
    title = "Editor de Fórmulas",
    indicatorId
}: FormulaEditorModalProps) {
    // --- State ---
    const [dateFilter, setDateFilter] = useState<{ year: string, month: string }>({
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString().padStart(2, '0')
    });
    
    // Data Loading State
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Formula Data State
    const [variables, setVariables] = useState<Variable[]>(initialVariables);
    const [goalsVariables, setGoalsVariables] = useState<GoalVariable[]>(initialGoalsVariables);
    const [goalsIndicators, setGoalsIndicators] = useState<GoalIndicator[]>(initialGoalsIndicators);
    
    // Editor State
    const [formulaSteps, setFormulaSteps] = useState<FormulaStep[]>([]);
    const [cursorIndex, setCursorIndex] = useState<number | null>(null);
    const [validation, setValidation] = useState<ValidationResult>({ isValid: true, isComplete: false, errors: [], warnings: [], canSave: false });

    // Mode
    const [isEditMode, setIsEditMode] = useState(false);

    // --- Effects ---

    // Initial load simulation (mimicking handlefilterDate from reference)
    const handleLoadData = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            // In a real app, we would fetch data based on dateFilter here
            // For now, we use the props or mocks, but mark as loaded
            
            // Mock data if empty for demonstration
            if (variables.length === 0) {
                 setVariables([
                    { id: 'VAR_001', name: 'Total Ventas', formula: [] },
                    { id: 'VAR_002', name: 'Costos Operativos', formula: [] },
                    { id: 'VAR_003', name: 'Numero Empleados', formula: [] }
                ]);
            }
            if (goalsVariables.length === 0) {
                 setGoalsVariables([{ idMeta: 'META_V1', valorMeta: '1000' }]);
            }
            if (goalsIndicators.length === 0) {
                 setGoalsIndicators([{ idMeta: 'META_I1', metaIndicador: '95%' }]);
            }

            // Parse initial formula if exists and first load
            if (initialFormula && !isLoaded) {
                const parsed = parseFormulaString(initialFormula, variables, goalsVariables, goalsIndicators);
                setFormulaSteps(parsed);
                setIsEditMode(true);
            }

            setIsLoading(false);
            setIsLoaded(true);
        }, 1000);
    };

    // Auto-validate when steps change
    useEffect(() => {
        const result = validateFormula(formulaSteps);
        setValidation(result);
    }, [formulaSteps]);

    // --- Helpers ---

    const insertStep = (step: FormulaStep) => {
        const newSteps = [...formulaSteps];
        const insertPos = cursorIndex !== null ? cursorIndex : newSteps.length;
        newSteps.splice(insertPos, 0, step);
        setFormulaSteps(newSteps);
        setCursorIndex(insertPos + 1);
    };

    const removeStep = (index: number) => {
        const newSteps = [...formulaSteps];
        newSteps.splice(index, 1);
        setFormulaSteps(newSteps);
        if (cursorIndex !== null && cursorIndex > index) {
            setCursorIndex(cursorIndex - 1);
        }
    };

    const handleSave = async () => {
        if (!validation.canSave) return;
        
        // Build Formula String
        const formulaString = formulaSteps.map(s => {
            if (s.type === 'variable') return `[${s.value.id}]`;
            if (s.type === 'goal_variable') return `[MV:${s.value.idMeta}]`;
            if (s.type === 'goal_indicator') return `[MI:${s.value.idMeta}]`;
            if (s.type === 'baseline') return `[LINEA_BASE]`;
            if (s.type === 'function') return `${s.value.id}(`;
            if (s.type === 'operator') return s.value.symbol;
            if (s.type === 'comparison') return s.value.symbol;
            return s.value;
        }).join(' ');

        const ast = buildAST(formulaSteps);
        await onSave(formulaString, ast);
        onClose();
    };

    const statusObj = getFormulaStatusMessage(validation, formulaSteps.length);

    // --- Render Sections ---

    // 1. Filters Section (Replica of 'Filtros de Búsqueda')
    const renderFilters = () => (
        <Card className="shadow-sm border border-default-200">
            <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-bold text-default-700">Filtros de Búsqueda</h3>
                    <Tooltip content="Los filtros se aplican para el filtrado de las metas de variables y metas de indicadores">
                        <Info size={16} className="text-default-400 cursor-help" />
                    </Tooltip>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-end">
                     <div className="flex gap-2 flex-grow max-w-md">
                        <Select
                            label="Año"
                            size="sm"
                            selectedKeys={[dateFilter.year]}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, year: e.target.value }))}
                            className="w-32"
                        >
                            {[2023, 2024, 2025, 2026, 2027].map(y => (
                                <SelectItem key={y.toString()}>{y.toString()}</SelectItem>
                            ))}
                        </Select>
                        <Select
                            label="Mes"
                            size="sm"
                            selectedKeys={[dateFilter.month]}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, month: e.target.value }))}
                            className="flex-grow"
                        >
                             <SelectItem key="01">Enero</SelectItem>
                             <SelectItem key="02">Febrero</SelectItem>
                             <SelectItem key="03">Marzo</SelectItem>
                             <SelectItem key="04">Abril</SelectItem>
                             <SelectItem key="05">Mayo</SelectItem>
                             <SelectItem key="06">Junio</SelectItem>
                             <SelectItem key="07">Julio</SelectItem>
                             <SelectItem key="08">Agosto</SelectItem>
                             <SelectItem key="09">Septiembre</SelectItem>
                             <SelectItem key="10">Octubre</SelectItem>
                             <SelectItem key="11">Noviembre</SelectItem>
                             <SelectItem key="12">Diciembre</SelectItem>
                        </Select>
                     </div>
                     <Button 
                        color="primary" 
                        onPress={handleLoadData}
                        isLoading={isLoading}
                        isDisabled={isLoading}
                        className="w-full md:w-auto"
                    >
                        Cargar
                    </Button>
                </div>
            </CardBody>
        </Card>
    );

    // 2. Variable Manager Section (Placeholder/Replica of VariableManager)
    // Note: The reference has a full VariableManager component. We will simplify it here as a list 
    // since we are focusing on the main editor, but showing the structure is key.
    const renderVariableManager = () => (
        <div className="mt-4">
            {/* Logic handling for Variables would go here (add/edit/delete sub-formulas) */}
            {/* For now, we simply list them as 'Calculadas' or allow selection if they were editable */}
            <Card className="border border-default-200 bg-default-50/50">
                <CardBody className="py-3 px-4 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-2">
                         <VariableIcon size={18} className="text-primary" />
                         <span className="text-small font-medium text-default-600">Variables Disponibles: {variables.length}</span>
                    </div>
                    {/* Placeholder for variable management actions */}
                    {variables.length === 0 && <span className="text-tiny text-default-400">No se encontraron variables para este periodo.</span>}
                </CardBody>
            </Card>
        </div>
    );

    // 3. Formula Editor Section (Replica of FormulaEditor)
    const renderFormulaEditor = () => (
        <div className="mt-6">
            <h3 className="text-medium font-medium text-default-800 mb-1">2. Fórmula Principal</h3>
            <p className="text-small text-default-500 mb-4">
                Construya la fórmula principal utilizando las variables configuradas anteriormente. 
                Solo se pueden utilizar variables que tengan una sub-fórmula definida (simulado).
            </p>

            {/* Editor Container */}
            <Card className="border border-default-300 shadow-sm bg-content1 overflow-visible">
                <CardBody className="p-0">
                    
                    {/* Toolbar of Inputs (Variables, Operators, Functions) */}
                    <div className="p-3 border-b border-default-200 bg-default-50 flex flex-wrap gap-2 items-center">
                         {/* Variables Dropdown */}
                         <Select 
                            placeholder="Variables" 
                            size="sm" 
                            className="w-40" 
                            aria-label="Insertar Variable"
                            onChange={(e) => {
                                const v = variables.find(x => x.id === e.target.value);
                                if(v) insertStep({ type: 'variable', value: v });
                            }}
                        >
                            {variables.map(v => <SelectItem key={v.id}>{v.name}</SelectItem>)}
                        </Select>

                        <Divider orientation="vertical" className="h-6" />

                        {/* Operators */}
                        <div className="flex gap-1">
                            {FORMULA_OPERATORS.map(op => (
                                <Button key={op.id} size="sm" isIconOnly variant="flat" onPress={() => insertStep({ type: 'operator', value: op })}>
                                    {op.symbol}
                                </Button>
                            ))}
                        </div>

                         <Divider orientation="vertical" className="h-6" />
                        
                        {/* Functions */}
                        <Select 
                            placeholder="Funciones" 
                            size="sm" 
                            className="w-32"
                            onChange={(e) => {
                                const f = FORMULA_FUNCTIONS.find(x => x.id === e.target.value);
                                if(f) insertStep({ type: 'function', value: f });
                            }}
                        >
                            {FORMULA_FUNCTIONS.map(f => <SelectItem key={f.id}>{f.name}</SelectItem>)}
                        </Select>

                         {/* Constants */}
                         <div className="flex gap-1 items-center ml-2">
                             <Button size="sm" isIconOnly variant="flat" onPress={() => insertStep({ type: 'parenthesis', value: '(' })}>(</Button>
                             <Button size="sm" isIconOnly variant="flat" onPress={() => insertStep({ type: 'parenthesis', value: ')' })}>)</Button>
                             <Button size="sm" isIconOnly variant="flat" onPress={() => insertStep({ type: 'separator', value: ',' })}>,</Button>
                         </div>
                    </div>

                    {/* Visual Editor Area */}
                    <div 
                        className="min-h-[150px] p-4 flex flex-wrap items-start content-start gap-1 cursor-text"
                        onClick={() => setCursorIndex(formulaSteps.length)}
                    >
                         {formulaSteps.length === 0 && (
                            <span className="text-default-300 italic select-none">La fórmula está vacía. Seleccione elementos arriba para comenzar.</span>
                         )}
                         
                         {formulaSteps.map((step, index) => (
                            <React.Fragment key={index}>
                                {/* Cursor Position Indicator */}
                                {cursorIndex === index && (
                                    <div className="w-0.5 h-6 bg-primary animate-pulse mx-0.5" />
                                )}
                                <StepChip step={step} onDelete={() => removeStep(index)} />
                            </React.Fragment>
                         ))}
                         {/* End Cursor */}
                         {cursorIndex === formulaSteps.length && (
                             <div className="w-0.5 h-6 bg-primary animate-pulse mx-0.5" />
                         )}
                    </div>

                    {/* Status Footer */}
                    <div className={`p-2 px-4 text-small border-t ${
                        statusObj.type === 'error' ? 'bg-danger-50 text-danger border-danger-200' :
                        statusObj.type === 'success' ? 'bg-success-50 text-success border-success-200' :
                        statusObj.type === 'warning' ? 'bg-warning-50 text-warning border-warning-200' :
                        'bg-default-100 text-default-500 border-default-200'
                    } flex justify-between items-center`}>
                        <div className="flex items-center gap-2">
                            {statusObj.type === 'error' && <AlertCircle size={16} />}
                            {statusObj.type === 'success' && <CheckCircle2 size={16} />}
                            {statusObj.type === 'warning' && <AlertCircle size={16} />}
                            <span>{statusObj.message}</span>
                        </div>
                        <span className="text-tiny opacity-70">
                            {formulaSteps.length} items
                        </span>
                    </div>

                </CardBody>
            </Card>
        </div>
    );

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            size="3xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <span>{title}</span>
                    <span className="text-small font-normal text-default-500">
                        Definición de fórmula para indicador
                    </span>
                </ModalHeader>
                
                <ModalBody className="pb-8">
                    {/* 1. Filters */}
                    {renderFilters()}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <Spinner label="Cargando datos..." color="primary" />
                        </div>
                    )}

                    {/* Loaded State */}
                    {!isLoading && isLoaded && (
                        <div className="animate-fade-in">
                            {/* 2. Variable Manager (Replica Structure) */}
                            {renderVariableManager()}

                            {/* 3. Formula Editor (Replica Structure) */}
                            {renderFormulaEditor()}
                        </div>
                    )}
                </ModalBody>

                <ModalFooter className="border-t border-divider">
                     <Button 
                        variant="light" 
                        onPress={() => window.open('#', '_blank')} 
                        className="mr-auto text-primary"
                        startContent={<HelpCircle size={18} />}
                    >
                        Ayuda
                    </Button>

                    <Button variant="flat" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button 
                        color="primary" 
                        onPress={handleSave}
                        isDisabled={!validation.canSave || !isLoaded}
                        startContent={<Save size={18} />}
                    >
                        {isEditMode ? 'Actualizar Fórmula' : 'Crear Fórmula'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

// Add simple style override for the pulse animation if needed, though Tailwind likely handles it.
// Default Tailwind has animate-pulse.
