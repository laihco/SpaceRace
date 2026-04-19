const PLANETS = [
    { id: 'mercury', name: 'MERCURY', color: 0xb4b4b4, auKm: 57_900_000, spriteKey: 'mercurySprite', animKey: 'mercury_spin', frames: 50 },
    { id: 'venus',   name: 'VENUS',   color: 0xeed592, auKm: 108_200_000, spriteKey: 'venusSprite', animKey: 'venus_spin', frames: 50 },
    { id: 'earth',   name: 'EARTH',   color: 0x4a90e2, auKm: 149_600_000, spriteKey: 'earthSprite', animKey: 'earth_spin', frames: 50 },
    { id: 'mars',    name: 'MARS',    color: 0xff5533, auKm: 227_900_000, spriteKey: 'marsSprite', animKey: 'mars_spin', frames: 50 },
    { id: 'jupiter', name: 'JUPITER', color: 0xd4a373, auKm: 778_500_000, spriteKey: 'jupiterSprite', animKey: 'jupiter_spin', frames: 50 },
    { id: 'saturn',  name: 'SATURN',  color: 0xf0d27a, auKm: 1_433_500_000, spriteKey: 'saturnSprite', animKey: 'saturn_spin', frames: 50 },
    { id: 'uranus',  name: 'URANUS',  color: 0x88d8d8, auKm: 2_872_500_000, spriteKey: 'uranusSprite', animKey: 'uranus_spin', frames: 50 },
    { id: 'neptune', name: 'NEPTUNE', color: 0x4b70dd, auKm: 4_495_100_000, spriteKey: 'neptuneSprite', animKey: 'neptune_spin', frames: 50 }
];

function getPlanetById(id) {
    const found = PLANETS.find((p) => p.id === id);
    if (found) return found;
    return PLANETS.find((p) => p.id === 'earth');
}

function distanceBetween(a, b) {
    if (!a || !b || typeof a.auKm !== 'number' || typeof b.auKm !== 'number') return 0;
    return Math.abs(a.auKm - b.auKm);
}

function formatDistanceKm(km) {
    if (!isFinite(km) || km <= 0) return '0 km';
    if (km >= 9.461e12) return (km / 9.461e12).toFixed(1) + ' ly';
    if (km >= 1e9) return (km / 1e9).toFixed(2) + 'B km';
    if (km >= 1e6) return (km / 1e6).toFixed(1) + 'M km';
    if (km >= 1e3) return (km / 1e3).toFixed(1) + 'K km';
    return Math.floor(km) + ' km';
}

class PlanetSelect extends Phaser.Scene {
    constructor() {
        super('planetSelectScene');
    }

    init(data) {
        this.currentId = (data && data.currentId) ? data.currentId : 'earth';
    }
    //preload the spritesheets
    preload() {
        this.load.path = './assets/';
        if (!this.textures.exists('mercurySprite')) {
            this.load.spritesheet('mercurySprite', 'mercury.png', { frameWidth: 100, frameHeight: 100 });
        }
        if (!this.textures.exists('venusSprite')) {
            this.load.spritesheet('venusSprite', 'venus.png', { frameWidth: 100, frameHeight: 100 });
        }
        if (!this.textures.exists('earthSprite')) {
            this.load.spritesheet('earthSprite', 'earth.png', { frameWidth: 100, frameHeight: 100 });
        }
        if (!this.textures.exists('marsSprite')) {
            this.load.spritesheet('marsSprite', 'mars.png', { frameWidth: 100, frameHeight: 100 });
        }
        if (!this.textures.exists('jupiterSprite')) {
            this.load.spritesheet('jupiterSprite', 'jupiter.png', { frameWidth: 100, frameHeight: 100 });
        }
        if (!this.textures.exists('saturnSprite')) {
            this.load.spritesheet('saturnSprite', 'saturn.png', { frameWidth: 300, frameHeight: 300 });
        }
        if (!this.textures.exists('uranusSprite')) {
            this.load.spritesheet('uranusSprite', 'uranus.png', { frameWidth: 100, frameHeight: 100 });
        }
        if (!this.textures.exists('neptuneSprite')) {
            this.load.spritesheet('neptuneSprite', 'neptune.png', { frameWidth: 100, frameHeight: 100 });
        }
    }

    //create the planet select scene
    create() {
        const spinAnims = [
            { key: 'mercury_spin', sheet: 'mercurySprite' },
            { key: 'venus_spin',   sheet: 'venusSprite' },
            { key: 'earth_spin',   sheet: 'earthSprite' },
            { key: 'mars_spin',    sheet: 'marsSprite' },
            { key: 'jupiter_spin', sheet: 'jupiterSprite' },
            { key: 'saturn_spin',  sheet: 'saturnSprite' },
            { key: 'uranus_spin',  sheet: 'uranusSprite' },
            { key: 'neptune_spin', sheet: 'neptuneSprite' }
        ];
        spinAnims.forEach(({ key, sheet }) => {
            if (this.textures.exists(sheet) && !this.anims.exists(key)) {
                this.anims.create({
                    key,
                    frames: this.anims.generateFrameNumbers(sheet, { start: 0, end: 49 }),
                    frameRate: 9,
                    repeat: -1
                });
            }
        });

        const current = getPlanetById(this.currentId);

        this.add.rectangle(0, 0, game.config.width, game.config.height, 0x000000, 0.55).setOrigin(0);
        this.add.rectangle(centerX, centerY, 380, 360, 0x000000).setStrokeStyle(2, 0x00ff88);

        const closeButton = this.add.text(415, 78, 'X', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#39FF14'
        }).setInteractive({ useHandCursor: true });

        closeButton.on('pointerdown', () => {
            this.closeSelf();
        });

        this.add.text(centerX, 82, 'SELECT DESTINATION', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#39FF14'
        }).setOrigin(0.5);

        this.add.text(centerX, 106, `CURRENT LOCATION: ${current.name}`, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#39FF14'
        }).setOrigin(0.5).setAlpha(0.85);

        const cols = 4;
        const cellW = 82;
        const cellH = 95;
        const gapX = 10;
        const gapY = 14;
        const totalW = cols * cellW + (cols - 1) * gapX;
        const startX = centerX - totalW / 2 + cellW / 2;
        const startY = 180;

        PLANETS.forEach((p, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (cellW + gapX);
            const y = startY + row * (cellH + gapY);

            const isCurrent = p.id === this.currentId;
            const cell = this.add.rectangle(x, y, cellW, cellH, 0x000000)
                .setStrokeStyle(1, isCurrent ? 0xffaa00 : 0x00ff88, isCurrent ? 1 : 0.6);

            let icon;
            if (p.spriteKey && this.textures.exists(p.spriteKey)) {
                icon = this.add.sprite(x, y - 22, p.spriteKey).setDisplaySize(36, 36);
                if (p.animKey && this.anims.exists(p.animKey)) {
                    icon.play(p.animKey);
                }
            } else {
                icon = this.add.circle(x, y - 22, 16, p.color)
                    .setStrokeStyle(2, isCurrent ? 0xffaa00 : 0x00ff88, 0.7);
            }

            this.add.text(x, y + 6, p.name, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#39FF14'
            }).setOrigin(0.5);

            const distLabel = isCurrent
                ? 'CURRENT'
                : formatDistanceKm(distanceBetween(current, p));
            this.add.text(x, y + 26, distLabel, {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: isCurrent ? '#ffaa00' : '#39FF14'
            }).setOrigin(0.5).setAlpha(isCurrent ? 1 : 0.85);

            if (!isCurrent) {
                cell.setInteractive({ useHandCursor: true });
                cell.on('pointerover', () => {
                    cell.setStrokeStyle(2, 0x00ff88, 1);
                    cell.setFillStyle(0x00ff88, 0.08);
                });
                cell.on('pointerout', () => {
                    cell.setStrokeStyle(1, 0x00ff88, 0.6);
                    cell.setFillStyle(0x000000, 1);
                });
                cell.on('pointerdown', () => {
                    this.selectPlanet(p);
                });
            } else {
                icon.setAlpha(0.5);
            }
        });

        this.add.text(centerX, 408, 'CLICK A PLANET TO PLOT A COURSE', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#39FF14'
        }).setOrigin(0.5).setAlpha(0.7);
    }

    //select a planet and start the navigation minigame
    selectPlanet(planet) {
        this.scene.stop();
        this.scene.launch('navigationScene', { planet });
    }

    //close the planet select scene and resume the map scene
    closeSelf() {
        this.scene.stop();
        this.scene.resume('mapScene');
    }
}
