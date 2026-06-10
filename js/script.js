let hemisphere;
let cycles = 10;
let turingProgress = 0;
let climateValue = 0;

const AVATAR_IMAGES = {
    normal: 'assets/images/normal.jfif', // OP. NORMAL
    analysing: 'assets/images/analysing.jfif',
    engaged: 'assets/images/engaged.jfif',
    receptive: 'assets/images/receptive.jfif',
    agitated: 'assets/images/agitated.jfif',
    hostile: 'assets/images/hostile.jfif'
};

document.addEventListener('DOMContentLoaded', async function(){
    selectHemisphere();
    initChat();
    restart();
});

function initChat(){
    document.getElementById("chat-form").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const inputElement = document.getElementById("player-input");
        const mensajeTexto = inputElement.value.trim();
        
        if (mensajeTexto === "") return; 

        renderMessage("player", mensajeTexto);

        inputElement.value = "";
        inputElement.focus();

        processPlayerTurn(mensajeTexto);

    });

}

//show message in chat box
function renderMessage(remitente, texto) {
    const chatContainer = document.querySelector(".game__chat");
    
    const messageDiv = document.createElement("div");
    messageDiv.className = `game__message game__message--${remitente}`;
    
    const nombre = remitente === "player" ? "Player" : "Oracle";
    
    messageDiv.innerHTML = `
        <h4>${nombre}</h4>
        <p>${texto}</p>
    `;
    
    chatContainer.appendChild(messageDiv);
    
    // Auto-scroll hacia abajo para ver el mensaje nuevo si hay overflow
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

//change avatar image
function changeAvatar(status) {
    const avatarImg = document.getElementById("avatar");
    if (!avatarImg || !AVATAR_IMAGES[status]) return;

    avatarImg.classList.add("avatar-changing");

    setTimeout(() => {
        avatarImg.src = AVATAR_IMAGES[status];
        avatarImg.onload = function() {
            avatarImg.classList.remove("avatar-changing");
        };
    }, 200);

}


async function processPlayerTurn(mensajeInput) {
    const sendButton = document.getElementById('submitBtn');
    const inputElement = document.getElementById("player-input");

    cycles--;
    var cycleFormated = cycles < 10 ? `0${cycles}` : cycles; 
    updateCycles(cycleFormated)

    // modo analítico 
    changeAvatar("analysing");
    if (sendButton) sendButton.disabled = true;
    if (inputElement) inputElement.disabled = true;

    try{

        const response = await fetch('http://localhost:3000/api/oraculo-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: mensajeInput,
                gameState: {
                    hemisphere: hemisphere,
                    climateValue: climateValue,
                    turingProgress: turingProgress,
                    cycles: cycles
                }
            })
        });

        if (!response.ok) {
            throw new Error("Error en la comunicación con el núcleo del Oráculo.");
        }

        const data = await response.json();

        let respuestaIA = data.dialogo_oraculo;
        let I = parseInt(data.impacto_tiempo);

        let efectoClimatico = (hemisphere === "north") ? I : -I;

        //se actualiza valor de clima relacionado directamente con el impacto de la IA
        climateValue += efectoClimatico;
        //obtener la ganacia 
        let G = 1 - Math.pow((Math.abs(climateValue) / 50), 0.5);
        if (G < 0) G = 0;

        // --- Actualización del Efecto Turing (T) ---
        if (I > 0) {
            // Impacto positivo: Multiplicado por la ganancia de proximidad
            turingProgress += (I * 3) * G;
        } else {
            // Impacto negativo
            turingProgress += I; 
        }

        
        if (turingProgress < 0) turingProgress = 0;
        if (turingProgress > 100) turingProgress = 100;

        if (climateValue < -50) climateValue = -50;
        if (climateValue > 50) climateValue = 50;

        updateTuringProgress(turingProgress);
        updateClimatePointer(climateValue);

        // Imprimir respuesta de la IA en el chat
        renderMessage("oracle", respuestaIA);

        // Actualizar el humor del avatar en función del progreso de persuasión
        updateHumorOracle(I, turingProgress, climateValue);

        // Verificar si el juego terminó (Victoria o Derrota)
        checkGameConditions();

    } catch (error) {
        console.error("🔴 Error en el enlace de datos:", error);
        renderMessage("oracle", "CRITICAL ERROR: Data link corrupted. Solstitium systems failing to respond.");
        changeAvatar("agitated");
    } finally {
        sendButton.disabled = false;
        if (inputElement) {
            inputElement.disabled = false;
            inputElement.focus(); 
        }
    }
 
}

function updateHumorOracle(impacto, turingActual, climaActual) {

    //  Prioridad Máxima: Estado Crítico de Hostilidad
    if (impacto <= -10) {
        changeAvatar("hostile");
    } 
    //  Alta Prioridad: El Oráculo está contra las cuerdas (Endgame)
    else if (turingActual > 75 && impacto >= 0) {
        changeAvatar("receptive");
    } 
    //  Sistema Agitado (Malas respuestas o clima en peligro fuera de |30|)
    else if (impacto < 0 || Math.abs(climaActual) > 30 || Math.abs(climaActual) < -30) {
        changeAvatar("agitated");
    } 
    //  Buen argumento (Engaged)
    else if (impacto >= 3 && impacto < 15) {
        changeAvatar("engaged");
    } 
    //  Estado por defecto (OP. NORMAL)
    else {
        changeAvatar("normal");
    }
}

function checkGameConditions() {

    if (turingProgress >= 100) {
        showFinalScreen("victory");
        return;
    }

    if (cycles <= 0) {
        
        //Victoria Indulgente (Clima a salvo entre -15 y 15 Y Turing >= 80%)
        if (climateValue >= -15 && climateValue <= 15 && turingProgress >= 80) {
            showFinalScreen("victory");
        } 
        // Derrota por Tiempo o Desbalance fuera de rango
        else {
            showFinalScreen("defeat");
        }
        
        return; 
    }
}

//adjust game to hemisphere selected
function selectHemisphere(){
    const buttons = document.querySelectorAll('.intro__button');
    const screenIntro = document.getElementById('screen-intro');
    const screenGame = document.getElementById('screen-game');
    

    buttons.forEach(button => {
       button.addEventListener('click', function(){
            hemisphere = this.getAttribute('data-hemisphere');

            showHemisphere(hemisphere);
            updateTuringProgress(0)
            updateCycles(cycles);
            screenIntro.classList.add('hidden');
            screenGame.classList.remove('hidden');
       }); 
    });
}

//show hemisphere and configuration
function showHemisphere(hemisphere){

    const northIndicator = document.querySelector('.hemisphere--north');
    const southIndicator = document.querySelector('.hemisphere--south');

    switch(hemisphere){
        case 'north':
            climateValue = -50;
            updateClimatePointer(climateValue);
            northIndicator.classList.remove('hidden');
            southIndicator.classList.add('hidden');
            break;
        case 'south':
            climateValue = 50;
            updateClimatePointer(climateValue);
            northIndicator.classList.add('hidden');
            southIndicator.classList.remove('hidden');
            break;
        default:
            break;
    }
}


function updateCycles(cycle){
    const cycles = document.getElementById('cycles');
    cycles.innerText = cycle;
}


function updateClimatePointer(valorClima) {
   const pointer = document.getElementById("clima-pointer");
    if (!pointer) return;
    let porcentajeVisual = 50 + valorClima;
    
    if (porcentajeVisual < 0) porcentajeVisual = 0;
    if (porcentajeVisual > 100) porcentajeVisual = 100;
    
    pointer.style.left = `${porcentajeVisual}%`;
}

function updateTuringProgress(progreso) {
    if (progreso > 100) progreso = 100;
    const fill = document.getElementById("turing-fill");
    const percentText = document.getElementById("turing-percentage");
    
    if (fill) fill.style.width = `${progreso}%`;
    if (percentText) percentText.innerText = `${progreso.toFixed(2)}%`;
}

function showFinalScreen(result) {
    const screenEnd = document.getElementById('screen-end');
    const screenGame = document.getElementById('screen-game');
    const title = document.getElementById('end-title');
    const subtitle = document.getElementById('end-subtitle');
    const button = document.getElementById('end-restart-btn');
    const buttonText = document.getElementById('end-btn-text');

    screenEnd.classList.remove('victory', 'defeat');
    button.classList.remove('end__button--victory', 'end__button--defeat');

    if (result === 'victory') {
        screenEnd.classList.add('victory');
        button.classList.add('end__button--victory');
        
        title.innerText = "SOLSTITIUM RESTITUTUM";
        subtitle.innerText = "Balance has been restored. The dance of the stars continues in peace.";
        buttonText.innerText = "Start New Cycle";
        
    } else if (result === 'defeat') {
        screenEnd.classList.add('defeat');
        button.classList.add('end__button--defeat');
        
        title.innerText = "SYSTEM COLLAPSE";
        subtitle.innerText = "The temporal loop shattered. The world remains trapped in an eternal divergence.";
        buttonText.innerText = "Reboot System";
    }

    screenEnd.classList.remove('hidden');
    screenGame.classList.add('hidden');
}

function restart() {
    const button = document.getElementById('end-restart-btn');
    button.addEventListener('click', function() {
        location.reload();
    });
}

