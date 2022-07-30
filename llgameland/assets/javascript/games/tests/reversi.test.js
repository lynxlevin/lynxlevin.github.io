/**
 * @jest-environment jsdom
 */

const Module = require('../reversi.js');
const Reversi = Module.Reversi;
const Board = Module.Board;
const Computer = Module.Computer;
const ScreenDoms = Module.ScreenDoms;


test('test_Board.copyCells', () => {
    const board = new Board();
    board.cells = [[1, 2, 3], [0, 1], ["a", "b"]];
    const copiedCells = board.copyCells();
    expect(copiedCells).toEqual(board.cells);

    // assert copiedCells are deeply copied
    const originalCells = [[1, 2, 3], [0, 1], ["a", "b"]];
    copiedCells[0].push("test");
    expect(board.cells).toEqual(originalCells);
}) ;

test('test_Board.calcScore', () => {
    const board = new Board();
    board.cells = [
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 2, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const scores = board.calcScore();
    const expected = {
        black: 3,
        white: 5,
    };
    expect(scores).toEqual(expected);
});

describe('Reversi.judge', () => {
    test('test_all_cells_filled', () => {
        const game = new Reversi();
        const spyCanFlip = jest.spyOn(game.board, "canFlip").mockImplementation(() => true);
        const spyShowMessage = jest.spyOn(game.screen, "showMessage").mockImplementation(() => null);

        const scores = {black: 32, white: 32,};
        game.judge(scores);
        expect(spyCanFlip).toHaveBeenCalledTimes(2);
        expect(spyShowMessage).toHaveBeenCalledTimes(1);
        expect(spyShowMessage).toHaveBeenCalledWith("ゲームセット");
    });

    test('test_cannot_flip_both', () => {
        const game = new Reversi();
        const spyCanFlip = jest.spyOn(game.board, "canFlip").mockImplementation(() => false);
        const spyShowMessage = jest.spyOn(game.screen, "showMessage").mockImplementation(() => null);

        const scores = {black: 0, white: 0,};
        game.judge(scores);
        expect(spyCanFlip).toHaveBeenCalledTimes(2);
        expect(spyShowMessage).toHaveBeenCalledTimes(1);
        expect(spyShowMessage).toHaveBeenCalledWith("ゲームセット");
    });

    test('test_cannot_flip_black', () => {
        const game = new Reversi();
        const spyCanFlip = jest.spyOn(game.board, "canFlip").mockImplementation((num) => !(num === game.colors.black));
        const spyShowMessage = jest.spyOn(game.screen, "showMessage").mockImplementation(() => null);

        const scores = {black: 5, white: 5,};
        game.judge(scores);
        expect(spyCanFlip).toHaveBeenCalledTimes(2);
        expect(spyShowMessage).toHaveBeenCalledTimes(1);
        expect(spyShowMessage).toHaveBeenCalledWith("黒スキップ");
    });

    test('test_cannot_flip_white', () => {
        const game = new Reversi();
        const spyCanFlip = jest.spyOn(game.board, "canFlip").mockImplementation((num) => !(num === game.colors.white));
        const spyShowMessage = jest.spyOn(game.screen, "showMessage").mockImplementation(() => null);

        const scores = {black: 5, white: 5,};
        game.judge(scores);
        expect(spyCanFlip).toHaveBeenCalledTimes(2);
        expect(spyShowMessage).toHaveBeenCalledTimes(1);
        expect(spyShowMessage).toHaveBeenCalledWith("白スキップ");
    });

    test('test_all_checks_pass', () => {
        const game = new Reversi();
        const spyCanFlip = jest.spyOn(game.board, "canFlip").mockImplementation(() => true);
        const spyShowMessage = jest.spyOn(game.screen, "showMessage").mockImplementation(() => null);

        const originalUserTurn = game.userTurn;
        const scores = {black: 5, white: 5,};
        game.judge(scores);
        expect(spyCanFlip).toHaveBeenCalledTimes(2);
        expect(spyShowMessage).toHaveBeenCalledTimes(0);
        expect(game.userTurn).toBe(!originalUserTurn);
    });
});

describe('Reversi.flipStones', () => {
    it('test_flipped', () => {
        const game = new Reversi();
        const flipped = [[0, 1], [4, 5]];
        const i = 3;
        const j = 6;
        const color = game.colors.black;
        const colorName = "black";
        const spyGetFlipCells = jest.spyOn(game.board, "getFlipCells").mockImplementation(() => flipped);
        const spyPutStone = jest.spyOn(game, "putStone").mockImplementation(() => null);

        const result = game.flipStones(i, j, colorName);

        expect(spyGetFlipCells).toHaveBeenCalledTimes(1);
        expect(spyGetFlipCells).toHaveBeenCalledWith(i, j, color);

        expect(spyPutStone).toHaveBeenCalledTimes(3);
        expect(spyPutStone).toHaveBeenCalledWith(flipped[0][0], flipped[0][1], colorName);
        expect(spyPutStone).toHaveBeenCalledWith(flipped[1][0], flipped[1][1], colorName);
        expect(spyPutStone).toHaveBeenCalledWith(i, j, colorName);

        expect(result).toBe(true);
    });

    it('test_not_flipped', () => {
        const game = new Reversi();
        const flipped = [];
        const i = 3;
        const j = 6;
        const color = game.colors.black;
        const colorName = "black";
        const spyGetFlipCells = jest.spyOn(game.board, "getFlipCells").mockImplementation(() => flipped);
        const spyPutStone = jest.spyOn(game, "putStone").mockImplementation(() => null);

        const result = game.flipStones(i, j, colorName);

        expect(spyGetFlipCells).toHaveBeenCalledTimes(1);
        expect(spyGetFlipCells).toHaveBeenCalledWith(i, j, color);

        expect(spyPutStone).toHaveBeenCalledTimes(0);

        expect(result).toBe(false);
    });
});

describe('Board.canFlip', () => {
    it('test_can_flip', () => {
        const board = new Board();
        const flipped = [[0, 1], [4, 5]];
        const spyGetFlipCells = jest.spyOn(board, "getFlipCells").mockImplementation(() => flipped);
        const color = board.colors.black;

        const result = board.canFlip(color);

        expect(spyGetFlipCells).toHaveBeenCalledTimes(64);
        expect(result).toBe(true);
    });

    it('test_cannot_flip', () => {
        const board = new Board();
        const flipped = [];
        const spyGetFlipCells = jest.spyOn(board, "getFlipCells").mockImplementation(() => flipped);
        const color = board.colors.black;

        const result = board.canFlip(color);

        expect(spyGetFlipCells).toHaveBeenCalledTimes(64);
        expect(result).toBe(false);
    });
});