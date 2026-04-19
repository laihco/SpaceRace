class NavigationTask extends Phaser.Scene {
    constructor() {
        super('navigationScene');
    }

    init(data) {
        this.targetAngles = [90, 180, 270];
        this.currentAngles = [0, 0, 0];
        this.angleStep = 45;
        this.isSolved = false;
        this.feedbackText = null;
        this.photoLayers = [];
        this.selectedPlanet = (data && data.planet)
            ? data.planet
            : { id: 'unknown', name: 'UNKNOWN', color: 0x00ff88, distance: '???' };
    }

    create() {
        // dark bg so the minigame pops out
        this.add.rectangle(0, 0, game.config.width, game.config.height, 0x000000, 0.55).setOrigin(0);

        // main minigame box
        this.add.rectangle(centerX, centerY, 380, 360, 0x000000).setStrokeStyle(2, 0x00ff88);

        const closeButton = this.add.text(415, 78, 'X', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#39FF14'
        }).setInteractive({ useHandCursor: true });

        closeButton.on('pointerdown', () => {
            this.closeMinigame();
        });

        this.add.text(centerX, 82, `COURSE: ${this.selectedPlanet.name}`, {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#39FF14'
        }).setOrigin(0.5);

        this.add.text(centerX, 108, 'Turn each valve to the correct angle', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#39FF14'
        }).setOrigin(0.5);

        const dialX = [140, 250, 360];
        for (let i = 0; i < 3; i++) {
            this.createDial(dialX[i], 190, i);
        }

        // image area
        this.createPhoto();

        this.feedbackText = this.add.text(centerX, 392, 'Open the valves to lock the course', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#39FF14'
        }).setOrigin(0.5);
    }

    createDial(x, y, index) {
        // valve body
        this.add.circle(x, y, 42, 0x000000).setStrokeStyle(3, 0x00ff88);
        this.add.circle(x, y, 6, 0x00ff88);

        // target line
        const targetPointer = this.add.line(x, y, 0, 0, 0, -28, 0x00ff88)
            .setLineWidth(3)
            .setAlpha(0.4);
        targetPointer.setAngle(this.targetAngles[index]);

        // player line
        const livePointer = this.add.line(x, y, 0, 0, 0, -30, 0x00ff88)
            .setLineWidth(5);
        livePointer.setAngle(this.currentAngles[index]);

        // click area for turning valve
        const clickZone = this.add.circle(x, y, 48, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        clickZone.on('pointerdown', () => {
            if (this.isSolved) return;

            // turn valve
            this.currentAngles[index] = (this.currentAngles[index] + this.angleStep) % 360;
            livePointer.setAngle(this.currentAngles[index]);
            this.checkSolution();
        });

        this.add.text(x, y - 65, `Dial ${index + 1}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#39FF14'
        }).setOrigin(0.5);

        this.add.text(x, y + 60, `Target: ${this.targetAngles[index]}°`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#39FF14'
        }).setOrigin(0.5);
    }

    createPhoto() {
        // photo frame
        this.add.rectangle(centerX, 312, 180, 96, 0x000000).setStrokeStyle(2, 0x00ff88);

        // first valve shows outline
        const radarCircle = this.add.circle(centerX, 308, 30)
            .setStrokeStyle(4, 0x00ff88)
            .setFillStyle(0x00ff88, 0)
            .setAlpha(0);
        const radarGlow = this.add.circle(centerX, 308, 36)
            .setStrokeStyle(1, 0x00ff88, 0.35)
            .setFillStyle(0x00ff88, 0)
            .setAlpha(0);

        // second valve fills the planet
        const planetFill = this.add.circle(centerX, 308, 27, 0x00ff88)
            .setAlpha(0);

        // third valve adds the ring
        const ring = this.add.ellipse(centerX, 308, 84, 20)
            .setStrokeStyle(4, 0x00ff88)
            .setFillStyle(0x00ff88, 0)
            .setAlpha(0);
        const ringBack = this.add.ellipse(centerX, 308, 96, 26)
            .setStrokeStyle(1, 0x00ff88, 0.35)
            .setFillStyle(0x00ff88, 0)
            .setAlpha(0);

        this.photoLayers = [
            [radarCircle, radarGlow],
            [planetFill],
            [ring, ringBack]
        ];
    }

    checkSolution() {
        // reveal each part when the valve is correct
        this.currentAngles.forEach((angle, index) => {
            const isCorrect = angle === this.targetAngles[index];
            this.photoLayers[index].forEach((layer) => {
                layer.setAlpha(isCorrect ? 1 : 0);
            });
        });

        const solved = this.currentAngles.every((angle, index) => angle === this.targetAngles[index]);
        if (!solved) return;

        this.isSolved = true;
        this.feedbackText.setText(`COURSE LOCKED · JUMPING TO ${this.selectedPlanet.name}`);
        this.feedbackText.setColor('#39FF14');

        const mapScene = this.scene.get('mapScene');
        if (mapScene && typeof mapScene.startTravel === 'function') {
            mapScene.startTravel(this.selectedPlanet);
        }

        this.time.delayedCall(1200, () => {
            this.closeMinigame();
        });
    }

    closeMinigame() {
        // go back to map
        this.scene.stop();
        this.scene.resume('mapScene');
    }
}
