const fs = require('fs');
const path = require('path');

const EDITIONS = {
    ar: 'quran-uthmani',
    tr: 'tr.diyanet',
    en: 'en.asad',
    de: 'de.aburida',
    fr: 'fr.hamidullah',
    es: 'es.cortes'
};

async function fetchEdition(edition) {
    console.log(`Fetching ${edition}...`);
    const res = await fetch(`http://api.alquran.cloud/v1/quran/${edition}`);
    const data = await res.json();
    return data.data.surahs;
}

async function buildQuranData() {
    try {
        const data = {
            ar: await fetchEdition(EDITIONS.ar),
            tr: await fetchEdition(EDITIONS.tr),
            en: await fetchEdition(EDITIONS.en),
            de: await fetchEdition(EDITIONS.de),
            fr: await fetchEdition(EDITIONS.fr),
            es: await fetchEdition(EDITIONS.es),
        };

        const finalSurahs = [];

        // Base structure on Arabic edition
        for (let i = 0; i < 114; i++) {
            const arSurah = data.ar[i];
            const surahStruct = {
                number: arSurah.number,
                name: {
                    ar: arSurah.name,
                    tr: data.tr[i].englishName, // Using englishName for Latin characters if available
                    en: data.en[i].englishName
                },
                englishNameTranslation: arSurah.englishNameTranslation,
                revelationType: arSurah.revelationType,
                ayahs: []
            };

            for (let j = 0; j < arSurah.ayahs.length; j++) {
                surahStruct.ayahs.push({
                    number: arSurah.ayahs[j].numberInSurah,
                    globalNumber: arSurah.ayahs[j].number,
                    arabic: arSurah.ayahs[j].text,
                    translations: {
                        tr: data.tr[i].ayahs[j].text,
                        en: data.en[i].ayahs[j].text,
                        de: data.de[i].ayahs[j].text,
                        fr: data.fr[i].ayahs[j].text,
                        es: data.es[i].ayahs[j].text,
                    }
                });
            }

            finalSurahs.push(surahStruct);
        }

        const outputPath = path.join(__dirname, '../assets/quran/data.json');
        fs.writeFileSync(outputPath, JSON.stringify(finalSurahs, null, 2));
        console.log(`Successfully wrote combined Quran data to ${outputPath}`);
    } catch (err) {
        console.error('Error fetching Quran data:', err);
    }
}

buildQuranData();
