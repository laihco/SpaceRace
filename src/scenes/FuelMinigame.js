class PressureScene extends Phaser.Scene {
    constructor() {
        super('pressureScene');
    }

    init() {
        this.gridSize = 6;
        this.tileSize = 64;
        this.timer = 10;
        this.isLocked = false;
        this.pipeGrid = [];
    }

    preload() {
        this.load.path = './assets/'
        this.load.image('closeButton', 'close_button.png');
    }

    create() {
        this.add.rectangle(0, 0, game.config.width, game.config.height, 0x000000, 0.5).setOrigin(0);
        this.add.rectangle(game.config.width/2, game.config.height/2, 350, 350, 0x405080).setOrigin(0.5);

        const closeButton = this.add.image(75, 75, 'closeButton').setScale(0.1).setInteractive();
        closeButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('mapScene');
        });

        for (let i = 0; i < this.gridSize; i++) {
            this.pipeGrid[i] = new Array(this.gridSize);
        }

        this.setupGrid();

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

        // Start and End
        this.pipeGrid[0][0].setTint(0x00ff00);
        this.pipeGrid[this.gridSize-1][this.gridSize-1].setTint(0xff0000);
    }

    setupGrid() {
        const popupX = game.config.width / 2 - 175;
        const popupY = game.config.height / 2 - 175;

        const padding = 10;
        const availableSpace = 350 - padding * 2;
        this.tileSize = Math.floor(availableSpace / this.gridSize);

        const offsetX = popupX + padding + this.tileSize / 2;
        const offsetY = popupY + padding + this.tileSize / 2;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
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

    tick() {
        if (this.isLocked) return;
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

                // add 25 fuel to map scene
                const mapScene = this.scene.get('mapScene');
                if (mapScene) {
                    mapScene.fuel = Math.min(100, mapScene.fuel + 25);
                }

                this.time.delayedCall(2000, () => {
                    // show "FUEL REFILLED" text in center of screen then close
                    this.timerText.setText("");
                    const refillText = this.add.text(
                        game.config.width / 2,
                        game.config.height / 2,
                        "FUEL REFILLED",
                        {
                            fontSize: '36px',
                            fill: '#00FF00',
                            fontFamily: 'Courier New',
                            stroke: '#000000',
                            strokeThickness: 4
                        }
                    ).setOrigin(0.5).setDepth(300);

                    this.time.delayedCall(2000, () => {
                        this.scene.stop();
                        this.scene.resume('mapScene');
                    });
                });
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
            if (curr.gridX === this.gridSize - 1 && curr.gridY === this.gridSize - 1)
                return true;

            let posKey = `${curr.gridX},${curr.gridY}`;
            if (visited.has(posKey)) continue;
            visited.add(posKey);

            for (let n of this.getValidNeighbors(curr)) {
                if (!visited.has(`${n.gridX},${n.gridY}`)) queue.push(n);
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
                if (myOpenings.includes(myPort) && neighbor.getOpenPorts().includes(targetPort)) {
                    valid.push(neighbor);
                }
            }
        }
        return valid;
    }
}

class Pipe extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);

        this.setInteractive();
        this.setDisplaySize(scene.tileSize, scene.tileSize);

        this.on('pointerdown', () => {
            if (!scene.isLocked) this.rotatePipe();
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