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

        let bgMap = this.add.sprite(0, 0, 'map')
            .setOrigin(0)
            .setDepth(1)
            .setScale(3.3);

        bgMap.play('map_anim');


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
<<<<<<< HEAD
        this.useButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.navButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N); // navigation minigame key
=======
        this.trashGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.refuelGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
>>>>>>> 54c46fd (updated fuel game to match, connected both minigames to main hud display)
    }

    update(time, delta) {

        // mini game scene testing purpose
<<<<<<< HEAD
        if (Phaser.Input.Keyboard.JustDown(this.useButton) && !this.scene.isActive('trashScene'))
=======
        if (Phaser.Input.Keyboard.JustDown(this.trashGame))
>>>>>>> 54c46fd (updated fuel game to match, connected both minigames to main hud display)
        {
            this.scene.pause();
            this.scene.launch("trashScene");
        }

<<<<<<< HEAD
        if (Phaser.Input.Keyboard.JustDown(this.navButton) && !this.scene.isActive('navigationScene'))
        {
            this.scene.pause();
            this.scene.launch("navigationScene");
        }

        // example: slowly drain stats
=======
        if (Phaser.Input.Keyboard.JustDown(this.refuelGame))
        {
            this.scene.launch("pressureScene");
        }

        // slowly draining
>>>>>>> 54c46fd (updated fuel game to match, connected both minigames to main hud display)
        this.fuel -= 0.01;
        this.trash += 0.01;
        this.food -= 0.008;

        this.updateUI();
    }

    createUI() {

        // container that stays fixed to camera
        this.ui = this.add.container(0, 0);
        this.ui.setScrollFactor(0);

        // stats
        this.fuel = 50;
        this.trash = 0;
        this.food = 50;

        // background box behind stats
        this.uiBg = this.add.rectangle(5, 5, 150, 70, 0x000000, 0.85)
            .setOrigin(0);

        this.ui.add(this.uiBg);

        this.fuelText = this.add.text(10, 10, "Fuel: 100", { fontFamily: 'spaceranger', fontSize: '18px', fill: '#fff' });
        this.trashText = this.add.text(10, 30, "trash: 0", { fontFamily: 'spaceranger', fontSize: '18px', fill: '#fff' });
        this.foodText = this.add.text(10, 50, "food: 100", { fontFamily: 'spaceranger', fontSize: '18px', fill: '#fff' });

        this.ui.add([this.fuelText, this.trashText, this.foodText]);

        this.sleepText = this.add.text(this.scale.width / 2, 20, "GO TO BED!", {
            fontFamily: 'spaceranger',
            fontSize: '20px',
            fill: '#ff0000'
        }).setOrigin(0.5).setVisible(false);

        this.ui.add(this.sleepText);
<<<<<<< HEAD

        //compass
        this.compass = this.add.circle(this.scale.width - 50, this.scale.height - 50, 30, 0x222222);
        this.compassNeedle = this.add.line(this.scale.width - 50, this.scale.height - 50, 0, 0, 0, -20, 0xff0000)
            .setLineWidth(3);

        this.ui.add([this.compass, this.compassNeedle]);

=======
>>>>>>> 54c46fd (updated fuel game to match, connected both minigames to main hud display)
    }

    updateUI() {
        this.fuelText.setText("Fuel: " + Math.floor(this.fuel));
        this.trashText.setText("trash: " + Math.floor(this.trash));
        this.foodText.setText("food: " + Math.floor(this.food));
    }

    triggerSleepWarning() {
        this.sleepText.setVisible(true);

        // hide after 5 seconds
        this.time.delayedCall(5000, () => {
            this.sleepText.setVisible(false);
        });
    }

<<<<<<< HEAD
}
=======
    scheduleNextTransmission() {
        let delay = Phaser.Math.Between(25000, 35000);

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
>>>>>>> 54c46fd (updated fuel game to match, connected both minigames to main hud display)
