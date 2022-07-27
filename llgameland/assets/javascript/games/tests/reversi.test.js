/**
 * @jest-environment jsdom
 */

const Reversi = require('../reversi.js');


test('test_Reversi.copyCells', () => {
    const game = new Reversi();
    const cells = [[1, 2, 3], [0, 1], ["a", "b"]];
    const copiedCells = game.copyCells(cells);
    expect(copiedCells).toEqual(cells);

    // assert copiedCells are deeply copied
    const originalCells = [[1, 2, 3], [0, 1], ["a", "b"]];
    copiedCells[0].push("test");
    expect(cells).toEqual(originalCells);
}) ;