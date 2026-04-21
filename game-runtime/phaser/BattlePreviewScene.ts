import { Scene } from 'phaser';

export class BattlePreviewScene extends Scene {
  constructor() {
    super('BattlePreviewScene');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#120d09');

    this.add.rectangle(width / 2, height / 2, width * 0.92, height * 0.82, 0x1f140d, 0.95).setStrokeStyle(3, 0xc79a5d);
    this.add.text(width / 2, 48, 'TACTICAL BATTLE RUNTIME', {
      color: '#f2e6d5',
      fontFamily: 'Georgia',
      fontSize: '18px',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, 94, 'Phaser now owns the playfield.\nReact stays in charge of menus, HUD, and shell.', {
      color: '#cfbca1',
      fontFamily: 'sans-serif',
      fontSize: '12px',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    const partyY = height * 0.68;
    const enemyY = height * 0.34;

    [0.22, 0.38, 0.54, 0.7].forEach((x, index) => {
      this.add.circle(width * x, partyY, 22, 0x4b7a9f).setStrokeStyle(2, 0xe3cfb4);
      this.add.text(width * x, partyY + 40, `ALLY ${index + 1}`, {
        color: '#f2e6d5',
        fontFamily: 'sans-serif',
        fontSize: '10px',
      }).setOrigin(0.5);
    });

    [0.25, 0.5, 0.75].forEach((x, index) => {
      this.add.circle(width * x, enemyY, 24, 0x8c2b2b).setStrokeStyle(2, 0xf5d796);
      this.add.text(width * x, enemyY - 38, `FOE ${index + 1}`, {
        color: '#f2e6d5',
        fontFamily: 'sans-serif',
        fontSize: '10px',
      }).setOrigin(0.5);
    });

    this.tweens.add({
      targets: this.children.list,
      alpha: { from: 0.94, to: 1 },
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }
}
