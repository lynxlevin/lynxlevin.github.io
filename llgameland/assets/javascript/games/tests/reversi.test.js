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

test('test_Reversi.calcScore', () => {
    const game = new Reversi();
    cells = [
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 2, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const scores = game.calcScore(cells);
    const expected = {
        black: 3,
        white: 5,
    };
    expect(scores).toEqual(expected);
});

describe('Reversi.judge', () => {
    test('test_cannot_all_cells_filled', () => {
        const game = new Reversi();
        const spyCanFlip = jest.spyOn(game, "canFlip").mockImplementation(() => true);
        const spyShowMessage = jest.spyOn(game, "showMessage").mockImplementation(() => null);

        const scores = {black: 32, white: 32,};
        game.judge(scores);
        expect(spyCanFlip).toHaveBeenCalledTimes(2);
        expect(spyShowMessage).toHaveBeenCalledTimes(1);
        expect(spyShowMessage).toHaveBeenCalledWith("ゲームセット");
    });

    test('test_cannot_flip_both', () => {
        const game = new Reversi();
        const spyCanFlip = jest.spyOn(game, "canFlip").mockImplementation(() => false);
        const spyShowMessage = jest.spyOn(game, "showMessage").mockImplementation(() => null);

        const scores = {black: 0, white: 0,};
        game.judge(scores);
        expect(spyCanFlip).toHaveBeenCalledTimes(2);
        expect(spyShowMessage).toHaveBeenCalledTimes(1);
        expect(spyShowMessage).toHaveBeenCalledWith("ゲームセット");
    });

    test('test_cannot_flip_black', () => {
        const game = new Reversi();
        const spyCanFlip = jest.spyOn(game, "canFlip").mockImplementation((num) => !(num === game.black));
        const spyShowMessage = jest.spyOn(game, "showMessage").mockImplementation(() => null);

        const scores = {black: 5, white: 5,};
        game.judge(scores);
        expect(spyCanFlip).toHaveBeenCalledTimes(2);
        expect(spyShowMessage).toHaveBeenCalledTimes(1);
        expect(spyShowMessage).toHaveBeenCalledWith("黒スキップ");
    });

    test('test_cannot_flip_white', () => {
        const game = new Reversi();
        const spyCanFlip = jest.spyOn(game, "canFlip").mockImplementation((num) => !(num === game.white));
        const spyShowMessage = jest.spyOn(game, "showMessage").mockImplementation(() => null);

        const scores = {black: 5, white: 5,};
        game.judge(scores);
        expect(spyCanFlip).toHaveBeenCalledTimes(2);
        expect(spyShowMessage).toHaveBeenCalledTimes(1);
        expect(spyShowMessage).toHaveBeenCalledWith("白スキップ");
    });

    test('test_all_checks_pass', () => {
        const game = new Reversi();
        const spyCanFlip = jest.spyOn(game, "canFlip").mockImplementation(() => true);
        const spyShowMessage = jest.spyOn(game, "showMessage").mockImplementation(() => null);

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
        const color = game.black;
        const spyGetFlipCells = jest.spyOn(game, "getFlipCells").mockImplementation(() => flipped);
        const spyPutStone = jest.spyOn(game, "putStone").mockImplementation(() => null);

        const result = game.flipStones(i, j, color, game);

        expect(spyGetFlipCells).toHaveBeenCalledTimes(1);
        expect(spyGetFlipCells).toHaveBeenCalledWith(i, j, color);

        expect(spyPutStone).toHaveBeenCalledTimes(3);
        expect(spyPutStone).toHaveBeenCalledWith(flipped[0][0], flipped[0][1], color);
        expect(spyPutStone).toHaveBeenCalledWith(flipped[1][0], flipped[1][1], color);
        expect(spyPutStone).toHaveBeenCalledWith(i, j, color);

        expect(result).toBe(true);
    });

    it('test_not_flipped', () => {
        const game = new Reversi();
        const flipped = [];
        const i = 3;
        const j = 6;
        const color = game.black;
        const spyGetFlipCells = jest.spyOn(game, "getFlipCells").mockImplementation(() => flipped);
        const spyPutStone = jest.spyOn(game, "putStone").mockImplementation(() => null);

        const result = game.flipStones(i, j, color, game);

        expect(spyGetFlipCells).toHaveBeenCalledTimes(1);
        expect(spyGetFlipCells).toHaveBeenCalledWith(i, j, color);

        expect(spyPutStone).toHaveBeenCalledTimes(0);

        expect(result).toBe(false);
    });
});

describe('Reversi.canFlip', () => {
    it('test_can_flip', () => {
        const game = new Reversi();
        const flipped = [[0, 1], [4, 5]];
        const spyGetFlipCells = jest.spyOn(game, "getFlipCells").mockImplementation(() => flipped);
        const color = game.black;

        const result = game.canFlip(color);

        expect(spyGetFlipCells).toHaveBeenCalledTimes(64);
        expect(result).toBe(true);
    });

    it('test_cannot_flip', () => {
        const game = new Reversi();
        const flipped = [];
        const spyGetFlipCells = jest.spyOn(game, "getFlipCells").mockImplementation(() => flipped);
        const color = game.black;

        const result = game.canFlip(color);

        expect(spyGetFlipCells).toHaveBeenCalledTimes(64);
        expect(result).toBe(false);
    });
});