(function(){
  const addBtn = document.getElementById('add-question');
  const questionsEl = document.getElementById('questions');
  const form = document.getElementById('exam-form');
  const output = document.getElementById('output');
  const preview = document.getElementById('preview');

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

  function collectExam(){
    const title = document.getElementById('exam-title').value.trim();
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
        choices: {
          A: get('a'), B: get('b'), C: get('c'), D: get('d')
        },
        correct: get('correct'),
        marks: parseFloat(get('marks')) || 0
      });
    });

    return { title, desc, duration, totalMarks, questions: qs };
  }

  // Add one empty question by default
  createQuestionBlock();
})();
