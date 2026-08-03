(function(){
  const addBtn = document.getElementById('add-question');
  const questionsEl = document.getElementById('questions');
  const form = document.getElementById('exam-form');
  const output = document.getElementById('output');
  const preview = document.getElementById('preview');
  const downloadBtn = document.getElementById('download-word');
  const excelInput = document.getElementById('excel-file');
  const loadExcelBtn = document.getElementById('load-excel');
  const loadRepoExcelBtn = document.getElementById('load-repo-excel');

  // Raw file URL for the template in this repo
  const TEMPLATE_URL = encodeURI('https://raw.githubusercontent.com/Abanoubehabbadie/tasky/main/Marketing%20of%20healthcare%20final%20exam.docx');
  const REPO_EXCEL_URL = encodeURI('https://raw.githubusercontent.com/Abanoubehabbadie/tasky/main/courses.xlsx');

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
        <input data-field="a" type="text" value="${data && data.A ? data.A : ''}" required>
      </label>
      <label>Choice B
        <input data-field="b" type="text" value="${data && data.B ? data.B : ''}" required>
      </label>
      <label>Choice C
        <input data-field="c" type="text" value="${data && data.C ? data.C : ''}" required>
      </label>
      <label>Choice D
        <input data-field="d" type="text" value="${data && data.D ? data.D : ''}" required>
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

  loadExcelBtn.addEventListener('click', function(){
    const file = excelInput.files[0];
    if(!file){ alert('Please choose an Excel file (.xlsx) to load'); return; }
    parseExcelFile(file);
  });

  loadRepoExcelBtn.addEventListener('click', function(){
    fetch(REPO_EXCEL_URL).then(r=>{
      if(!r.ok) throw new Error('Failed to fetch repo Excel: ' + r.status);
      return r.arrayBuffer();
    }).then(ab=>{
      parseExcelBuffer(ab);
    }).catch(err=>{
      console.error(err);
      alert('Failed to load repo Excel: ' + err.message);
    });
  });

  function parseExcelFile(file){
    const reader = new FileReader();
    reader.onload = function(e){
      const data = e.target.result;
      parseExcelBuffer(data);
    };
    reader.readAsArrayBuffer(file);
  }

  function parseExcelBuffer(arrayBuffer){
    try{
      const wb = XLSX.read(arrayBuffer, {type:'array'});
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, {defval: ''});
      if(!json || json.length === 0){ alert('Excel sheet is empty'); return; }

      // Attempt to map header fields from either a header row or a dedicated first row
      // Expected header keys (case-insensitive): title, date, type, code, description, duration, totalMarks
      const headerKeys = Object.keys(json[0]).map(k=>k.toLowerCase());
      const firstRow = json[0];

      // If the sheet contains header fields in the first row (single-row with exam metadata), map them
      const metadataKeys = ['title','date','type','code','description','duration','totalmarks','total_marks','total marks','total'];
      let mappedMetadata = false;
      const meta = {};
      metadataKeys.forEach(key=>{
        for(const col in firstRow){
          if(col.toLowerCase().replace(/\s|_/g,'') === key.replace(/\s|_/g,'')){
            meta[key] = firstRow[col];
            mappedMetadata = true;
          }
        }
      });

      // If metadata mapped and there are more rows, consider rows[1..] as questions, else consider entire sheet as questions
      let questionRows = [];
      if(mappedMetadata && json.length > 1){
        // remove first row and use remaining as questions
        questionRows = json.slice(1);
      } else {
        questionRows = json;
      }

      // Populate metadata if present
      if(mappedMetadata){
        if(meta.title) document.getElementById('exam-title').value = meta.title;
        if(meta.date) document.getElementById('exam-date').value = formatExcelDate(meta.date);
        if(meta.type) document.getElementById('exam-type').value = meta.type;
        if(meta.code) document.getElementById('exam-code').value = meta.code;
        if(meta.description) document.getElementById('exam-desc').value = meta.description;
        if(meta.duration) document.getElementById('exam-duration').value = meta.duration;
        if(meta.totalmarks) document.getElementById('exam-marks').value = meta.totalmarks;
      }

      // Clear existing questions
      questionsEl.innerHTML = '';

      // Expect questionRows to have columns: question/text, A, B, C, D, correct, marks (case-insensitive)
      questionRows.forEach(row=>{
        // Map columns
        const map = {};
        for(const col in row){
          const key = col.toLowerCase().trim();
          const v = row[col];
          if(key.includes('question') || key.includes('text')) map.text = v;
          else if(key === 'a' || key.includes('choicea') || key.includes('optiona')) map.A = v;
          else if(key === 'b' || key.includes('choiceb') || key.includes('optionb')) map.B = v;
          else if(key === 'c' || key.includes('choicec') || key.includes('optionc')) map.C = v;
          else if(key === 'd' || key.includes('choiced') || key.includes('optiond')) map.D = v;
          else if(key.includes('correct') || key.includes('answer')) map.correct = v;
          else if(key.includes('mark')) map.marks = v;
        }
        // Only add if we have question text
        if(map.text){ createQuestionBlock(map); }
      });

      alert('Loaded ' + questionRows.length + ' rows from Excel');
    }catch(err){
      console.error(err);
      alert('Failed to parse Excel file: ' + err.message);
    }
  }

  function formatExcelDate(val){
    // val could be a Date object, Excel serial, or string
    if(!val) return '';
    if(val instanceof Date) return val.toISOString().slice(0,10);
    // If number (Excel serial)
    if(typeof val === 'number'){
      const date = XLSX.SSF.parse_date_code(val);
      if(date){
        const yyyy = date.y.toString().padStart(4,'0');
        const mm = date.m.toString().padStart(2,'0');
        const dd = date.d.toString().padStart(2,'0');
        return `${yyyy}-${mm}-${dd}`;
      }
    }
    // string fallback
    return String(val).split('T')[0];
  }

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
        if(str === undefined || str === null) return '';
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
