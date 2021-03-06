import { newSudokuModel, modelHelpers } from './sudoku-model.js';
import { List } from 'immutable';

const initialDigits =
    '000008000' +
    '000007000' +
    '123456789' +
    '000005000' +
    '000004000' +
    '000003000' +
    '000002000' +
    '000001000' +
    '000009000';

function digitsFromGrid(grid) {
    return grid.get('cells').map(c => c.get('digit')).join('');
}

function errorCells(grid) {
    return grid.get('cells').filter(c => c.get('errorMessage') !== undefined).map(c => c.get('index')).join(',');
}

function truthyKeys(obj) {
    return Object.keys(obj).filter(k => !!obj[k]);
}

test('restart', () => {
    // Initialise grid, add some stuff & check state
    const wip = '03D1,15D1,28D1,30D3,31D2C2,39T68,40D1,48T8N79,49N79C6,52D1,56D1,80D1';
    let grid = newSudokuModel({initialDigits, skipCheck: true});
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 30);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '3');
    grid = modelHelpers.setInputMode(grid, 'outer');
    grid = modelHelpers.restoreSnapshot(grid, wip);
    grid = modelHelpers.highlightErrorCells(grid);

    expect(grid.get('currentSnapshot')).toBe(wip);
    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('focusIndex')).toBe(30);
    expect(grid.get('matchDigit')).toBe('3');
    expect(grid.get('inputMode')).toBe('outer');
    expect(errorCells(grid)).toBe('30');
    expect( truthyKeys(grid.get('completedDigits')) ).toStrictEqual(['1']);

    // Pop up the Restart dialog and cancel
    grid = modelHelpers.confirmRestart(grid);
    expect(grid.get('modalState')).toStrictEqual({modalType: "confirm-restart"});
    grid = modelHelpers.applyModalAction(grid, 'cancel');

    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('currentSnapshot')).toBe(wip);

    // Do it again, but confirm this time
    grid = modelHelpers.confirmRestart(grid);
    expect(grid.get('modalState')).toStrictEqual({modalType: "confirm-restart"});
    grid = modelHelpers.applyModalAction(grid, 'restart-confirmed');
    grid = modelHelpers.highlightErrorCells(grid);

    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('currentSnapshot')).toBe('');
    expect(grid.get('focusIndex')).toBe(null);
    expect(grid.get('matchDigit')).toBe('0');
    expect(grid.get('inputMode')).toBe('digit');
    expect(digitsFromGrid(grid)).toBe(initialDigits);
    expect(errorCells(grid)).toBe('');
    expect( truthyKeys(grid.get('completedDigits')) ).toStrictEqual([]);
});

test('clear colours', () => {
    // Initialise grid, add some stuff & check state
    const wip = '03D1,15D1,28D1,30D3,31D2C2,39T68,40D1,48T8N79,49N79C6,52D1,56D1,80D1';
    let grid = newSudokuModel({initialDigits, skipCheck: true});
    grid = modelHelpers.restoreSnapshot(grid, wip);
    expect(grid.get('currentSnapshot')).toBe(wip);

    // Pop up the Clear colours dialog and cancel
    grid = modelHelpers.confirmClearColorHighlights(grid);
    expect(grid.get('modalState')).toStrictEqual({modalType: "confirm-clear-color-highlights"});
    grid = modelHelpers.applyModalAction(grid, 'cancel');

    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('currentSnapshot')).toBe(wip);

    // Do it again, but confirm this time
    grid = modelHelpers.confirmClearColorHighlights(grid);
    expect(grid.get('modalState')).toStrictEqual({modalType: "confirm-clear-color-highlights"});
    grid = modelHelpers.applyModalAction(grid, 'restart-confirmed');

    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('currentSnapshot')).toBe('');
});
