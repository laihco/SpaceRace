class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }

    init(data) {
        this.reason = (data && data.reason) ? data.reason : 'SYSTEM FAILURE';
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        this.add.rectangle(0, 0, w, h, 0x000000, 1).setOrigin(0).setDepth(0);
        this.add.rectangle(w / 2, h / 2, w - 20, h - 20)
            .setStrokeStyle(1, 0x00ff00, 0.25)
            .setFillStyle(0x000000, 0);

        //use same font
        const title = this.add.text(w / 2, h / 2 - 60, 'GAME OVER', {
            fontFamily: 'spaceranger',
            fontSize: '48px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        const reasonText = this.add.text(w / 2, h / 2, this.reason, {
            fontFamily: 'spaceranger',
            fontSize: '20px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: w - 80 }
        }).setOrigin(0.5).setAlpha(0);

        const hint = this.add.text(w / 2, h / 2 + 80, 'PRESS R TO RESTART', {
            fontFamily: 'spaceranger',
            fontSize: '16px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: title, alpha: 1, duration: 800, ease: 'Power2' });
        this.tweens.add({ targets: reasonText, alpha: 1, duration: 800, delay: 400, ease: 'Power2' });
        this.tweens.add({
            targets: hint,
            alpha: 1,
            duration: 800,
            delay: 1200,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: hint,
                    alpha: 0.3,
                    duration: 900,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // restart on R
        this.input.keyboard.once('keydown-R', () => {
            this.restartGame();
        });
    }

    restartGame() {
        // stop all minigames
        ['trashScene', 'planetSelectScene', 'navigationScene', 'pressureScene', 'farm'].forEach((key) => {
            if (this.scene.get(key)) {
                this.scene.stop(key);
            }
        });

        this.scene.stop('mapScene');
        this.scene.start('mapScene');
        this.scene.stop();
    }
}
