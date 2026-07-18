let questions = [];
const doshaLabels = ['Vata', 'Pitta', 'Kapha'];

// Maps question keywords to an icon emoji and a tooltip description
const questionIcons = [
    { icon: '🧍', tooltip: 'Body frame refers to your skeletal structure and overall build' },
    { icon: '⚖️', tooltip: 'Body weight tendency describes how easily you gain or lose weight' },
    { icon: '💇', tooltip: 'Hair texture reflects your natural hair quality and tendencies' },
    { icon: '🧴', tooltip: 'Skin type describes your natural skin characteristics' },
    { icon: '🦵', tooltip: 'Limbs refers to the appearance and feel of your arms and legs' },
    { icon: '💅', tooltip: 'Nails reveal clues about your internal constitution' },
    { icon: '👅', tooltip: 'Tongue characteristics are a key Ayurvedic diagnostic indicator' },
    { icon: '👁️', tooltip: 'Eye shape and movement reflect your dosha tendencies' },
    { icon: '🦴', tooltip: 'Joint quality and strength vary across dosha types' },
    { icon: '🫁', tooltip: 'Bowel movement patterns are a key indicator of digestive health' },
];

document.addEventListener('DOMContentLoaded', loadQuiz);

async function loadQuiz() {
    try {
        const response = await fetch('simple-quiz.csv');
        const text = await response.text();
        questions = parseCSV(text);

        if (questions.length === 0) {
            showUploadFallback();
            return;
        }

        renderQuiz();
    } catch (err) {
        console.error('Failed to load sample.csv:', err);
        showUploadFallback();
    }
}

function showUploadFallback() {
    const uploadSection = document.getElementById('uploadSection');
    uploadSection.classList.remove('hidden');
    document.getElementById('csvFile').addEventListener('change', handleFileUpload);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        questions = parseCSV(e.target.result);
        if (questions.length === 0) {
            alert('No valid questions found. Ensure CSV format: question, option1, option2, option3');
            return;
        }
        document.getElementById('uploadSection').classList.add('hidden');
        renderQuiz();
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const parsed = [];

    for (const line of lines) {
        const cols = parseCSVLine(line);
        if (parsed.length === 0 && cols[0].toLowerCase().includes('question')) continue;

        if (cols.length >= 4) {
            parsed.push({
                question: cols[0].trim(),
                options: [cols[1].trim(), cols[2].trim(), cols[3].trim()]
            });
        }
    }
    return parsed;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function renderQuiz() {
    const quizContainer = document.getElementById('quiz');
    quizContainer.innerHTML = '';

    questions.forEach((q, i) => {
        const meta = questionIcons[i] || { icon: 'ℹ️', tooltip: 'Additional information about this question' };
        const div = document.createElement('div');
        div.className = 'question';
        div.innerHTML = `
            <div class="question-number">Question ${i + 1} of ${questions.length}</div>
            <div class="question-title">
                <h3>${q.question}</h3>
                <span class="info-icon" aria-label="More info" tabindex="0" role="button">
                    ${meta.icon}
                    <span class="tooltip">${meta.tooltip}</span>
                </span>
            </div>
            <div class="options">
                ${q.options.map((opt, j) => `
                    <label data-dosha="${doshaLabels[j].toLowerCase()}">
                        <input type="radio" name="q${i}" value="${j}">
                        ${opt}
                    </label>
                `).join('')}
            </div>
        `;
        quizContainer.appendChild(div);
    });

    document.getElementById('submitBtn').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
}

function submitQuiz() {
    const answers = [];
    let unanswered = 0;
    const scores = [0, 0, 0]; // Vata, Pitta, Kapha

    questions.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected) {
            const idx = parseInt(selected.value);
            scores[idx]++;
            answers.push({ question: q.question, chosen: q.options[idx], dosha: doshaLabels[idx] });
        } else {
            unanswered++;
        }
    });

    if (unanswered > 0) {
        alert(`Please answer all questions. ${unanswered} remaining.`);
        return;
    }

    showResults(scores, answers);
}

function showResults(scores, answers) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');

    // Summary scores
    const summaryDiv = document.getElementById('summary');
    summaryDiv.innerHTML = doshaLabels.map((label, i) => `
        <div class="dosha-score ${label.toLowerCase()}">
            <div class="label">${label}</div>
            <div class="count">${scores[i]}</div>
        </div>
    `).join('');

    // Answers table
    const tableDiv = document.getElementById('answersTable');
    tableDiv.innerHTML = `
        <table class="answers-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>Your Answer</th>
                    <th>Dosha</th>
                </tr>
            </thead>
            <tbody>
                ${answers.map((a, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${a.question}</td>
                        <td>${a.chosen}</td>
                        <td><span class="dosha-tag ${a.dosha.toLowerCase()}">${a.dosha}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
