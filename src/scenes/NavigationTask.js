class NavigationTask extends Phaser.Scene {
    constructor() {
        super('navigationScene');
    }

    init() {
        this.angleStep = 45;
        this.targetAngles = this.generateTargetAngles();
        this.currentAngles = [0, 0, 0];
        this.isSolved = false;
        this.feedbackText = null;
        this.photoLayers = [];
        this.dialLabels = [];
    }

    create() {
        // dark bg so the minigame pops out
        this.add.rectangle(0, 0, game.config.width, game.config.height, 0x000000, 0.55).setOrigin(0);

        // main minigame box
        this.add.rectangle(centerX, centerY, 380, 360, 0x000000).setStrokeStyle(2, 0x00ff88);

        this.add.text(centerX, 82, 'Develop Photo', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#39FF14'
        }).setOrigin(0.5);

        this.add.text(centerX, 108, 'Turn each valve to the correct angle', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#39FF14'
        }).setOrigin(0.5);

        const closeButton = this.add.text(415, 78, 'X', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#39FF14'
        }).setInteractive({ useHandCursor: true });

        // close minigame
        closeButton.on('pointerdown', () => {
            this.closeMinigame();
        });

        const dialX = [140, 250, 360];

        for (let i = 0; i < 3; i++) {
            this.createDial(dialX[i], 190, i);
        }

        // image area
        this.createPhoto();

        this.feedbackText = this.add.text(centerX, 392, 'Open the valves to develop the image', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#39FF14'
        }).setOrigin(0.5);
    }

    generateTargetAngles() {
        const anglePool = [];

        for (let angle = 0; angle < 360; angle += 45) {
            anglePool.push(angle);
        }

        return Phaser.Utils.Array.Shuffle(anglePool).slice(0, 3);
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

        const targetLabel = this.add.text(x, y + 60, `Target: ${this.targetAngles[index]}°`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#39FF14'
        }).setOrigin(0.5);

        this.dialLabels.push(targetLabel);
    }

    createPhoto() {
        // photo frame
        this.add.rectangle(centerX, 312, 180, 96, 0x000000).setStrokeStyle(2, 0x00ff88);

        this.photoLayers = [
            this.createStarLayer(),
            this.createPlanetLayer(),
            this.createAccentLayer()
        ];
    }

    createStarLayer() {
        const stars = [];
        const starCount = Phaser.Math.Between(7, 12);

        for (let i = 0; i < starCount; i++) {
            const x = Phaser.Math.Between(centerX - 78, centerX + 78);
            const y = Phaser.Math.Between(274, 344);
            const radius = Phaser.Math.Between(1, 3);

            const glow = this.add.circle(x, y, radius + 1)
                .setFillStyle(0x00ff88, 0.18)
                .setAlpha(0);
            const star = this.add.circle(x, y, radius, 0x00ff88)
                .setAlpha(0);

            stars.push(glow, star);
        }

        return stars;
    }

    createPlanetLayer() {
        const planetLayers = [];
        const planetCount = Phaser.Math.Between(1, 2);

        for (let i = 0; i < planetCount; i++) {
            const x = Phaser.Math.Between(centerX - 45, centerX + 45);
            const y = Phaser.Math.Between(290, 325);
            const radius = Phaser.Math.Between(12, 24);
            const fillAlpha = Phaser.Math.FloatBetween(0.55, 0.85);

            const outline = this.add.circle(x, y, radius)
                .setStrokeStyle(3, 0x00ff88)
                .setFillStyle(0x00ff88, 0)
                .setAlpha(0);
            const fill = this.add.circle(x, y, radius - 3, 0x00ff88)
                .setAlpha(0)
                .setFillStyle(0x00ff88, fillAlpha);

            planetLayers.push(outline, fill);

            if (Phaser.Math.Between(0, 1) === 1) {
                const moon = this.add.circle(
                    x + Phaser.Math.Between(-22, 22),
                    y + Phaser.Math.Between(-18, 18),
                    Phaser.Math.Between(3, 6)
                )
                    .setStrokeStyle(2, 0x00ff88)
                    .setFillStyle(0x00ff88, 0)
                    .setAlpha(0);

                planetLayers.push(moon);
            }
        }

        return planetLayers;
    }

    createAccentLayer() {
        const accentType = Phaser.Math.Between(0, 2);

        if (accentType === 0) {
            return this.createRingLayer();
        }

        if (accentType === 1) {
            return this.createCometLayer();
        }

        return this.createNebulaLayer();
    }

    createRingLayer() {
        const x = Phaser.Math.Between(centerX - 28, centerX + 28);
        const y = Phaser.Math.Between(295, 320);
        const width = Phaser.Math.Between(60, 88);
        const height = Phaser.Math.Between(14, 24);

        const ring = this.add.ellipse(x, y, width, height)
            .setStrokeStyle(4, 0x00ff88)
            .setFillStyle(0x00ff88, 0)
            .setAngle(Phaser.Math.Between(-25, 25))
            .setAlpha(0);
        const ringGlow = this.add.ellipse(x, y, width + 12, height + 6)
            .setStrokeStyle(1, 0x00ff88, 0.35)
            .setFillStyle(0x00ff88, 0)
            .setAngle(ring.angle)
            .setAlpha(0);

        return [ring, ringGlow];
    }

    createCometLayer() {
        const x = Phaser.Math.Between(centerX - 55, centerX + 55);
        const y = Phaser.Math.Between(280, 338);
        const tailLength = Phaser.Math.Between(26, 40);
        const tailAngle = Phaser.Math.Between(20, 60);

        const cometHead = this.add.circle(x, y, 5, 0x00ff88).setAlpha(0);
        const cometGlow = this.add.circle(x, y, 9)
            .setFillStyle(0x00ff88, 0.2)
            .setAlpha(0);
        const cometTail = this.add.line(
            x,
            y,
            0,
            0,
            -tailLength,
            0,
            0x00ff88,
            0.85
        )
            .setLineWidth(3)
            .setAngle(tailAngle)
            .setAlpha(0);

        return [cometGlow, cometHead, cometTail];
    }

    createNebulaLayer() {
        const nebula = [];
        const cloudCount = Phaser.Math.Between(2, 3);

        for (let i = 0; i < cloudCount; i++) {
            const cloud = this.add.ellipse(
                Phaser.Math.Between(centerX - 55, centerX + 55),
                Phaser.Math.Between(286, 336),
                Phaser.Math.Between(26, 50),
                Phaser.Math.Between(12, 24),
                0x00ff88,
                Phaser.Math.FloatBetween(0.18, 0.35)
            )
                .setAngle(Phaser.Math.Between(-35, 35))
                .setAlpha(0);

            nebula.push(cloud);
        }

        return nebula;
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

        if (!solved) {
            return;
        }

        this.isSolved = true;
        this.feedbackText.setText('PHOTO DEVELOPED');
        this.feedbackText.setColor('#39FF14');

        // close after success
        this.time.delayedCall(1000, () => {
            this.closeMinigame();
        });
    }

    closeMinigame() {
        // go back to map
        this.scene.stop();
        this.scene.resume('mapScene');
    }
}
