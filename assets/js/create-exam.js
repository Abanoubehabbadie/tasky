(function(){
  const addBtn = document.getElementById('add-question');
  const questionsEl = document.getElementById('questions');
  const form = document.getElementById('exam-form');
  const output = document.getElementById('output');
  const preview = document.getElementById('preview');
  const downloadBtn = document.getElementById('download-word');

  // Raw file URL for the template in this repo
  const TEMPLATE_URL = encodeURI('https://raw.githubusercontent.com/Abanoubehabbadie/tasky/main/Marketing%20of%20healthcare%20final%20exam.docx');

  let qCount = 0;

  function createQuestionBlock(data){
    qCount++;
    const id = 'q_' + qCount;

    const wrapper = document.createElement('div');
    wrapper.className = 'question';
    wrapper.id = id;

    wrapper.innerHTML = `
      <button type="button" class="remove">Remove</button>
      <label>Question text
        <textarea data-field="text" rows="2" required>${data && data.text ? data.text : ''}</textarea>
      </label>
      <label>Choice A
        <input data-field="a" type="text" value="${data && data.a ? data.a : ''}" required>
      </label>
      <label>Choice B
        <input data-field="b" type="text" value="${data && data.b ? data.b : ''}" required>
      </label>
      <label>Choice C
        <input data-field="c" type="text" value="${data && data.c ? data.c : ''}" required>
      </label>
      <label>Choice D
        <input data-field="d" type="text" value="${data && data.d ? data.d : ''}" required>
      </label>
      <label>Correct answer
        <select data-field="correct">
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </label>
      <label>Marks
        <input data-field="marks" type="number" min="1" value="${data && data.marks ? data.marks : 1}">
      </label>
    `;

    wrapper.querySelector('.remove').addEventListener('click', ()=> wrapper.remove());
    if(data && data.correct){ wrapper.querySelector('select[data-field="correct"]').value = data.correct }

    questionsEl.appendChild(wrapper);
    return wrapper;
  }

  addBtn.addEventListener('click', ()=> createQuestionBlock());

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const exam = collectExam();
    // For now we store locally and show confirmation
    localStorage.setItem('lastExam', JSON.stringify(exam));
    alert('Exam saved to localStorage (key: lastExam)');
  });

  preview.addEventListener('click', function(){
    const exam = collectExam();
    output.hidden = false;
    output.textContent = JSON.stringify(exam, null, 2);
  });

  downloadBtn.addEventListener('click', function(){
    const exam = collectExam();
    downloadDocx(exam);
  });

  function collectExam(){
    const title = document.getElementById('exam-title').value.trim();
    const date = document.getElementById('exam-date').value || '';
    const type = document.getElementById('exam-type').value.trim();
    const code = document.getElementById('exam-code').value.trim();
    const desc = document.getElementById('exam-desc').value.trim();
    const duration = parseInt(document.getElementById('exam-duration').value,10) || 0;
    const totalMarks = parseInt(document.getElementById('exam-marks').value,10) || 0;

    const qs = [];
    const nodes = questionsEl.querySelectorAll('.question');
    nodes.forEach((node, idx)=>{
      const get = (sel)=> node.querySelector('[data-field="'+sel+'"]').value;
      qs.push({
        number: idx+1,
        text: get('text'),
        A: get('a'), B: get('b'), C: get('c'), D: get('d'),
        correct: get('correct'),
        marks: parseFloat(get('marks')) || 0
      });
    });

    return { title, date, type, code, desc, duration, totalMarks, questions: qs };
  }

  // Download .docx by applying the exam data into the template using docxtemplater
  async function downloadDocx(exam){
    try{
      // Fetch template as arrayBuffer
      const res = await fetch(TEMPLATE_URL);
      if(!res.ok) throw new Error('Failed to fetch template: ' + res.status);
      const content = await res.arrayBuffer();

      // Use PizZip and Docxtemplater to render
      const zip = new PizZip(content);
      const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      // Set data — template has header placeholders like {{title}}, {{date}}, {{type}}, {{code}}
      doc.setData({
        title: exam.title,
        date: exam.date,
        type: exam.type,
        code: exam.code,
        description: exam.desc,
        duration: exam.duration,
        totalMarks: exam.totalMarks
      });

      try{
        doc.render();
      } catch (err){
        console.error('Render error', err);
        alert('Error rendering template. Make sure the template contains the expected placeholders.');
        return;
      }

      // After rendering header placeholders, append questions to document.xml
      const zipAfter = doc.getZip();
      const docPath = 'word/document.xml';
      let docXml = zipAfter.file(docPath).asText();

      // Build question XML paragraphs. Keep it very simple: plain paragraphs with text runs.
      function xmlEscape(str){
        if(!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      }

      let qXml = '\n';
      exam.questions.forEach((q, idx)=>{
        const num = idx+1;
        qXml += `<w:p><w:r><w:t xml:space="preserve">${num}. ${xmlEscape(q.text)}</w:t></w:r></w:p>`;
        qXml += `<w:p><w:r><w:t xml:space="preserve">A. ${xmlEscape(q.A)}</w:t></w:r></w:p>`;
        qXml += `<w:p><w:r><w:t xml:space="preserve">B. ${xmlEscape(q.B)}</w:t></w:r></w:p>`;
        qXml += `<w:p><w:r><w:t xml:space="preserve">C. ${xmlEscape(q.C)}</w:t></w:r></w:p>`;
        qXml += `<w:p><w:r><w:t xml:space="preserve">D. ${xmlEscape(q.D)}</w:t></w:r></w:p>`;
        // Teacher copy: include correct answer and marks
        qXml += `<w:p><w:r><w:t xml:space="preserve">Answer: ${xmlEscape(q.correct)} | Marks: ${xmlEscape(q.marks)}</w:t></w:r></w:p>`;
        // Add an empty paragraph as spacer
        qXml += `<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;
      });

      // Insert before closing </w:body>
      if(docXml.indexOf('</w:body>') !== -1){
        docXml = docXml.replace('</w:body>', qXml + '</w:body>');
      } else {
        // fallback: append
        docXml += qXml;
      }

      zipAfter.file(docPath, docXml);

      const out = zipAfter.generate({type: 'blob'});
      const safeTitle = (exam.title? exam.title.replace(/[^a-z0-9-_ ]/gi,'') : 'exam');
      const filename = `${safeTitle}-teacher.docx`;
      saveAs(out, filename);
    }catch(err){
      console.error(err);
      alert('Failed to generate Word file: ' + err.message);
    }
  }

  // Add one empty question by default
  createQuestionBlock();
})();
