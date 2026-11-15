class GameView {
    constructor(model) {
        this.model = model;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Ajustar resolución del canvas
        this.canvas.width = this.model.canvasWidth;
        this.canvas.height = this.model.canvasHeight;

        // Referencias DOM
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
    }

    render() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar Jugador
        this.ctx.fillStyle = this.model.player.color;
        this.ctx.fillRect(this.model.player.x, this.model.player.y, this.model.player.width, this.model.player.height);

        // Dibujar Enemigos
        this.model.enemies.forEach(e => {
            this.ctx.fillStyle = e.color;
            this.ctx.fillRect(e.x, e.y, e.width, e.height);
        });

        // Dibujar Balas
        this.model.bullets.forEach(b => {
            this.ctx.fillStyle = b.color;
            this.ctx.fillRect(b.x, b.y, b.width, b.height);
        });

        // Actualizar HUD (DOM)
        this.scoreElement.textContent = `Puntos: ${this.model.score}`;
        this.livesElement.textContent = `Vidas: ${this.model.lives}`;

        // Pantalla de Game Over / Victoria
        if (this.model.state === 'GAMEOVER') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = 'hsl(212, 100%, 67%)'; 
            this.ctx.font = 'bold 40px system-ui';
            this.ctx.textAlign = 'center';
            
            const message = this.model.enemies.length === 0 ? '¡VICTORIA!' : 'GAME OVER';
            this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);

            this.ctx.font = '20px system-ui';
            this.ctx.fillStyle = 'hsl(210, 17%, 82%)'; 
            // Texto actualizado para reflejar el botón único
            this.ctx.fillText('Pulsa el botón ↻ para volver a jugar', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
}