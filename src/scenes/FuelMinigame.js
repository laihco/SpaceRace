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
    }

    create() {
        // Create the grid array
        for (let i = 0; i < this.gridSize; i++) {
            this.pipeGrid[i] = new Array(this.gridSize);
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

        // Start and End Visual Cues
        // Start is Top-Left (0,0), End is Bottom-Right (5,5)
        this.pipeGrid[0][0].setTint(0x00ff00); 
        this.pipeGrid[this.gridSize-1][this.gridSize-1].setTint(0xff0000);
    }

    setupGrid() {
        const offsetX = (500 - (this.gridSize * this.tileSize)) / 2 + (this.tileSize / 2);
        const offsetY = (500 - (this.gridSize * this.tileSize)) / 2 + (this.tileSize / 2);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                // Frames 0-3 correspond to your 2x2 sheet
                let randomFrame = Phaser.Math.Between(0, 3);
                let pipe = new Pipe(this, offsetX + (x * this.tileSize), offsetY + (y * this.tileSize), 'pipe', randomFrame);
                
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
            if (curr.gridX === this.gridSize - 1 && curr.gridY === this.gridSize - 1) return true;

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
        
        // [y_diff, x_diff, direction_from_me, required_direction_on_neighbor]
        const directions = [
            [-1, 0, 'T', 'B'], // Neighbor is Above me
            [1, 0, 'B', 'T'],  // Neighbor is Below me
            [0, -1, 'L', 'R'], // Neighbor is Left of me
            [0, 1, 'R', 'L']   // Neighbor is Right of me
        ];

        for (let [dy, dx, myPort, targetPort] of directions) {
            let ny = pipe.gridY + dy;
            let nx = pipe.gridX + dx;

            if (ny >= 0 && ny < this.gridSize && nx >= 0 && nx < this.gridSize) {
                let neighbor = this.pipeGrid[ny][nx];
                if (myOpenings.includes(myPort) && neighbor.getOpenPorts().includes(targetPort)) {
                    if (neighbor.stateMachine.state !== 'broken') {
                        valid.push(neighbor);
                    }
                }
            }
        }
        return valid;
    }

    nextRound() {
        this.round++;
        this.timer = Math.max(10, 35 - (this.round * 5));
        this.isLocked = false;
        // Degrade pipe health
        for(let row of this.pipeGrid) {
            for(let p of row) { p.degrade(); }
        }
        this.scene.restart(); // Simple way to reset visuals for next round
    }
}

class Pipe extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        
        this.setInteractive();
        this.setDisplaySize(64, 64); // Force size to match grid
        
        this.stateMachine = new StateMachine('stable', {
            stable: new StableState(),
            leaking: new LeakingState(),
            broken: new BrokenState()
        }, [this]);

        this.on('pointerdown', () => this.rotatePipe());
    }

    rotatePipe() {
        if (this.scene.isLocked || this.stateMachine.state === 'broken') return;
        this.angle += 90;
        // Normalize angle to 0, 90, 180, 270
        if (this.angle >= 360) this.angle = 0;
    }

    getOpenPorts() {
        // Frame mapping (based on 2x2 sheet):
        // 0 (1,1): Cross (+)
        // 1 (2,1): L-shape (┘) - assume connects Left and Bottom at 0 deg
        // 2 (1,2): Straight (-) - assume connects Left and Right at 0 deg
        // 3 (2,2): T-shape (┴) - assume connects Left, Top, Bottom at 0 deg
        
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

    degrade() {
        if (this.stateMachine.state === 'stable' && Math.random() > 0.8) {
            this.stateMachine.transition('leaking');
        } else if (this.stateMachine.state === 'leaking') {
            this.stateMachine.transition('broken');
        }
    }
}

// --- States ---
class StableState extends State {
    enter(pipe) { pipe.clearTint(); }
}
class LeakingState extends State {
    enter(pipe) { pipe.setTint(0xFFCC00); } 
}
class BrokenState extends State {
    enter(pipe) { 
        pipe.setTint(0x555555); 
        pipe.disableInteractive();
    }
}