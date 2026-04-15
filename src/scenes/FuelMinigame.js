class PressureScene extends Phaser.Scene {
    constructor() {
        super('pressureScene');
    }

    init() {
        this.gridSize = 6;
        this.tileSize = 64; 
        this.timer = 30;
        this.round = 1;
        this.isLocked = false;

        this.pipeGrid = [];
        this.emptyGrid = [];

        this.placingMode = false;
        this.tileToFill = null;

        // NEW: 1 of each pipe per round
        this.pipeInventory = { 0:1, 1:1, 2:1, 3:1 };
    }

    create() {
        // Create the grid array
        for (let i = 0; i < this.gridSize; i++) {
            this.pipeGrid[i] = new Array(this.gridSize);
            this.emptyGrid[i] = new Array(this.gridSize).fill(false);
        }

        this.setupGrid();

        // UI Setup
        this.timerText = this.add.text(20, 20, `TIME: ${this.timer}`, { 
            fontSize: '28px', 
            fill: '#00FF00',
            fontFamily: 'Courier New'
        });

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.tick,
            callbackScope: this,
            loop: true
        });

        // --- HOTBAR SETUP ---
        this.hotbarItems = [0,1,2,3];
        this.hotbarSprites = [];

        let hotbarY = 560;
        for (let i = 0; i < this.hotbarItems.length; i++) {
            let s = this.add.sprite(150 + i * 90, hotbarY, 'pipe', this.hotbarItems[i])
                .setInteractive()
                .setScale(1.2);

            s.on('pointerdown', () => {
                if (this.placingMode) {
                    this.finishPlacement(i);
                } else {
                    this.hotbarIndex = i;
                    this.updateHotbarSelection();
                }
            });

            this.hotbarSprites.push(s);
        }

        this.updateHotbarSelection();

        // Placement message
        this.placeText = this.add.text(250, 300, "Select a pipe below", {
            fontSize: "28px",
            fill: "#FFFFFF",
            fontFamily: "Courier New"
        }).setOrigin(0.5).setVisible(false);

        // Start and End Visual Cues
        this.pipeGrid[0][0].setTint(0x00ff00); 
        this.pipeGrid[this.gridSize-1][this.gridSize-1].setTint(0xff0000);
    }

    setupGrid() {
        const offsetX = (500 - (this.gridSize * this.tileSize)) / 2 + (this.tileSize / 2);
        const offsetY = (500 - (this.gridSize * this.tileSize)) / 2 + (this.tileSize / 2);

        // Random empty tiles
        let emptyCount = Phaser.Math.Between(5, 10);
        let emptyPositions = new Set();

        while (emptyPositions.size < emptyCount) {
            let x = Phaser.Math.Between(0, this.gridSize - 1);
            let y = Phaser.Math.Between(0, this.gridSize - 1);

            if ((x === 0 && y === 0) || (x === this.gridSize - 1 && y === this.gridSize - 1)) continue;

            emptyPositions.add(`${x},${y}`);
        }

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {

                let isEmpty = emptyPositions.has(`${x},${y}`);
                this.emptyGrid[y][x] = isEmpty;

                if (isEmpty) {
                    let placeholder = new PlaceholderTile(
                        this,
                        offsetX + (x * this.tileSize),
                        offsetY + (y * this.tileSize),
                        x, y
                    );
                    this.pipeGrid[y][x] = placeholder;
                } else {
                    let randomFrame = Phaser.Math.Between(0, 3);
                    let pipe = new Pipe(
                        this,
                        offsetX + (x * this.tileSize),
                        offsetY + (y * this.tileSize),
                        'pipe',
                        randomFrame
                    );
                    pipe.gridX = x;
                    pipe.gridY = y;
                    this.pipeGrid[y][x] = pipe;
                }
            }
        }
    }

    tick() {
        if (this.isLocked || this.placingMode) return;
        this.timer--;
        this.timerText.setText(`TIME: ${this.timer}`);
        if (this.timer <= 0) this.lockAndCheck();
    }

    lockAndCheck() {
        this.isLocked = true;
        this.timerText.setText("FLOWING...");

        this.time.delayedCall(1500, () => {
            const success = this.checkConnection();
            if (success) {
                this.timerText.setText("SUCCESS! SYSTEM STABLE");
                this.time.delayedCall(2000, () => this.nextRound());
            } else {
                this.timerText.setText("CRITICAL LEAK! RESTARTING...");
                this.time.delayedCall(2000, () => this.scene.restart());
            }
        });
    }

    checkConnection() {
        let visited = new Set();
        let queue = [this.pipeGrid[0][0]];

        while (queue.length > 0) {
            let curr = queue.shift();
            if (!curr.getOpenPorts) continue;

            if (curr.gridX === this.gridSize - 1 && curr.gridY === this.gridSize - 1)
                return true;

            let posKey = `${curr.gridX},${curr.gridY}`;
            if (visited.has(posKey)) continue;
            visited.add(posKey);

            let neighbors = this.getValidNeighbors(curr);
            for (let n of neighbors) {
                if (!visited.has(`${n.gridX},${n.gridY}`)) {
                    queue.push(n);
                }
            }
        }
        return false;
    }

    getValidNeighbors(pipe) {
        let valid = [];
        let myOpenings = pipe.getOpenPorts();
        
        const directions = [
            [-1, 0, 'T', 'B'],
            [1, 0, 'B', 'T'],
            [0, -1, 'L', 'R'],
            [0, 1, 'R', 'L']
        ];

        for (let [dy, dx, myPort, targetPort] of directions) {
            let ny = pipe.gridY + dy;
            let nx = pipe.gridX + dx;

            if (ny >= 0 && ny < this.gridSize && nx >= 0 && nx < this.gridSize) {
                let neighbor = this.pipeGrid[ny][nx];
                if (!neighbor.getOpenPorts) continue;

                if (myOpenings.includes(myPort) && neighbor.getOpenPorts().includes(targetPort)) {
                    valid.push(neighbor);
                }
            }
        }
        return valid;
    }

    nextRound() {
        this.round++;

        if (this.round > 3) {
            this.scene.start('mapScene');
            return;
        }

        this.gridSize = Math.min(12, 6 + (this.round - 1) * 3);
        this.timer = Math.max(15, 30 - (this.round * 5));

        // Reset inventory
        this.pipeInventory = { 0:1, 1:1, 2:1, 3:1 };

        this.isLocked = false;
        this.scene.restart();
    }

    updateHotbarSelection() {
        this.hotbarSprites.forEach((s, i) => {
            if (this.pipeInventory[i] <= 0) {
                s.setTint(0x555555);
                s.disableInteractive();
            } else {
                s.setTint(0xffffff);
                s.setInteractive();
            }
        });
    }

    startPlacement(tile) {
        this.placingMode = true;
        this.tileToFill = tile;
        this.placeText.setVisible(true);
    }

    finishPlacement(hotbarIndex) {
        if (!this.tileToFill) return;

        let frame = this.hotbarItems[hotbarIndex];

        // Check inventory
        if (this.pipeInventory[frame] <= 0) return;

        let pipe = new Pipe(
            this,
            this.tileToFill.x,
            this.tileToFill.y,
            'pipe',
            frame
        );

        pipe.gridX = this.tileToFill.gridX;
        pipe.gridY = this.tileToFill.gridY;

        this.pipeGrid[pipe.gridY][pipe.gridX] = pipe;
        this.emptyGrid[pipe.gridY][pipe.gridX] = false;

        this.tileToFill.destroy();

        // Decrement inventory
        this.pipeInventory[frame]--;
        this.updateHotbarSelection();

        this.placingMode = false;
        this.tileToFill = null;
        this.placeText.setVisible(false);
    }
}

class PlaceholderTile extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y, gridX, gridY) {
        super(scene, x, y, 64, 64, 0x444444, 0.4);
        scene.add.existing(this);

        this.gridX = gridX;
        this.gridY = gridY;

        this.setInteractive();

        this.on('pointerdown', () => {
            if (!scene.placingMode) {
                scene.startPlacement(this);
            }
        });
    }
}

class Pipe extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        
        this.setInteractive();
        this.setDisplaySize(64, 64);

        this.on('pointerdown', () => {
            if (!scene.placingMode && !scene.isLocked) {
                this.rotatePipe();
            }
        });
    }

    rotatePipe() {
        this.angle += 90;
        if (this.angle >= 360) this.angle = 0;
    }

    getOpenPorts() {
        let basePorts = [];
        switch(this.frame.name) {
            case 0: basePorts = ['T', 'R', 'B', 'L']; break;
            case 1: basePorts = ['L', 'B']; break;
            case 2: basePorts = ['L', 'R']; break;
            case 3: basePorts = ['L', 'T', 'B']; break;
        }

        let shifts = Math.floor(this.angle / 90) % 4;
        let portOrder = ['T', 'R', 'B', 'L'];
        
        return basePorts.map(p => {
            let idx = portOrder.indexOf(p);
            return portOrder[(idx + shifts) % 4];
        });
    }
}
