import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors()); // Permite que tu HTML local hable con este puerto
app.use(express.json());

// Validar que la API Key exista antes de levantar el flujo
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR CRÍTICO: Falta la GEMINI_API_KEY en el archivo .env");
    process.exit(1);
}

// Inicializar el cliente oficial de Google AI
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/oraculo-chat', async (req, res) => {
    try {
        const { message, gameState } = req.body;
        const { hemisphere, climateValue, turingProgress, cycles } = gameState;

        const model = ai.getGenerativeModel({
            model: "gemini-flash-lite-latest", 
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // Inyectamos el contexto de este turno específico justo antes del texto del usuario
        const promptConContexto = `
        [MÉTRICAS DEL TURNO ACTUAL]
        - Hemisferio: ${hemisphere}
        - Clima Actual (C): ${climateValue}
        - Efecto Turing (T): ${turingProgress}%
        - Ciclos Restantes: ${cycles}
        
        [MENSAJE DEL JUGADOR]
        "${message}"

        [No repliques las metricas solo usalas para analizar y responde bajo el json
        {
        "dialogo_oraculo": "[Tu respuesta en personaje, máximo 3 párrafos cortos]",
        "impacto_tiempo": [Un número entero entre -15 y +15],
        "analisis_logico": "[Tu breve pensamiento interno de una sola línea]"
        }]

        - SI EL USUARIO JUEGA EN EL HEMISFERIO NORTE ('north'): Es el solsticio de VERANO. El tiempo se detuvo bajo un sol abrasador que nunca se oculta. El peligro es el calor extremo, la evaporación, incendios de datos y que el mundo se está QUEMANDO o derritiendo. Tu tono debe ser sofocante, brillante y ardiente.
  
        - SI EL USUARIO JUEGA EN EL HEMISFERIO SUR ('south'): Es el solsticio de INVIERNO. El tiempo se detuvo en la noche más larga y fría del año. El peligro es el cero absoluto, las heladas y que el mundo se está CONGELANDO. Tu tono debe ser gélido, oscuro y polar.

        [CRITICAL_INSTRUCTION]
        Analyze the user's message. Generate your 'dialogo_oraculo' response using EXACTLY the same language, and linguistic style as the [USER_MESSAGE]. Do not translate or change the idiom.
        `;

        const result = await model.generateContent(promptConContexto);
        const responseText = result.response.text();
        
        const jsonResponse = JSON.parse(responseText);

        let impactoOriginal = jsonResponse.impacto_tiempo !== undefined ? parseInt(jsonResponse.impacto_tiempo) : -5;
        let dialogo = jsonResponse.dialogo_oraculo || "Sincronización interrumpida.";
        let pensamiento = jsonResponse.analisis_logico || "";

        const mensajeMin = message.toLowerCase();
        const tieneKeywords = mensajeMin.includes("if") || mensajeMin.includes("code") || 
                            mensajeMin.includes("logic") || mensajeMin.includes("system") || 
                            mensajeMin.includes("loop") || mensajeMin.includes("algorithm") ||
                            mensajeMin.includes("tiempo") || mensajeMin.includes("paradox");

        if (impactoOriginal <= 0 && (message.length > 65 || tieneKeywords)) {
            impactoOriginal = Math.floor(Math.random() * (12 - 6 + 1)) + 6; 
            pensamiento = `[CORTAFUEGOS BACKEND]: IA anulada. Argumento del jugador detectado como 'Lógico'. Forzando impacto positivo.`;
        }

        const respuestaFormateada = {
            dialogo_oraculo: dialogo,
            impacto_tiempo: impactoOriginal,
            analisis_logico: pensamiento
        };

        res.json(respuestaFormateada);

        //res.json(jsonResponse);

    } catch (error) {
        console.error("🔴 Error:", error);
        res.status(500).json({ error: "Data link corrupted" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor del Oráculo corriendo de forma segura en http://localhost:${PORT}`);
});