import { Project, SyntaxKind } from 'ts-morph';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { globSync } from 'glob';

// Load env from BE
dotenv.config({ path: path.join(__dirname, '../../BE/.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY not found in BE/.env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const isVietnamese = (text: string) => {
    return /[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹý]/i.test(text);
};

const mapFilePath = path.join(__dirname, 'translation-map.json');

async function extract() {
    const project = new Project();
    
    // Glob files
    const files = globSync(['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}', 'core/**/*.{ts,tsx}'], {
        cwd: path.join(__dirname, '..'),
        absolute: true,
        ignore: ['node_modules/**', '.next/**']
    });

    console.log(`Found ${files.length} files to scan.`);
    project.addSourceFilesAtPaths(files);

    const vietnameseTexts = new Set<string>();

    for (const sourceFile of project.getSourceFiles()) {
        const stringLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral);
        const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
        const noSubTemplates = sourceFile.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral);

        const checkAndAdd = (text: string) => {
            if (isVietnamese(text)) {
                vietnameseTexts.add(text.trim());
            }
        };

        for (const node of stringLiterals) checkAndAdd(node.getLiteralValue());
        for (const node of jsxTexts) checkAndAdd(node.getLiteralText());
        for (const node of noSubTemplates) checkAndAdd(node.getLiteralValue());
    }

    console.log(`Found ${vietnameseTexts.size} unique Vietnamese strings.`);
    
    let existingMap: Record<string, string> = {};
    if (fs.existsSync(mapFilePath)) {
        existingMap = JSON.parse(fs.readFileSync(mapFilePath, 'utf-8'));
    }

    const toTranslate = Array.from(vietnameseTexts).filter(t => !existingMap[t]);
    
    if (toTranslate.length === 0) {
        console.log("No new strings to translate.");
        return;
    }

    console.log(`Sending ${toTranslate.length} strings to Gemini for translation...`);

    const batchSize = 100;
    const finalMap = { ...existingMap };

    const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash",
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    for (let i = 0; i < toTranslate.length; i += batchSize) {
        const batch = toTranslate.slice(i, i + batchSize);
        console.log(`Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(toTranslate.length / batchSize)}...`);
        
        const prompt = `You are a professional UI/UX translator. Translate the following Vietnamese UI texts to English. 
Keep the tone concise and professional. Do NOT add any extra markdown, just return a valid JSON object where the key is the exact Vietnamese string and the value is the English translation.
Strings to translate:
${JSON.stringify(batch)}`;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            let cleanedText = responseText.trim();
            const firstBrace = cleanedText.indexOf('{');
            const lastBrace = cleanedText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                cleanedText = cleanedText.slice(firstBrace, lastBrace + 1);
            }
            
            const translatedBatch = JSON.parse(cleanedText);
            Object.assign(finalMap, translatedBatch);
        } catch (e) {
            console.error("Error translating batch:", e);
        }
    }

    fs.writeFileSync(mapFilePath, JSON.stringify(finalMap, null, 2));
    console.log(`Translation map saved to ${mapFilePath}. Please review it before applying.`);
}

async function apply() {
    if (!fs.existsSync(mapFilePath)) {
        console.error("Translation map not found. Run extract first.");
        return;
    }
    
    const translationMap = JSON.parse(fs.readFileSync(mapFilePath, 'utf-8'));
    const project = new Project();
    
    const files = globSync(['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}', 'core/**/*.{ts,tsx}'], {
        cwd: path.join(__dirname, '..'),
        absolute: true,
        ignore: ['node_modules/**', '.next/**']
    });

    project.addSourceFilesAtPaths(files);
    let modifiedFiles = 0;

    for (const sourceFile of project.getSourceFiles()) {
        let isModified = false;
        
        const stringLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral);
        for (const node of stringLiterals) {
            const val = node.getLiteralValue().trim();
            if (translationMap[val]) {
                node.setLiteralValue(translationMap[val]);
                isModified = true;
            }
        }

        const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
        for (const node of jsxTexts) {
            const val = node.getLiteralText().trim();
            if (translationMap[val]) {
                const originalText = node.getText();
                // Careful with JSX text whitespace
                const newText = originalText.replace(val, translationMap[val]);
                if (newText !== originalText) {
                    node.replaceWithText(newText);
                    isModified = true;
                }
            }
        }

        const noSubTemplates = sourceFile.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral);
        for (const node of noSubTemplates) {
            const val = node.getLiteralValue().trim();
            if (translationMap[val]) {
                node.setLiteralValue(translationMap[val]);
                isModified = true;
            }
        }

        if (isModified) {
            sourceFile.saveSync();
            modifiedFiles++;
        }
    }

    console.log(`Applied translations to ${modifiedFiles} files.`);
}

const command = process.argv[2];
if (command === 'extract') {
    extract();
} else if (command === 'apply') {
    apply();
} else {
    console.log("Usage: npx tsx scripts/translate-fe.ts [extract|apply]");
}
