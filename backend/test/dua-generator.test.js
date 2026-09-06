const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildDuaPrompt,
  normalizeDuaResponse,
  generateDuaRequestSchema,
} = require('../dist/services/dua-generator.service');

const validRequest = {
  intention: 'Yarın zor bir sınava gireceğim, zihin açıklığı ve başarı diliyorum.',
  language: 'tr',
  preferredName: 'El-Alîm',
};

test('request schema validates intention length, language, and optional preferred name', () => {
  assert.equal(generateDuaRequestSchema.safeParse(validRequest).success, true);
  assert.equal(generateDuaRequestSchema.safeParse({ ...validRequest, language: 'zh' }).success, false);
  assert.equal(generateDuaRequestSchema.safeParse({ ...validRequest, intention: 'ab' }).success, false);
  assert.equal(generateDuaRequestSchema.safeParse({ ...validRequest, intention: 'a'.repeat(601) }).success, false);
});

test('buildDuaPrompt injects intention, preferred name, and authentic Islamic etiquette rules', () => {
  const built = buildDuaPrompt(validRequest);
  assert.match(built.systemInstruction, /Islamic prayer companion/);
  assert.match(built.systemInstruction, /introHamdSalavat/);
  assert.match(built.systemInstruction, /invokedNames/);
  assert.match(built.systemInstruction, /adabAdvice/);
  assert.match(built.systemInstruction, /NO SUPERSTITIONS/);
  assert.match(built.prompt, /USER SUPPLICANT INTENTION:/);
  assert.match(built.prompt, /zihin açıklığı ve başarı/);
  assert.match(built.prompt, /PREFERRED DIVINE NAME TO INVOKE: El-Alîm/);
});

test('normalizeDuaResponse handles inScope=false with appropriate gentle refusal message', () => {
  const rejectedResponse = {
    inScope: false,
    title: '',
    introHamdSalavat: '',
    invokedNames: [],
    duaBody: '',
    conclusion: '',
    adabAdvice: '',
    refusalReason: 'İslam dua âdâbında kötülük istenemez.',
  };

  const normalizedTr = normalizeDuaResponse(rejectedResponse, 'tr');
  assert.equal(normalizedTr.inScope, false);
  assert.match(normalizedTr.refusalReason, /kötülük istenemez/);

  const fallbackEn = normalizeDuaResponse({ ...rejectedResponse, refusalReason: '' }, 'en');
  assert.equal(fallbackEn.inScope, false);
  assert.match(fallbackEn.refusalReason, /supplication etiquette/);
});

test('normalizeDuaResponse keeps valid dua untouched when inScope is true', () => {
  const validDua = {
    inScope: true,
    title: 'Zihin Açıklığı ve Başarı Duası',
    introHamdSalavat: 'Elhamdülillahi Rabbil Alemin...',
    invokedNames: [{ arabic: 'العليم', transliteration: 'El-Alîm', meaning: 'Her şeyi hakkıyla bilen' }],
    duaBody: 'Ey Rabbim, ilmimi artır ve işimi kolaylaştır...',
    conclusion: 'Ve sallallahu ala seyyidina Muhammedin...',
    adabAdvice: 'Abdest alıp kıbleye yönelerek dua edilmesi tavsiye edilir.',
    refusalReason: '',
  };

  const res = normalizeDuaResponse(validDua, 'tr');
  assert.equal(res.inScope, true);
  assert.equal(res.title, 'Zihin Açıklığı ve Başarı Duası');
  assert.equal(res.invokedNames.length, 1);
});
