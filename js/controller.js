class GameController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        this.keys = { ArrowLeft: false, ArrowRight: false };
        this.isSpacePressed = false;
        
        this.bindEvents();
        this.updateButtonUI(); // Estado inicial del botón
        
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Space') {
                e.preventDefault(); 
            }
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') this.keys[e.code] = true;
            if (e.code === 'Space' && !this.isSpacePressed) {
                this.model.shoot();
                this.isSpacePressed = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') this.keys[e.code] = false;
            if (e.code === 'Space') this.isSpacePressed = false;
        });

        // UI Botón Único
        document.getElementById('btn-control').addEventListener('click', () => this.handleControlClick());
        
        // Panel de ayuda
        const helpPanel = document.getElementById('help-panel');
        document.getElementById('btn-help').addEventListener('click', () => helpPanel.classList.remove('hidden'));
        document.getElementById('btn-close-help').addEventListener('click', () => helpPanel.classList.add('hidden'));
    }

    // Decide qué hacer según el estado actual
    handleControlClick() {
        switch (this.model.state) {
            case 'STOPPED':
                this.model.state = 'RUNNING';
                break;
            case 'RUNNING':
                this.model.state = 'PAUSED';
                break;
            case 'PAUSED':
                this.model.state = 'RUNNING';
                break;
            case 'GAMEOVER':
                // Reiniciar todo el modelo
                this.model.score = 0;
                this.model.lives = 3;
                this.model.bullets = [];
                this.model.initEnemies();
                this.model.player.x = this.model.canvasWidth / 2 - 20;
                this.model.state = 'RUNNING'; // Iniciar partida directamente
                break;
        }
        this.updateButtonUI(); // Actualizar el símbolo del botón
    }

    // Cambia el icono del botón según el estado
    updateButtonUI() {
        const btn = document.getElementById('btn-control');
        
        switch (this.model.state) {
            case 'STOPPED':
            case 'PAUSED':
                btn.innerHTML = '&#9654;'; // ▶️
                btn.setAttribute('aria-label', 'Iniciar/Reanudar');
                break;
            case 'RUNNING':
                btn.innerHTML = '&#10074;&#10074;'; // ❚❚
                btn.setAttribute('aria-label', 'Pausar');
                break;
            case 'GAMEOVER':
                btn.innerHTML = '&#8635;'; // ↻
                btn.setAttribute('aria-label', 'Reiniciar');
                break;
        }
    }

    loop() {
        const previousState = this.model.state;

        if (this.model.state === 'RUNNING') {
            if (this.keys.ArrowLeft) this.model.player.move(-1);
            if (this.keys.ArrowRight) this.model.player.move(1);
            
            this.model.update();
        }

        // Si el modelo ha cambiado a GAMEOVER por sí solo (colisión/victoria), actualizamos el botón
        if (previousState !== this.model.state) {
            this.updateButtonUI();
        }

        this.view.render();
        requestAnimationFrame(this.loop);
    }
}

window.onload = () => {
    const model = new GameModel();
    const view = new GameView(model);
    new GameController(model, view);
};