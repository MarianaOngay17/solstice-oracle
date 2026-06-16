import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors()); 
app.use(express.json());

// Inicializar el cliente oficial de Google AI de forma perezosa/segura
let ai = null;
if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Cambiamos la ruta a la que responderá en Netlify (las funciones usan /.netlify/functions/nombre-archivo)
app.post('/.netlify/functions/oraculo-chat', async (req, res) => {
    try {
        if (!ai) {
            return res.status(500).json({ error: "Falta la configuración de la API Key en el servidor." });
        }

        const { message, gameState } = req.body;
        const { hemisphere, climateValue, turingProgress, cycles } = gameState;

        const model = ai.getGenerativeModel({
            model: "gemini-flash-lite-latest", 
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const promptConContexto = `
        [MÉTRICAS DEL TURNO ACTUAL]
        - Hemisferio: ${hemisphere}
        - Clima Actual (C): ${climateValue}
        - Primacía Turing: ${turingProgress}%
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
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Data link corrupted" });
    }
});

// En lugar de app.listen, exportamos el handler de serverless
export const handler = serverless(app);