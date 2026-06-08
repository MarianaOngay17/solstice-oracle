document.addEventListener('DOMContentLoaded', async function(){
    actualizarPunteroClima(-50);
    actualizarProgresoTuring(0)
    //mostrarPantallaFinal('victory')

});

function actualizarPunteroClima(valorClima) {
    const pointer = document.getElementById("clima-pointer");
    
    // Forzamos límites para evitar que el puntero se salga visualmente del riel
    let climaSeguro = Math.max(-50, Math.min(50, valorClima));
    
    // Fórmula matemática de mapeo: pasa un rango [-50, 50] a un rango [0, 100]
    //  -50 -> 0% | 0 -> 50% | 50 -> 100%
    let porcentajeCSS = ((climaSeguro + 50) / 100) * 100;
    
    pointer.style.left = `${porcentajeCSS}%`;
}

function actualizarProgresoTuring(nuevoPorcentaje) {
    const fill = document.getElementById("turing-fill");
    const text = document.getElementById("turing-percentage");
    
    // Forzamos que el valor se mantenga estrictamente entre 0 y 100
    let porcentajeSeguro = Math.max(0, Math.min(100, nuevoPorcentaje));
    
    let porcentajeEntero = Math.round(porcentajeSeguro);
    
    // ancho de la barra CSS
    fill.style.width = `${porcentajeEntero}%`;
    //texto del marcador numérico
    text.innerText = `${porcentajeEntero}%`;
}

document.getElementById("chat-form").addEventListener("submit", function(e) {
    e.preventDefault(); // Detiene la recarga de página obligatoria de los formularios
    
    const inputElement = document.getElementById("player-input");
    const mensajeTexto = inputElement.value.trim();
    
    if (mensajeTexto === "") return; // Protección contra cadenas vacías o puros espacios

    inputElement.value = "";

    inputElement.focus();
    

});

function mostrarPantallaFinal(resultado) {
    const screenEnd = document.getElementById('screen-end');
    const screenGame = document.getElementById('screen-game');
    const title = document.getElementById('end-title');
    const subtitle = document.getElementById('end-subtitle');
    const button = document.getElementById('end-restart-btn');
    const buttonText = document.getElementById('end-btn-text');

    screenEnd.classList.remove('victory', 'defeat');
    button.classList.remove('end__button--victory', 'end__button--defeat');

    if (resultado === 'victory') {
        screenEnd.classList.add('victory');
        button.classList.add('end__button--victory');
        
        title.innerText = "SOLSTITIUM RESTITUTUM";
        subtitle.innerText = "Balance has been restored. The dance of the stars continues in peace.";
        buttonText.innerText = "Start New Cycle";
        
    } else if (resultado === 'defeat') {
        screenEnd.classList.add('defeat');
        button.classList.add('end__button--defeat');
        
        title.innerText = "SYSTEM COLLAPSE";
        subtitle.innerText = "The temporal loop shattered. The world remains trapped in an eternal divergence.";
        buttonText.innerText = "Reboot System";
    }

    screenEnd.classList.remove('hidden');
    screenGame.classList.add('hidden');
}

