document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');

    const ROWS = 20;
    const COLUMNS = 10;
    const BLOCK_SIZE = 30;
    let board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

    context.scale(BLOCK_SIZE, BLOCK_SIZE);

    const TETROMINOES = [
        [[1, 1, 1], [0, 1, 0]], // T
        [[0, 2, 2], [2, 2, 0]], // Z
        [[3, 3, 0], [0, 3, 3]], // S
        [[4, 4, 4, 4]],         // I
        [[5, 5], [5, 5]],       // O
        [[6, 6, 6], [6, 0, 0]], // L
        [[7, 7, 7], [0, 0, 7]]  // J
    ];

    const COLORS = ["black", "purple", "red", "green", "cyan", "yellow", "orange", "blue"];

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let gameOver = false;

    let player = {
        position: { x: 3, y: 0 },
        matrix: randomTetromino(),
    };

    function randomTetromino() {
        return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = COLORS[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                    context.strokeStyle = "black";
                    context.strokeRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    function draw() {
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawMatrix(board, { x: 0, y: 0 });
        drawMatrix(player.matrix, player.position);
    }

    function rotate(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
    }

    function collide(board, player) {
        return player.matrix.some((row, y) =>
            row.some((value, x) =>
                value !== 0 &&
                (board[y + player.position.y]?.[x + player.position.x] !== 0)
            )
        );
    }

    function merge(board, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + player.position.y][x + player.position.x] = value;
                }
            });
        });
    }

    function clearLines() {
        for (let y = board.length - 1; y >= 0; y--) {
            if (board[y].every(value => value !== 0)) {
                board.splice(y, 1);
                board.unshift(Array(COLUMNS).fill(0));
            }
        }
    }

    function drop() {
        player.position.y++;
        if (collide(board, player)) {
            player.position.y--;
            merge(board, player);
            clearLines();
            player.matrix = randomTetromino();
            player.position = { x: 3, y: 0 };

            if (collide(board, player)) {
                alert("游戏结束！");
                gameOver = true;
                return;
            }
        }
        dropCounter = 0;
    }

    function update(time = 0) {
        if (gameOver) return;
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;

        if (dropCounter > dropInterval) {
            drop();
        }
        draw();
        requestAnimationFrame(update);
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            player.position.x--;
            if (collide(board, player)) player.position.x++;
        } else if (event.key === 'ArrowRight') {
            player.position.x++;
            if (collide(board, player)) player.position.x--;
        } else if (event.key === 'ArrowDown') {
            drop();
        } else if (event.key === 'ArrowUp') {
            const rotated = rotate(player.matrix);
            const oldMatrix = player.matrix;
            player.matrix = rotated;
            if (collide(board, player)) player.matrix = oldMatrix;
        }
    });

    function startGame() {
        gameOver = false;
        board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
        player.matrix = randomTetromino();
        player.position = { x: 3, y: 0 };
        dropCounter = 0;
        lastTime = 0;
        requestAnimationFrame(update);
    }

    window.startGame = startGame;
});
