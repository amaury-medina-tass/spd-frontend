import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormulaEditor } from './useFormulaEditor';
import { getIndicatorFormulaData } from '@/services/masters/formulas.service';
import { parseFormulaString, validateFormula, buildAST, convertAstToSteps } from '@/utils/formula';

// Mock dependencies
jest.mock('@/services/masters/formulas.service', () => ({
  getIndicatorFormulaData: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/utils/formula', () => ({
  parseFormulaString: jest.fn(() => []),
  validateFormula: jest.fn(() => ({ isValid: true, errors: [] })),
  buildAST: jest.fn(() => ({ kind: 'root' })),
  convertAstToSteps: jest.fn(() => [{ type: 'constant', value: '1' }]),
}));

const mockGetData = getIndicatorFormulaData as jest.Mock;
const mockParseFormula = parseFormulaString as jest.Mock;
const mockBuildAST = buildAST as jest.Mock;
const mockConvertAst = convertAstToSteps as jest.Mock;

describe('useFormulaEditor', () => {
  const baseProps = {
    indicatorId: 'ind-1',
    isOpen: false,
    onSave: jest.fn().mockResolvedValue(undefined),
    type: 'action' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all expected properties', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));

    // State
    expect(result.current.selectedYear).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.variables).toEqual([]);
    expect(result.current.goalVariables).toEqual([]);
    expect(result.current.goalIndicators).toEqual([]);
    expect(result.current.indicatorQuadrenniums).toEqual([]);
    expect(result.current.baseline).toBeUndefined();
    expect(result.current.existingFormulaId).toBeNull();
    expect(result.current.activeTab).toBe('variables');
    expect(result.current.selectedVariableId).toBeNull();
    expect(result.current.mainFormulaSteps).toEqual([]);
    expect(result.current.isReplicateModalOpen).toBe(false);
    expect(result.current.isGuideOpen).toBe(false);
    expect(result.current.cursorIndex).toBeNull();
    expect(result.current.constantValue).toBe('');
    expect(result.current.years).toEqual(expect.arrayContaining(['2024', '2025']));

    // Functions
    expect(typeof result.current.fetchData).toBe('function');
    expect(typeof result.current.getCurrentSteps).toBe('function');
    expect(typeof result.current.updateCurrentSteps).toBe('function');
    expect(typeof result.current.insertStep).toBe('function');
    expect(typeof result.current.removeStep).toBe('function');
    expect(typeof result.current.undoLastStep).toBe('function');
    expect(typeof result.current.clearAllSteps).toBe('function');
    expect(typeof result.current.validateCurrent).toBe('function');
    expect(typeof result.current.addConstant).toBe('function');
    expect(typeof result.current.handleReplicate).toBe('function');
    expect(typeof result.current.serializeFormula).toBe('function');
    expect(typeof result.current.getHydratedSteps).toBe('function');
    expect(typeof result.current.handleSave).toBe('function');
  });

  it('getCurrentSteps returns empty array when no variable selected', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    expect(result.current.getCurrentSteps()).toEqual([]);
  });

  it('setSelectedYear updates the year', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => {
      result.current.setSelectedYear('2025');
    });
    expect(result.current.selectedYear).toBe('2025');
  });

  it('setActiveTab updates the active tab', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => {
      result.current.setActiveTab('main');
    });
    expect(result.current.activeTab).toBe('main');
  });

  it('setIsReplicateModalOpen toggles the modal', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => {
      result.current.setIsReplicateModalOpen(true);
    });
    expect(result.current.isReplicateModalOpen).toBe(true);
  });

  it('setIsGuideOpen toggles the guide', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => {
      result.current.setIsGuideOpen(true);
    });
    expect(result.current.isGuideOpen).toBe(true);
  });

  it('updateCurrentSteps updates main formula when activeTab is main', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const step = { type: 'constant' as const, value: '5' };

    act(() => {
      result.current.setActiveTab('main');
    });
    act(() => {
      result.current.updateCurrentSteps([step] as any);
    });
    expect(result.current.mainFormulaSteps).toEqual([step]);
  });

  it('insertStep adds a step and updates cursor', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const step = { type: 'constant' as const, value: '10' };

    act(() => {
      result.current.setActiveTab('main');
    });
    act(() => {
      result.current.insertStep(step as any);
    });
    expect(result.current.mainFormulaSteps).toEqual([step]);
    expect(result.current.cursorIndex).toBe(1);
  });

  it('removeStep removes a step at given index', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const step1 = { type: 'constant' as const, value: '1' };
    const step2 = { type: 'constant' as const, value: '2' };

    act(() => {
      result.current.setActiveTab('main');
    });
    act(() => {
      result.current.updateCurrentSteps([step1, step2] as any);
    });
    act(() => {
      result.current.removeStep(0);
    });
    expect(result.current.mainFormulaSteps).toEqual([step2]);
  });

  it('undoLastStep removes the last step', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const step1 = { type: 'constant' as const, value: '1' };
    const step2 = { type: 'constant' as const, value: '2' };

    act(() => {
      result.current.setActiveTab('main');
    });
    act(() => {
      result.current.updateCurrentSteps([step1, step2] as any);
    });
    act(() => {
      result.current.undoLastStep();
    });
    expect(result.current.mainFormulaSteps).toEqual([step1]);
  });

  it('clearAllSteps empties the steps and resets cursor', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const step = { type: 'constant' as const, value: '1' };

    act(() => {
      result.current.setActiveTab('main');
    });
    act(() => {
      result.current.updateCurrentSteps([step] as any);
    });
    act(() => {
      result.current.clearAllSteps();
    });
    expect(result.current.mainFormulaSteps).toEqual([]);
    expect(result.current.cursorIndex).toBeNull();
  });

  it('addConstant inserts constant step and clears value', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));

    act(() => {
      result.current.setActiveTab('main');
    });
    act(() => {
      result.current.setConstantValue('42');
    });
    act(() => {
      result.current.addConstant();
    });
    expect(result.current.mainFormulaSteps).toHaveLength(1);
    expect(result.current.mainFormulaSteps[0]).toEqual({ type: 'constant', value: '42' });
    expect(result.current.constantValue).toBe('');
  });

  it('addConstant does nothing when constantValue is empty', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));

    act(() => {
      result.current.setActiveTab('main');
    });
    act(() => {
      result.current.addConstant();
    });
    expect(result.current.mainFormulaSteps).toEqual([]);
  });

  it('serializeFormula serializes steps to string', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));

    const steps = [
      { type: 'variable', value: { id: 'v1' } },
      { type: 'operator', value: { symbol: '+' } },
      { type: 'constant', value: '5' },
    ];
    expect(result.current.serializeFormula(steps as any)).toBe('[v1]+5');
  });

  it('serializeFormula handles goal_variable', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const steps = [{ type: 'goal_variable', value: { idMeta: 'g1' } }];
    expect(result.current.serializeFormula(steps as any)).toBe('[MV:g1]');
  });

  it('serializeFormula handles goal_indicator', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const steps = [{ type: 'goal_indicator', value: { idMeta: 'gi1' } }];
    expect(result.current.serializeFormula(steps as any)).toBe('[MI:gi1]');
  });

  it('serializeFormula handles advance step', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const steps = [{ type: 'advance', value: { year: 2024, months: [1, 3] } }];
    expect(result.current.serializeFormula(steps as any)).toBe('[AV:2024:1-3]');
  });

  it('serializeFormula handles baseline step', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const steps = [{ type: 'baseline' }];
    expect(result.current.serializeFormula(steps as any)).toBe('[LINEA_BASE]');
  });

  it('serializeFormula handles comparison step', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const steps = [{ type: 'comparison', value: { symbol: '>' } }];
    expect(result.current.serializeFormula(steps as any)).toBe('>');
  });

  it('serializeFormula handles function step', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const steps = [{ type: 'function', value: { id: 'SUM' } }];
    expect(result.current.serializeFormula(steps as any)).toBe('SUM(');
  });

  it('serializeFormula handles parenthesis and separator', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const steps = [
      { type: 'parenthesis', value: '(' },
      { type: 'constant', value: '1' },
      { type: 'separator', value: ',' },
      { type: 'constant', value: '2' },
      { type: 'parenthesis', value: ')' },
    ];
    expect(result.current.serializeFormula(steps as any)).toBe('(1,2)');
  });

  it('getHydratedSteps returns steps as-is for non-variable types', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const steps = [{ type: 'constant', value: '5' }];
    expect(result.current.getHydratedSteps(steps as any)).toEqual(steps);
  });

  it('handleReplicate updates variable formulas', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const formulas = { v1: [{ type: 'constant', value: '10' }] };

    act(() => {
      result.current.handleReplicate(['v1'], formulas as any);
    });
    expect(result.current.variableFormulas).toEqual(formulas);
  });

  it('handleSave does nothing when mainFormulaSteps is empty', () => {
    const onSave = jest.fn();
    const { result } = renderHook(() => useFormulaEditor({ ...baseProps, onSave }));

    act(() => {
      result.current.handleSave();
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('validationState reflects empty formula state', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    expect(result.current.validationState.canAddEntity).toBe(true);
    expect(result.current.validationState.canAddOperator).toBe(false);
  });

  it('validationState after adding an entity allows operator', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.insertStep({ type: 'constant', value: '5' } as any); });
    expect(result.current.validationState.canAddOperator).toBe(true);
    expect(result.current.validationState.canAddEntity).toBe(false);
  });

  it('validationState after operator allows entity', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.insertStep({ type: 'constant', value: '5' } as any); });
    act(() => { result.current.insertStep({ type: 'operator', value: { symbol: '+' } } as any); });
    expect(result.current.validationState.canAddEntity).toBe(true);
  });

  it('validationState tracks open/close parentheses', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.insertStep({ type: 'parenthesis', value: '(' } as any); });
    act(() => { result.current.insertStep({ type: 'constant', value: '5' } as any); });
    expect(result.current.validationState.canAddCloseParen).toBe(true);
  });

  it('validationState inside function context', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.insertStep({ type: 'function', value: { id: 'SUM' } } as any); });
    expect(result.current.validationState.isInsideFunction).toBe(true);
    expect(result.current.validationState.canAddEntity).toBe(true);
  });

  it('validationState restricts operators inside SUM/AVG/MAX/MIN', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.insertStep({ type: 'function', value: { id: 'AVG' } } as any); });
    act(() => { result.current.insertStep({ type: 'constant', value: '1' } as any); });
    // Operator should be restricted inside AVG
    expect(result.current.validationState.canAddOperator).toBe(false);
  });

  it('validationState for IF function with comparison', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.insertStep({ type: 'function', value: { id: 'IF' } } as any); });
    act(() => { result.current.insertStep({ type: 'constant', value: '1' } as any); });
    expect(result.current.validationState.isInIfCondition).toBe(true);
    expect(result.current.validationState.canAddComparisonOperator).toBe(true);
  });

  it('validationState limits separators in IF to 2', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.insertStep({ type: 'function', value: { id: 'IF' } } as any); });
    act(() => { result.current.insertStep({ type: 'constant', value: '1' } as any); });
    act(() => { result.current.insertStep({ type: 'comparison', value: { symbol: '>' } } as any); });
    act(() => { result.current.insertStep({ type: 'constant', value: '0' } as any); });
    act(() => { result.current.insertStep({ type: 'separator', value: ',' } as any); });
    act(() => { result.current.insertStep({ type: 'constant', value: 'a' } as any); });
    act(() => { result.current.insertStep({ type: 'separator', value: ',' } as any); });
    act(() => { result.current.insertStep({ type: 'constant', value: 'b' } as any); });
    // argIndex is now 2, so no more separators
    expect(result.current.validationState.canAddSeparator).toBe(false);
  });

  it('validationState allows unary operator at start', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    expect(result.current.validationState.canAddUnaryOperator).toBe(true);
  });

  it('validationState allows unary operator after open paren', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.insertStep({ type: 'parenthesis', value: '(' } as any); });
    expect(result.current.validationState.canAddUnaryOperator).toBe(true);
  });

  it('fetchData sets variables and indicator data when isOpen', async () => {
    mockGetData.mockResolvedValueOnce({
      variables: [
        { id: 'v1', code: 'V1', name: 'Var 1', description: 'desc',
          goals: [{ id: 'g1', value: '10', year: 2024 }],
          quadrenniums: [{ id: 'q1', startYear: 2024, endYear: 2027, value: '40' }] }
      ],
      indicator: {
        baseline: '5',
        goals: [{ id: 'ig1', value: '20', year: 2024 }],
        quadrenniums: [{ id: 'iq1', startYear: 2024, endYear: 2027, value: '80' }],
        formulas: [],
      }
    });

    const { result } = renderHook(() => useFormulaEditor({ ...baseProps, isOpen: true }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.variables).toHaveLength(1);
    expect(result.current.variables[0].id).toBe('v1');
    expect(result.current.baseline).toBe('5');
    expect(result.current.goalIndicators).toHaveLength(1);
    expect(result.current.indicatorQuadrenniums).toHaveLength(1);
    expect(result.current.existingFormulaId).toBeNull();
  });

  it('fetchData parses existing formula with expression and AST', async () => {
    mockParseFormula.mockReturnValueOnce([{ type: 'constant', value: '1' }]);
    mockConvertAst.mockReturnValueOnce([{ type: 'constant', value: '2' }]);

    mockGetData.mockResolvedValueOnce({
      variables: [{ id: 'v1', code: 'V1', name: 'V', description: '' }],
      indicator: {
        baseline: undefined,
        goals: [],
        quadrenniums: [],
        formulas: [{
          id: 'f1',
          expression: '[v1]+1',
          ast: { kind: 'ref', value: 'v1', subFormula: { kind: 'num', value: '2' }, left: null, right: null },
        }],
      }
    });

    const { result } = renderHook(() => useFormulaEditor({ ...baseProps, isOpen: true }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.existingFormulaId).toBe('f1');
    expect(mockParseFormula).toHaveBeenCalled();
  });

  it('fetchData handles AST with left/right/args nodes', async () => {
    mockGetData.mockResolvedValueOnce({
      variables: [{ id: 'v1', code: 'V1', name: 'V', description: '' }],
      indicator: {
        formulas: [{
          id: 'f2',
          expression: 'test',
          ast: {
            kind: 'op',
            left: { kind: 'ref', value: 'v1', subFormula: { kind: 'num' } },
            right: { kind: 'num', value: '1' },
            args: [{ kind: 'num', value: '3' }],
          },
        }],
      }
    });

    const { result } = renderHook(() => useFormulaEditor({ ...baseProps, isOpen: true }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.existingFormulaId).toBe('f2');
  });

  it('fetchData handles error gracefully', async () => {
    mockGetData.mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useFormulaEditor({ ...baseProps, isOpen: true }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.variables).toEqual([]);
    consoleSpy.mockRestore();
  });

  it('fetchData does nothing when indicatorId is empty', async () => {
    mockGetData.mockClear();
    const { result } = renderHook(() => useFormulaEditor({ ...baseProps, indicatorId: '', isOpen: true }));
    // Since indicatorId is empty, fetchData returns early
    expect(mockGetData).not.toHaveBeenCalled();
  });

  it('updateCurrentSteps updates variable formula when activeTab=variables and variableId set', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const step = { type: 'constant' as const, value: '7' };

    act(() => { result.current.setActiveTab('variables'); });
    act(() => { result.current.setSelectedVariableId('v1'); });
    act(() => { result.current.updateCurrentSteps([step] as any); });
    expect(result.current.variableFormulas['v1']).toEqual([step]);
  });

  it('getCurrentSteps returns variable formula when activeTab=variables', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const step = { type: 'constant' as const, value: '3' };

    act(() => { result.current.setActiveTab('variables'); });
    act(() => { result.current.setSelectedVariableId('v1'); });
    act(() => { result.current.updateCurrentSteps([step] as any); });
    expect(result.current.getCurrentSteps()).toEqual([step]);
  });

  it('insertStep at cursor position', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.insertStep({ type: 'constant', value: 'a' } as any); });
    act(() => { result.current.insertStep({ type: 'constant', value: 'b' } as any); });
    // Set cursor to position 1 (between a and b)
    act(() => { result.current.setCursorIndex(1); });
    act(() => { result.current.insertStep({ type: 'constant', value: 'x' } as any); });
    expect(result.current.mainFormulaSteps[1]).toEqual({ type: 'constant', value: 'x' });
    expect(result.current.cursorIndex).toBe(2);
  });

  it('removeStep adjusts cursor when needed', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.insertStep({ type: 'constant', value: 'a' } as any); });
    act(() => { result.current.insertStep({ type: 'constant', value: 'b' } as any); });
    act(() => { result.current.insertStep({ type: 'constant', value: 'c' } as any); });
    // Cursor is at 3. Remove step at index 1 => cursor should adjust to 2
    act(() => { result.current.removeStep(1); });
    expect(result.current.cursorIndex).toBe(2);
    expect(result.current.mainFormulaSteps).toHaveLength(2);
  });

  it('validateCurrent calls validateFormula', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    const res = result.current.validateCurrent();
    expect(res).toEqual({ isValid: true, errors: [] });
  });

  it('handleSave calls onSave with proper payload', () => {
    const onSave = jest.fn();
    const { result } = renderHook(() => useFormulaEditor({ ...baseProps, onSave }));

    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.updateCurrentSteps([
      { type: 'constant', value: '1' },
      { type: 'operator', value: { symbol: '+' } },
      { type: 'constant', value: '2' },
    ] as any); });
    act(() => { result.current.handleSave(); });
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        indicatorId: 'ind-1',
        expression: expect.any(String),
        ast: expect.any(Object),
        variables: expect.any(Array),
      }),
      null
    );
  });

  it('handleSave includes variable formulas in payload', () => {
    const onSave = jest.fn();
    const { result } = renderHook(() => useFormulaEditor({ ...baseProps, onSave }));

    // Set main formula
    act(() => { result.current.setActiveTab('main'); });
    act(() => { result.current.updateCurrentSteps([{ type: 'constant', value: '1' }] as any); });
    // Set a variable formula
    act(() => { result.current.handleReplicate(['v1'], { v1: [{ type: 'constant', value: '5' }] } as any); });
    act(() => { result.current.handleSave(); });

    const payload = onSave.mock.calls[0][0];
    expect(payload.variables).toHaveLength(1);
    expect(payload.variables[0].variableId).toBe('v1');
  });

  it('getHydratedSteps hydrates variable steps with sub-formulas', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));

    // Set a variable formula
    act(() => {
      result.current.handleReplicate(['v1'], { v1: [{ type: 'constant', value: '10' }] } as any);
    });

    const steps = [
      { type: 'variable', value: { id: 'v1', formula: [] } },
    ] as any;
    const hydrated = result.current.getHydratedSteps(steps);
    expect(hydrated[0].value.formula).toEqual([{ type: 'constant', value: '10' }]);
  });

  it('getHydratedSteps prevents circular references', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));

    // Set variable formulas that reference each other
    act(() => {
      result.current.handleReplicate(
        ['v1', 'v2'],
        {
          v1: [{ type: 'variable', value: { id: 'v2', formula: [] } }],
          v2: [{ type: 'variable', value: { id: 'v1', formula: [] } }],
        } as any
      );
    });

    const steps = [{ type: 'variable', value: { id: 'v1', formula: [] } }] as any;
    // Should not infinite loop
    const hydrated = result.current.getHydratedSteps(steps);
    expect(hydrated).toHaveLength(1);
  });

  it('currentSteps returns empty when no variable selected on variables tab', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    // Default activeTab is 'variables' with no selectedVariableId
    expect(result.current.currentSteps).toEqual([]);
  });

  it('currentSteps returns variable formula when variable selected', () => {
    const { result } = renderHook(() => useFormulaEditor(baseProps));
    act(() => { result.current.setSelectedVariableId('v1'); });
    act(() => {
      result.current.handleReplicate(['v1'], { v1: [{ type: 'constant', value: '99' }] } as any);
    });
    expect(result.current.currentSteps).toEqual([{ type: 'constant', value: '99' }]);
  });
});
