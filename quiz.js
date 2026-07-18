let questions = [];
const doshaLabels = ['Vata', 'Pitta', 'Kapha'];

// Maps question keywords to an icon emoji, a tooltip description, and a hover image
const questionIcons = [
    { icon: '🧍', tooltip: 'Body frame refers to your skeletal structure and overall build', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=280&h=180&fit=crop' },
    { icon: '⚖️', tooltip: 'Body weight tendency describes how easily you gain or lose weight', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=280&h=180&fit=crop' },
    { icon: '💇', tooltip: 'Hair texture reflects your natural hair quality and tendencies', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=280&h=180&fit=crop' },
    { icon: '🧴', tooltip: 'Skin type describes your natural skin characteristics', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=280&h=180&fit=crop' },
    { icon: '🦵', tooltip: 'Limbs refers to the appearance and feel of your arms and legs', image: 'https://images.unsplash.com/photo-1532980400857-e8d9b846ef13?w=280&h=180&fit=crop' },
    { icon: '💅', tooltip: 'Nails reveal clues about your internal constitution', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=280&h=180&fit=crop' },
    { icon: '👅', tooltip: 'Tongue characteristics are a key Ayurvedic diagnostic indicator', image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=280&h=180&fit=crop' },
    { icon: '👁️', tooltip: 'Eye shape and movement reflect your dosha tendencies', image: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=280&h=180&fit=crop' },
    { icon: '🦴', tooltip: 'Joint quality and strength vary across dosha types', image: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=280&h=180&fit=crop' },
    { icon: '🫁', tooltip: 'Bowel movement patterns are a key indicator of digestive health', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=280&h=180&fit=crop' },
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
                    <span class="tooltip">
                        <img src="${meta.image}" alt="${q.question}" class="tooltip-img">
                        <span class="tooltip-text">${meta.tooltip}</span>
                    </span>
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
