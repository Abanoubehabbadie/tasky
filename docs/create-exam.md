# Create Exam Template

Use this template to quickly create quizzes, midterms, practicals, or any exam. Copy this file into a new document or paste into your LMS/exam builder and fill the placeholders. Replace the bracketed fields with real values.

Course Name: [______________________]
Course Code: [______________________]
Course Semester: [______________________]
Instructor Name: [______________________]

Exam Type: [Quiz 1 / Quiz 2 / Quiz 3 / Midterm / Practical / Other: ________]
Date (optional): [YYYY-MM-DD]
Duration: [______ minutes]
Total Marks: [______]

Instructions (short):
- Answer all questions. Write your name and student ID on every page.

Instructions (long):
- Read all questions carefully. Manage your time. Show all workings where applicable. Use the space provided or separate answer sheets as instructed. Mobile phones and calculators rules: follow the course policy. If you have any clarification requests, raise them early.

You can use the standalone section below to create an exam without logging in to the app.

---

Create without logging in

If you want to create an exam without signing in to the app, use the standalone copy of the template below. Copy the content, paste it into any text editor or online editor (Google Docs, Word, StackEdit, etc.), fill the placeholders, then save or print. No account or login is required.

Privacy note: If you use online editors, check their privacy settings before sharing student data.

Standalone template (no login required)

Course Name: [______________________]
Course Code: [______________________]
Course Semester: [______________________]
Instructor Name: [______________________]

Exam Type: [Quiz 1 / Quiz 2 / Quiz 3 / Midterm / Practical / Other: ________]
Date (optional): [YYYY-MM-DD]
Duration: [______ minutes]
Total Marks: [______]

Instructions (short):
- Answer all questions. Write your name and student ID on every page.

Instructions (long):
- Read all questions carefully. Manage your time. Show all workings where applicable. Use the space provided or separate answer sheets as instructed. Mobile phones and calculators rules: follow the course policy. If you have any clarification requests, raise them early.

---

Section A — Multiple Choice Questions (Each question: 1 mark)
1. [Question text here]
   A. [Option A]
   B. [Option B]
   C. [Option C]
   D. [Option D]
   Answer: [ ]

2. [Question text here]
   A. [Option A]
   B. [Option B]
   C. [Option C]
   D. [Option D]
   Answer: [ ]

[Add more MCQs as needed]

---

Section B — True / False (Each question: 1 mark)
1. [Statement here] — True / False
2. [Statement here] — True / False

[Add more T/F as needed]

---

Section C — Short Answer (2–5 marks each)
1. [Question text here]
   Answer: _______________________________________________________

2. [Question text here]
   Answer: _______________________________________________________

[Add more short answer questions as needed]

---

Section D — Practical / Long Questions (e.g., 10 marks each)
1. [Task or problem statement here]
   Expected deliverables / steps: __________________________________

2. [Task or problem statement here]
   Expected deliverables / steps: __________________________________

[Add more long questions as needed]

---

Answer Key (for instructors)

Section A — MCQs
1. [Correct option]
2. [Correct option]

Section B — True/False
1. [True/False]
2. [True/False]

Section C — Short Answer
1. [Model answer / key points]
2. [Model answer / key points]

Section D — Practical / Long Questions
1. [Marking scheme and model answer]
2. [Marking scheme and model answer]

---

How to generate .docx files from courses.xlsx

This repository includes a script scripts/generate_exams.py that reads an XLSX file with course rows and produces .docx exam files filled from the template. Example usage:

1. Install dependencies:

   pip install -r requirements.txt

2. Run the generator (examples):

   python scripts/generate_exams.py courses.xlsx --out generated-exams

The script looks for columns named (case-insensitive) "Course Code", "Course Name", "Semester" and "Instructor". If Semester or Instructor are not present in the sheet the script will leave those fields blank in the generated exam.

Notes:
- The generator creates files named generated-exams/exam-{COURSECODE}.docx.
- By default the script processes the first worksheet in the XLSX. You can pass --sheet "SheetName" to select a different sheet.

