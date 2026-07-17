# Dosha Quiz

A simple web-based quiz to help discover your Ayurvedic body type (Vata, Pitta, or Kapha).

## How It Works

The app loads questions from a CSV file and presents them as a multiple-choice quiz. On submission, it tallies your dosha scores and displays a full breakdown of your answers.

## CSV Format

```
question,option1,option2,option3
Body frame,Lean,Medium,Broad
```

- Column 1: Question text
- Column 2: Vata option
- Column 3: Pitta option
- Column 4: Kapha option

A header row is auto-detected and skipped.

## Files

- `index.html` — Main page
- `styles.css` — Styling
- `quiz.js` — CSV parsing, rendering, and scoring logic
- `simple-quiz.csv` — 10-question quiz (loaded by default)
- `sample.csv` — Full 25-question quiz

## Run Locally

```bash
cd quiz
python3 -m http.server 8000
```

Open http://localhost:8000

## Deploy

Hosted on Vercel. To redeploy:

```bash
npx vercel --prod
```
