import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { z } from 'zod';
import { SystemSettingsService } from './system-settings.service';

const supportedLanguages = ['tr', 'en', 'ar', 'de', 'fr', 'es'] as const;

export const generateDuaRequestSchema = z.object({
  intention: z.string().trim().min(3).max(600),
  language: z.enum(supportedLanguages).default('tr'),
  preferredName: z.string().trim().max(100).optional(),
});

export const generatedDuaResponseSchema = z.object({
  inScope: z.boolean().default(true),
  title: z.string().min(1).max(300),
  introHamdSalavat: z.string().min(1).max(1000),
  invokedNames: z.array(
    z.object({
      arabic: z.string(),
      transliteration: z.string(),
      meaning: z.string(),
    })
  ).max(5).default([]),
  quranOrHadithReference: z.object({
    arabic: z.string().default(''),
    translation: z.string().default(''),
    source: z.string().default(''),
  }).optional(),
  duaBody: z.string().min(1).max(3000),
  conclusion: z.string().min(1).max(800),
  adabAdvice: z.string().max(800).default(''),
  refusalReason: z.string().max(500).default(''),
});

export type GenerateDuaRequest = z.infer<typeof generateDuaRequestSchema>;
export type GeneratedDuaResponse = z.infer<typeof generatedDuaResponseSchema>;

const LANGUAGE_NAMES: Record<string, string> = {
  tr: 'Turkish',
  en: 'English',
  ar: 'Arabic',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
};

const REFUSAL_MESSAGES: Record<string, string> = {
  tr: 'İslam dua âdâbında günah, haram kazanç, haksızlık, beddua veya akrabalık bağını koparma niyetiyle dua edilemez. Yüce Allah kulundan daima hayrı, affı, ıslahı ve meşru güzellikleri istemesini murat eder.',
  en: 'In Islamic supplication etiquette, prayers cannot be made for sinful gains, injustice, harm to others, or severing family ties. Believers are encouraged to pray for goodness, guidance, forgiveness, and beneficial outcomes.',
  ar: 'في آداب الدعاء الإسلامي، لا يجوز الدعاء بإثم أو قطيعة رحم أو ظلم أو كسب حرام. إنما يُسأل الله تعالى الخير والهدى والعافية والبركة.',
  de: 'In der islamischen Bittgebetsetikette darf nicht für Sündhaftes, Unrecht, Schaden an anderen oder den Bruch von Verwandtschaftsbanden gebetet werden. Es soll stets um das Gute, Vergebung und Rechtleitung gebetet werden.',
  fr: "Selon l'éthique de l'invocation en Islam, il n'est pas permis d'invoquer pour le péché, l'injustice, la rupture des liens familiaux ou le tort causé à autrui. Le croyant implore la paix, le bien et le pardon.",
  es: 'En la etiqueta de la súplica islámica, no se permite rogar por el mal, la injusticia, ganancias ilícitas ni la ruptura de lazos de parentesco. Se debe pedir el bien, el perdón y la guía divina.',
};

export function buildDuaPrompt(input: GenerateDuaRequest) {
  const targetLanguage = LANGUAGE_NAMES[input.language] || 'Turkish';

  const systemInstruction = `You are a respectful, spiritually uplifting Islamic prayer companion knowledgeable in the prophetic etiquette of supplication (Âdâb al-Du'â / آداب الدعاء).
Your task is to take a believer's intention, hardship, or life circumstance, and formulate a beautiful, authentic, and structured supplication according to the Sunnah and Quranic tradition.

NON-NEGOTIABLE PRINCIPLES & RULES:
1. OUTPUT LANGUAGE: Write all textual explanations and the main dua body in ${targetLanguage}. Keep sacred Arabic phrases (Bismillah, Alhamdülillah, Salawat, Ayahs, Names) in Arabic with accurate vocalization, followed by translations in ${targetLanguage}.
2. SAFETY & ETHICS (inScope):
   - Set inScope=false if the user asks for harm towards innocents, vengeance, curses (beddua), usury/interest (riba), theft, infidelity, suicide, gambling, breaking family kinship ties, or any clear haram acts.
   - When inScope=false, populate refusalReason with a gentle reminder in ${targetLanguage} encouraging repentance, patience, and asking for what is pleasing to God.
3. AUTHENTIC PROPHETIC ETIQUETTE STRUCTURE:
   - title: An inspiring, fitting title for this specific supplication in ${targetLanguage}.
   - introHamdSalavat: Begin with glorifying and thanking Allah (Hamd) and sending blessings upon Prophet Muhammad and his family (Salawat), both in Arabic script and translated into ${targetLanguage}.
   - invokedNames: Select 2 or 3 of Allah's 99 Beautiful Names (Asmā' Allāh al-Ḥusnā) that directly connect to the user's need (e.g., Ash-Shafi for health, Ar-Razzaq/Al-Fattah for work/livelihood, Al-Alim/Al-Hakim for study/exams, Al-Wadud for marital peace, Al-Ghafur/At-Tawwab for forgiveness). If the user provided a preferred name ("${input.preferredName || ''}"), include it with honor.
   - quranOrHadithReference: If a well-known authentic Quranic supplication (e.g. Rabbana prayers from Surah Al-Baqarah, Al-Imran, Taha, Al-Anbiya) or sound Hadith prayer exists for this theme, include its Arabic text, transliteration/source, and translation.
   - duaBody: The heart of the prayer in ${targetLanguage}. Sincere, poetic, reverent, humble, and heartfelt. It should express deep reliance on Allah (Tawakkul), ask for the user's specific lawful need, pray for spiritual and worldly well-being ('Afiyah), and ask for contentment with the divine decree (Rida).
   - conclusion: Conclude with blessings upon the Prophet (Salawat), Ameen, and praising the Lord of the Worlds.
   - adabAdvice: Brief 1-2 sentence recommendation for the believer (e.g., praying with wudu, facing the Qibla, raising hands with humility, choosing times of acceptance like Tahajjud, before Friday sunset, or during sajdah).
4. NO SUPERSTITIONS: Never promise guaranteed outcomes ("read this 100 times to become rich"). Prayer is worship, communion, and submission.
5. JSON FORMAT ONLY: Return strictly the JSON fields requested.`;

  const prompt = `USER SUPPLICANT INTENTION:
"${input.intention}"

${input.preferredName ? `PREFERRED DIVINE NAME TO INVOKE: ${input.preferredName}` : ''}
REQUESTED LANGUAGE: ${targetLanguage}`;

  return { systemInstruction, prompt };
}

export function normalizeDuaResponse(parsed: GeneratedDuaResponse, language: GenerateDuaRequest['language']): GeneratedDuaResponse {
  if (parsed.inScope) {
    return parsed;
  }

  return {
    inScope: false,
    title: language === 'tr' ? 'Dua Âdâbı Uyarısı' : 'Prayer Etiquette Notice',
    introHamdSalavat: '',
    invokedNames: [],
    duaBody: '',
    conclusion: '',
    adabAdvice: '',
    refusalReason: parsed.refusalReason || REFUSAL_MESSAGES[language] || REFUSAL_MESSAGES.tr,
  };
}

export class DuaGeneratorService {
  static async generate(input: GenerateDuaRequest): Promise<GeneratedDuaResponse & { model: string; disclaimer: string }> {
    const apiKey = await SystemSettingsService.getGeminiApiKey();
    if (!apiKey) {
      throw new Error('AI_SERVICE_NOT_CONFIGURED');
    }

    const modelName = process.env.GEMINI_CHAT_MODEL || 'gemini-3.5-flash-lite';
    const ai = new GoogleGenAI({ apiKey });

    const { systemInstruction, prompt } = buildDuaPrompt(input);

    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        maxOutputTokens: 1200,
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: 'object',
          additionalProperties: false,
          required: ['inScope', 'title', 'introHamdSalavat', 'invokedNames', 'duaBody', 'conclusion', 'adabAdvice'],
          properties: {
            inScope: { type: 'boolean' },
            title: { type: 'string' },
            introHamdSalavat: { type: 'string' },
            invokedNames: {
              type: 'array',
              items: {
                type: 'object',
                required: ['arabic', 'transliteration', 'meaning'],
                properties: {
                  arabic: { type: 'string' },
                  transliteration: { type: 'string' },
                  meaning: { type: 'string' },
                },
              },
            },
            quranOrHadithReference: {
              type: 'object',
              properties: {
                arabic: { type: 'string' },
                translation: { type: 'string' },
                source: { type: 'string' },
              },
            },
            duaBody: { type: 'string' },
            conclusion: { type: 'string' },
            adabAdvice: { type: 'string' },
            refusalReason: { type: 'string' },
          },
        },
      },
    });

    const parsedJson = JSON.parse(result.text || '{}');
    const validated = generatedDuaResponseSchema.parse(parsedJson);
    const normalized = normalizeDuaResponse(validated, input.language);

    return {
      ...normalized,
      model: modelName,
      disclaimer: 'AI_ASSISTED_SUPPLICATION_GUIDE',
    };
  }
}
