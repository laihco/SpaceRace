class Farm extends Phaser.Scene {
    constructor() {
        super('farm');
    }

    preload() {

    }

    create() {
        // forest green background
        this.add.rectangle(250, 250, 500, 500, 0x2d5a27);

        // title
        this.add.text(250, 20, 'Farm', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // 3x3 grid
        this.plots = [];
        const plotSize = 80;
        const padding = 20;
        const startX = 250 - (plotSize + padding);
        const startY = 250 - (plotSize + padding);

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                let x = startX + col * (plotSize + padding);
                let y = startY + row * (plotSize + padding);
                let plot = this.add.rectangle(x, y, plotSize, plotSize, 0x8B4513).setInteractive();
                let index = this.plots.length;
                plot.on('pointerdown', (pointer, localX, localY, event) => {
                    event.stopPropagation();
                    if (this.plots[index].state === 'ready') {
                        this.harvestPlot(index);
                    } else {
                        this.plantSeed(plot, index);
                    }
                });

                this.plots.push({ rect: plot, x, y, state: 'empty', seedIndex: null });
            }
        }


        this.createSeedInventory();

        // exit button
        let exitBtn = this.add.text(470, 15, 'X', {
            fontSize: '18px',
            fill: '#ff0000'
        }).setOrigin(0.5).setInteractive();

        exitBtn.on('pointerdown', () => {
            this.scene.sleep('farm');
            this.scene.wake('mapScene');
        });
    }
    createSeedInventory() {
        // seed data
        this.seeds = [
            { name: 'Lettuce', count: 5, color: 0x90ee90, hunger: 10, growTime: 15000 },
            { name: 'Carrot',  count: 4, color: 0xff8c00, hunger: 15, growTime: 25000 },
            { name: 'Tomato',  count: 3, color: 0xff4500, hunger: 20, growTime: 35000 },
            { name: 'Potato',  count: 2, color: 0xd2b48c, hunger: 30, growTime: 50000 },
        ];

        this.selectedSeed = null;

        // inventory panel background
        this.add.rectangle(50, 250, 90, 220, 0x1a1a1a, 0.7).setOrigin(0.5);
        this.add.text(50, 145, 'Seeds', { fontSize: '13px', fill: '#ffffff' }).setOrigin(0.5);

        this.seedUI = [];

        this.seeds.forEach((seed, i) => {
            let y = 175 + i * 50;

            // seed color box
            let box = this.add.rectangle(30, y, 30, 30, seed.color).setInteractive();

            // seed name + count
            let label = this.add.text(55, y, `${seed.count}`, {
                fontSize: '12px',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);

            // click to select
            box.on('pointerdown', () => {
                this.selectSeed(i);
            });
            label.setInteractive();
            label.on('pointerdown', () => {
                this.selectSeed(i);
            });

            this.seedUI.push({ box, label });
        });
    }
    selectSeed(index) {
        // deselect all first
        this.seedUI.forEach((ui, i) => {
            ui.box.setStrokeStyle(0);
        });

        if (this.seeds[index].count <= 0) return; // can't select if no seeds

        this.selectedSeed = index;
        // highlight selected with white border
        this.seedUI[index].box.setStrokeStyle(2, 0xffffff);
    }
    plantSeed(plot, plotIndex) {
        let p = this.plots[plotIndex];

        if (p.state !== 'empty' || this.selectedSeed === null) return;

        let seed = this.seeds[this.selectedSeed];
        if (seed.count <= 0) return;

        seed.count--;
        this.seedUI[this.selectedSeed].label.setText(`${seed.count}`);

        p.state = 'growing';
        p.seedIndex = this.selectedSeed;
        p.rect.setFillStyle(seed.color);
        p.endTime = this.time.now + seed.growTime;

        // countdown text on the plot
        p.timerText = this.add.text(p.x, p.y, '', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        let stageDuration = seed.growTime / 3;
        p.rect.setAlpha(0.3);

        this.time.delayedCall(stageDuration, () => {
            if (p.state === 'growing') p.rect.setAlpha(0.6);
        });

        this.time.delayedCall(stageDuration * 2, () => {
            if (p.state === 'growing') p.rect.setAlpha(0.8);
        });
    }
    update() {
        this.plots.forEach(p => {
            if (p.state === 'growing') {
                let timeLeft = p.endTime - this.time.now;

                if (timeLeft <= 0) {
                    p.state = 'ready';
                    p.rect.setAlpha(1);
                    p.rect.setStrokeStyle(3, 0xffffff);
                    if (p.timerText) p.timerText.setText('Ready!');
                } else {
                    let seconds = Math.ceil(timeLeft / 1000);
                    if (p.timerText) p.timerText.setText(`${seconds}s`);
                }
            }
        });
    }
    harvestPlot(plotIndex) {
        let p = this.plots[plotIndex];
        let seed = this.seeds[p.seedIndex];

        // add food to map scene
        let mapScene = this.scene.get('mapScene');
        mapScene.food = Math.min(150, mapScene.food + seed.hunger);

        // add one seed back
        seed.count++;
        this.seedUI[p.seedIndex].label.setText(`${seed.count}`);

        // reset plot
        p.state = 'empty';
        p.seedIndex = null;
        p.rect.setFillStyle(0x8B4513);
        p.rect.setAlpha(1);
        p.rect.setStrokeStyle(0);
        if (p.timerText) {
            p.timerText.destroy();
            p.timerText = null;
        }
        if (p.timerEvent) {
            p.timerEvent.remove();
            p.timerEvent = null;
        }
    }
}