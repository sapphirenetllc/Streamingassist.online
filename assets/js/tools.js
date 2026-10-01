// StreamingAssist free tools: 100% client-side, no APIs, no cost
(function(){
  // ---- 1. Streaming speed check (downloads a file from this same site) ----
  var btn = document.getElementById('speedBtn');
  if(btn){
    var fill = document.getElementById('speedFill');
    var out = document.getElementById('speedOut');
    btn.addEventListener('click', async function(){
      btn.disabled = true; btn.textContent = 'Testing...';
      fill.style.width = '2%'; out.style.display = 'none';
      try{
        var res = await fetch('assets/media/tv-spotlight.mp4?run=' + Date.now(), {cache:'no-store'});
        if(!res.ok || !res.body) throw new Error('fetch failed');
        var total = parseInt(res.headers.get('content-length') || '2859831', 10);
        var reader = res.body.getReader(), got = 0;
        var t0 = performance.now();
        for(;;){
          var chunk = await reader.read();
          if(chunk.done) break;
          got += chunk.value.length;
          fill.style.width = Math.min(99, Math.round(got/total*100)) + '%';
        }
        var sec = (performance.now()-t0)/1000;
        var mbps = got*8/sec/1e6;
        fill.style.width = '100%';
        var verdict, tip;
        if(mbps < 5){ verdict = 'Too slow for smooth streaming'; tip = 'Even HD will struggle at this speed. A 10 minute call usually finds the bottleneck: router placement, band, or provider issue.'; }
        else if(mbps < 15){ verdict = 'OK for HD on one TV'; tip = 'HD should play, but 4K will buffer and two TVs at once will fight. Call us to tune it up.'; }
        else if(mbps < 25){ verdict = 'Good. HD is smooth.'; tip = 'Solid for HD everywhere. 4K is borderline, so placement and settings still matter.'; }
        else { verdict = 'Excellent. Ready for 4K.'; tip = 'Your connection can handle 4K on multiple TVs. If anything still buffers, the issue is settings, not speed.'; }
        out.style.display = 'block';
        out.querySelector('[data-mbps]').textContent = mbps.toFixed(1) + ' Mbps';
        out.querySelector('[data-verdict]').textContent = verdict;
        out.querySelector('[data-tip]').textContent = tip;
      }catch(e){
        out.style.display = 'block';
        out.querySelector('[data-mbps]').textContent = 'Hmm';
        out.querySelector('[data-verdict]').textContent = 'Test could not finish';
        out.querySelector('[data-tip]').textContent = 'Your connection blocked the test file. Call (888) 882-5419 and we will check your speed with you live.';
      }
      btn.disabled = false; btn.textContent = 'Run the speed check again';
    });
  }

  // ---- 2. Buffering fix finder (3-question diagnostic) ----
  var quiz = document.getElementById('quizBox');
  if(quiz){
    var QUESTIONS = [
      {q:'What best describes the problem on your TV?', opts:['Picture freezes or buffers','An app crashes or will not open','No picture at all','Remote is not responding']},
      {q:'Is it happening on one app or every app?', opts:['Just one app','Every app','Not sure']},
      {q:'How does the TV connect to the internet?', opts:['Wi-Fi','Cable (wired)','Not sure']}
    ];
    var answers = [], step = 0;
    var FIXES = {
      bufferingWifi: {t:'Fix: your Wi-Fi setup', b:'Move the TV or stick to the 5 GHz network, restart the router (60 seconds off), and retest. If it still buffers, the channel or placement needs a live look.'},
      bufferingWired: {t:'Fix: your line speed or provider', b:'On a wired connection, buffering means the incoming speed is low or the app is throttled. Run the speed check above, then call us with the number and we will trace it.'},
      crash: {t:'Fix: clear the app and reinstall', b:'Open device settings, clear the troubled app cache and data, then remove and reinstall the app and sign in fresh. This resolves most single-app crashes.'},
      nopicture: {t:'Fix: power and input', b:'Unplug the TV and stick for 60 seconds, check the HDMI cable is fully seated, and cycle the TV input to the right HDMI port. No picture after that points to hardware or settings.'},
      remote: {t:'Fix: remote pairing', b:'Put in fresh batteries, hold the remote close to the stick, and repair it from settings. If volume keys fail but the rest works, the TV control (CEC) setting needs enabling.'}
    };
    function render(){
      if(step < QUESTIONS.length){
        var html = '<p style="font-weight:700;margin:0 0 6px">Question ' + (step+1) + ' of 3</p>';
        html += '<p style="font-size:18px;font-weight:700;margin:0 0 10px">' + QUESTIONS[step].q + '</p>';
        QUESTIONS[step].opts.forEach(function(o,i){ html += '<button class="quiz-opt" data-i="' + i + '">' + o + '</button>'; });
        quiz.innerHTML = html;
        quiz.querySelectorAll('.quiz-opt').forEach(function(b){
          b.addEventListener('click', function(){ answers[step] = parseInt(b.dataset.i,10); step++; render(); });
        });
      } else {
        var fix;
        if(answers[0] === 2) fix = FIXES.nopicture;
        else if(answers[0] === 3) fix = FIXES.remote;
        else if(answers[0] === 1) fix = FIXES.crash;
        else fix = (answers[2] === 1) ? FIXES.bufferingWired : FIXES.bufferingWifi;
        quiz.innerHTML = '<div class="quiz-result"><p style="font-weight:800;font-size:18px;margin:0 0 8px">' + fix.t + '</p><p style="color:var(--muted);font-size:15px;margin:0 0 14px">' + fix.b + '</p><a href="tel:+18888825419" class="btn btn-primary" style="width:100%">Did not work? Call (888) 882-5419</a><button id="quizAgain" style="display:block;margin:12px auto 0;background:none;border:0;color:var(--muted);font-size:13.5px;cursor:pointer;text-decoration:underline">Start over</button></div>';
        document.getElementById('quizAgain').addEventListener('click', function(){ answers = []; step = 0; render(); });
      }
    }
    render();
  }

  // ---- 3. Cord-cutting savings calculator ----
  var bill = document.getElementById('calcBill'), stream = document.getElementById('calcStream');
  if(bill && stream){
    var billVal = document.getElementById('calcBillVal'), streamVal = document.getElementById('calcStreamVal');
    var saveM = document.getElementById('calcSaveM'), saveY = document.getElementById('calcSaveY'), note = document.getElementById('calcNote');
    function fmt(n){ return '$' + Math.round(n).toLocaleString('en-US'); }
    function update(){
      var b = parseInt(bill.value,10), s = parseInt(stream.value,10);
      billVal.textContent = fmt(b); streamVal.textContent = fmt(s);
      var save = b - s;
      if(save <= 0){ saveM.textContent = fmt(0); saveY.textContent = fmt(0); note.textContent = 'Roughly break-even at these numbers. A free setup review on the call usually finds the extra savings.'; }
      else { saveM.textContent = fmt(save); saveY.textContent = fmt(save*12); note.textContent = 'That is ' + fmt(save*12) + ' back in your pocket every year.'; }
    }
    bill.addEventListener('input', update); stream.addEventListener('input', update); update();
  }
})();
