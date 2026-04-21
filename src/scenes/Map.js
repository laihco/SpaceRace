class Map extends Phaser.Scene {
    constructor() {
        super('mapScene');
    }

    preload() {
        this.load.path = "./assets/";

        this.load.spritesheet('map', 'bg_anim.png', {
            frameWidth: 155,
            frameHeight: 146
        });

        this.load.json('transmissions', 'transmissions.json');
    }

    create() {
        this.anims.create({
            key: 'map_anim',
            frames: this.anims.generateFrameNumbers('map', { start: 0, end: 3 }),
            frameRate: 7,
            repeat: -1
        });

        this.bgMap = this.add.sprite(0, 0, 'map')
            .setOrigin(0)
            .setDepth(1)
            .setScale(3.3);

        this.bgMap.setFrame(0);


        this.keys = this.input.keyboard.createCursorKeys();

        this.createUI()
        this.ui.setDepth(100)
        console.log(this.ui)

        this.time.addEvent({
            delay: 600000, // 10 minutes
            loop: true,
            callback: () => {
                this.triggerSleepWarning();
            }
        });

        // load transmission data
        this.transmissions = this.cache.json.get('transmissions').transmissions;

        this.transmissionText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            "",
            {
                fontFamily: 'spaceranger',
                fontSize: '22px',
                color: '#00ff00',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center',
                wordWrap: { width: 500 }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(200)
        .setAlpha(0);

        this.scheduleNextTransmission();

        // mini game scene testing purpose
        this.navButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N); // navigation minigame key
        this.trashGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.craftGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.refuelGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.farmKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    }

    update(time, delta) {

        // mini game scene testing purpose
        if (Phaser.Input.Keyboard.JustDown(this.trashGame))
        {
            this.scene.pause();
            this.scene.launch("trashScene");
        }

        if (Phaser.Input.Keyboard.JustDown(this.craftGame))
        {
            this.scene.pause();
            this.scene.launch("craftScene");
        }

        if (Phaser.Input.Keyboard.JustDown(this.navButton) && !this.destination && !this.scene.isActive('planetSelectScene') && !this.scene.isActive('navigationScene'))
        {
            this.scene.pause();
            this.scene.launch("planetSelectScene", { currentId: this.currentLocation ? this.currentLocation.id : 'earth' });
        }

        // example: slowly drain stats
        if (Phaser.Input.Keyboard.JustDown(this.farmKey)) {
            this.scene.sleep('mapScene');
            if (this.scene.isSleeping('farm')) {
                this.scene.wake('farm');
            } else {
                this.scene.launch('farm');
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.refuelGame))
        {
            this.scene.launch("pressureScene");
        }

        const fuelDrain = this.destination ? 0.015 : 0.01;
        this.fuel -= fuelDrain;
        this.trash += 0.01;
        this.food -= 0.008;

        if (this.destination) {
            if (this.bgMap && (!this.bgMap.anims || !this.bgMap.anims.isPlaying)) {
                this.bgMap.play('map_anim');
            }
            const elapsed = this.time.now - this.travelStart;
            const progress = Math.min(1, elapsed / this.travelTotalMs);
            this.remainingKm = this.travelTotalKm * (1 - progress);
            if (progress >= 1) {
                this.arriveAtDestination();
            }
        }

        this.updateUI();
        if (!this.isGameOver && this.fuel <= 0) {
            this.triggerGameOver('FUEL DEPLETED');
        }
        if (!this.isGameOver && this.food <= 0) {
            this.triggerGameOver('STARVED TO DEATH');
        }
    }

    triggerGameOver(reason) {
        this.isGameOver = true;
        if (this.fuel < 0) this.fuel = 0;
        if (this.food < 0) this.food = 0;
        this.updateUI();
        ['trashScene', 'planetSelectScene', 'navigationScene', 'pressureScene', 'farm'].forEach((key) => {
            if (this.scene.isActive(key)) this.scene.stop(key);
        });

        this.scene.stop('mapScene');
        this.scene.start('gameOverScene', { reason });
    }

    createUI() {

        // container that stays fixed to camera
        this.ui = this.add.container(0, 0);
        this.ui.setScrollFactor(0);

        // stats
        this.fuel = 50;
        this.trash = 0;
        this.food = 50;
        this.isGameOver = false;

        this.currentLocation = getPlanetById('earth');
        this.destination = null;
        this.travelStart = 0;
        this.travelTotalMs = 0;
        this.remainingKm = 0;

        // background box behind stats
        this.uiBg = this.add.rectangle(5, 5, 480, 80, 0x000000, 0.85)
            .setOrigin(0);

        this.ui.add(this.uiBg);

        this.fuelText = this.add.text(10, 10, "Fuel: 100", { fontFamily: 'spaceranger', fontSize: '18px', fill: '#fff' });
        this.trashText = this.add.text(10, 30, "trash: 0", { fontFamily: 'spaceranger', fontSize: '18px', fill: '#fff' });
        this.foodText = this.add.text(10, 50, "food: 100", { fontFamily: 'spaceranger', fontSize: '18px', fill: '#fff' });

        this.fuelButton = this.add.text(300, 10, "Refuel (R)", { fontFamily: 'spaceranger', fontSize: '14px', fill: '#fff' })
        this.trashButton = this.add.text(300, 25, "Empty Trash (E)", { fontFamily: 'spaceranger', fontSize: '14px', fill: '#fff' })
        this.navButtonText = this.add.text(300, 40, "Navigation (N)", { fontFamily: 'spaceranger', fontSize: '14px', fill: '#fff' })
        this.farmButton = this.add.text(300, 55, "Farm (F)", { fontFamily: 'spaceranger', fontSize: '14px', fill: '#fff' })
        this.craftButton = this.add.text(300, 70, "Craft (C)", { fontFamily: 'spaceranger', fontSize: '14px', fill: '#fff' })

        this.ui.add([this.fuelText, this.trashText, this.foodText, this.fuelButton, this.trashButton, this.navButtonText, this.farmButton, this.craftButton]);

        this.sleepText = this.add.text(this.scale.width / 2, 20, "GO TO BED!", {
            fontFamily: 'spaceranger',
            fontSize: '20px',
            fill: '#ff0000'
        }).setOrigin(0.5).setVisible(false);

        this.ui.add(this.sleepText);

        //compass
        this.compass = this.add.circle(this.scale.width - 50, this.scale.height - 50, 30, 0x222222);
        this.compassNeedle = this.add.line(this.scale.width - 50, this.scale.height - 50, 0, 0, 0, -20, 0xff0000)
            .setLineWidth(3);

        this.ui.add([this.compass, this.compassNeedle]);

        this.destBg = this.add.rectangle(5, this.scale.height - 35, 480, 28, 0x000000, 0.85)
            .setOrigin(0);
        this.destText = this.add.text(15, this.scale.height - 30, '', {
            fontFamily: 'spaceranger',
            fontSize: '14px',
            fill: '#39FF14'
        });
        this.destDot = this.add.circle(this.scale.width - 25, this.scale.height - 21, 6, this.currentLocation ? this.currentLocation.color : 0x222222);

        this.arrivalText = this.add.text(this.scale.width / 2, 120, '', {
            fontFamily: 'spaceranger',
            fontSize: '26px',
            color: '#39FF14',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0).setDepth(150);

        this.ui.add([this.destBg, this.destText, this.destDot, this.arrivalText]);

    }

    formatDistance(km) {
        return formatDistanceKm(km);
    }

    travelTimeForKm(km) {
        return 5 + Math.sqrt(km / 1e6) * 1.2;
    }

    startTravel(planet) {
        if (!planet || this.isGameOver) return;
        if (this.currentLocation && planet.id === this.currentLocation.id) return;

        const totalKm = distanceBetween(this.currentLocation, planet);
        this.destination = planet;
        this.travelStart = this.time.now;
        this.travelTotalMs = this.travelTimeForKm(totalKm) * 1000;
        this.travelTotalKm = totalKm;
        this.remainingKm = totalKm;
        if (this.destDot) this.destDot.setFillStyle(planet.color);
        if (this.bgMap) this.bgMap.play('map_anim');
    }

    arriveAtDestination() {
        const planet = this.destination;
        this.currentLocation = planet;
        this.destination = null;
        this.remainingKm = 0;
        this.travelTotalKm = 0;
        if (this.destDot) this.destDot.setFillStyle(planet.color);
        if (this.bgMap) {
            this.bgMap.stop();
            this.bgMap.setFrame(0);
        }
        this.updateUI();

        this.arrivalText.setText(`ARRIVED AT ${planet.name}`);
        this.arrivalText.setAlpha(0);
        this.tweens.add({
            targets: this.arrivalText,
            alpha: 1,
            duration: 500,
            yoyo: true,
            hold: 1500,
            ease: 'Power2',
            onComplete: () => {
                this.arrivalText.setText('');
            }
        });
    }

    updateUI() {
        this.fuelText.setText("Fuel: " + Math.floor(this.fuel));
        this.trashText.setText("trash: " + Math.floor(this.trash));
        this.foodText.setText("food: " + Math.floor(this.food));

        if (this.destText) {
            const here = this.currentLocation ? this.currentLocation.name : 'UNKNOWN';
            if (this.destination) {
                this.destText.setText(`LOC: ${here} > ${this.destination.name}   REMAIN ${this.formatDistance(this.remainingKm)}`);
            } else {
                this.destText.setText(`LOC: ${here}   IDLE`);
            }
        }
    }

    triggerSleepWarning() {
        this.sleepText.setVisible(true);

        // hide after 5 seconds
        this.time.delayedCall(5000, () => {
            this.sleepText.setVisible(false);
        });
    }
    scheduleNextTransmission() {
        let delay = Phaser.Math.Between(10000, 15000);

        this.time.delayedCall(delay, () => {
            this.showTransmission();
            this.scheduleNextTransmission();
        });
    }

    showTransmission() {
        let msg = Phaser.Utils.Array.GetRandom(this.transmissions);

        this.transmissionText.setText(msg);

        // fade in
        this.tweens.add({
            targets: this.transmissionText,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        this.time.delayedCall(8000, () => {
            this.tweens.add({
                targets: this.transmissionText,
                alpha: 0,
                duration: 1000,
                ease: 'Power2'
            });
        });
    }

}
