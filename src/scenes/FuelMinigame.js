class FuelMinigame extends Phaser.Scene {
    constructor() {
        super('fuelMinigame');
    }

    create() {
        this.gridSize = 5;
        this.cellSize = 80;
        this.offsetX = 50;
        this.offsetY = 50;

        this.colors = ['red', 'blue', 'green', 'yellow'];
        this.colorMap = {
            red: 0xff4444,
            blue: 0x4488ff,
            green: 0x44ff44,
            yellow: 0xffff44
        };

        this.grid = [];
        this.paths = {}; // solution paths

        this.isDrawing = false;
        this.currentColor = null;
        this.currentPath = [];

        this.createGrid();
        this.generatePuzzle();
        this.drawGrid();
        this.setupInput();
    }

    // ---------------- GRID ----------------
    createGrid() {
        for (let y = 0; y < this.gridSize; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.grid[y][x] = {
                    x,
                    y,
                    color: null,
                    filled: false,
                    endpoint: false
                };
            }
        }
    }

    // ---------------- PUZZLE GENERATION ----------------
    generatePuzzle() {
        // Predefined safe paths (guaranteed solvable)
        const predefinedPaths = [
            [[0,0],[1,0],[2,0],[2,1],[2,2]],
            [[4,0],[4,1],[3,1],[3,2],[3,3]],
            [[0,4],[1,4],[1,3],[1,2],[0,2]],
            [[4,4],[3,4],[2,4],[2,3],[4,2]]
        ];

        Phaser.Utils.Array.Shuffle(predefinedPaths);

        for (let i = 0; i < this.colors.length; i++) {
            const color = this.colors[i];
            const path = predefinedPaths[i];

            this.paths[color] = path;

            path.forEach(([x, y], index) => {
                let cell = this.grid[y][x];
                cell.color = color;

                if (index === 0 || index === path.length - 1) {
                    cell.endpoint = true;
                }
            });
        }
    }

    // ---------------- DRAW ----------------
    drawGrid() {
        this.graphics = this.add.graphics();

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                let cell = this.grid[y][x];

                let px = this.offsetX + x * this.cellSize;
                let py = this.offsetY + y * this.cellSize;

                this.graphics.lineStyle(2, 0xffffff);
                this.graphics.strokeRect(px, py, this.cellSize, this.cellSize);

                if (cell.endpoint) {
                    this.graphics.fillStyle(this.colorMap[cell.color]);
                    this.graphics.fillCircle(
                        px + this.cellSize / 2,
                        py + this.cellSize / 2,
                        12
                    );
                }
            }
        }

        this.lineGraphics = this.add.graphics();
    }

    redrawLines() {
        this.lineGraphics.clear();

        for (let color in this.playerPaths) {
            let path = this.playerPaths[color];
            this.lineGraphics.lineStyle(10, this.colorMap[color]);

            for (let i = 0; i < path.length - 1; i++) {
                let a = path[i];
                let b = path[i + 1];

                this.lineGraphics.strokeLineShape(new Phaser.Geom.Line(
                    this.getCenter(a.x, a.y).x,
                    this.getCenter(a.x, a.y).y,
                    this.getCenter(b.x, b.y).x,
                    this.getCenter(b.x, b.y).y
                ));
            }
        }
    }

    // ---------------- INPUT ----------------
    setupInput() {
        this.playerPaths = {};

        this.input.on('pointerdown', (pointer) => {
            let cell = this.getCell(pointer.x, pointer.y);
            if (!cell || !cell.endpoint) return;

            this.isDrawing = true;
            this.currentColor = cell.color;

            this.playerPaths[this.currentColor] = [{ x: cell.x, y: cell.y }];
        });

        this.input.on('pointermove', (pointer) => {
            if (!this.isDrawing) return;

            let cell = this.getCell(pointer.x, pointer.y);
            if (!cell) return;

            let path = this.playerPaths[this.currentColor];
            let last = path[path.length - 1];

            if (!this.isAdjacent(last, cell)) return;

            // prevent crossing other colors
            if (cell.filled && cell.color !== this.currentColor) return;

            // prevent going backwards weirdly
            if (path.find(p => p.x === cell.x && p.y === cell.y)) return;

            cell.filled = true;
            cell.color = this.currentColor;

            path.push({ x: cell.x, y: cell.y });

            this.redrawLines();
        });

        this.input.on('pointerup', () => {
            this.isDrawing = false;
            this.checkWin();
        });
    }

    // ---------------- HELPERS ----------------
    getCell(px, py) {
        let x = Math.floor((px - this.offsetX) / this.cellSize);
        let y = Math.floor((py - this.offsetY) / this.cellSize);

        if (x < 0 || y < 0 || x >= this.gridSize || y >= this.gridSize) return null;
        return this.grid[y][x];
    }

    getCenter(x, y) {
        return {
            x: this.offsetX + x * this.cellSize + this.cellSize / 2,
            y: this.offsetY + y * this.cellSize + this.cellSize / 2
        };
    }

    isAdjacent(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
    }

    // ---------------- WIN CHECK ----------------
    checkWin() {
        for (let color of this.colors) {
            let solution = this.paths[color];
            let player = this.playerPaths[color];

            if (!player) return;

            if (player.length !== solution.length) return;
        }

        this.add.text(200, 450, "REFUEL COMPLETE!", {
            fontSize: '24px',
            fill: '#00ff00'
        });
    }
}