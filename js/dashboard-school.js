(() => {
  const user = requireSeatwiseLogin();
  if (!user) return;

  const name=(user.name||'Administrator').trim();
  const parts=name.split(/\s+/).filter(Boolean);
  document.getElementById('avatar').textContent=(parts.length>1?parts[0][0]+parts[parts.length-1][0]:parts[0]?.[0]||'A').toUpperCase();
  document.getElementById('welcome').innerHTML='Overview for <strong>'+escapeHtml(user.school_name||'Current School')+'</strong>';

  const now=new Date();
  const today=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  const session=getCurrentAcademicSession();
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=typeof v==='number'?v.toLocaleString('en-IN'):String(v??'0');};
  const showError=t=>{document.getElementById('examList').innerHTML='<div class="empty">'+escapeHtml(t)+'</div>';};

  async function load(){
    if(!user.school_id){showError('School scope is missing from this session. Please sign in again.');return;}

    const classesRes=await seatwiseDb.from('classes').select('student_count').eq('school_id',user.school_id).eq('academic_session',session);
    if(classesRes.error){console.error(classesRes.error);showError('Unable to load school class data.');return;}
    const classRows=classesRes.data||[];
    set('classes',classRows.length);
    set('students',classRows.reduce((sum,row)=>sum+(Number(row.student_count)||0),0));

    const adminsRes=await seatwiseDb.from('admin_users').select('id').eq('school_id',user.school_id);
    if(adminsRes.error){console.error(adminsRes.error);showError('Unable to resolve school examination ownership.');return;}
    const adminIds=(adminsRes.data||[]).map(a=>a.id).filter(Boolean);
    if(!adminIds.length){set('upcoming',0);set('created',0);set('pending',0);set('planTotal','0 / 0');document.getElementById('examList').innerHTML='<div class="empty">No examination records for this school.</div>';return;}

    const plannersRes=await seatwiseDb.from('exam_planners').select('id').in('created_by',adminIds);
    if(plannersRes.error){console.error(plannersRes.error);showError('Unable to load school exam planners.');return;}
    const plannerIds=(plannersRes.data||[]).map(p=>p.id).filter(Boolean);
    if(!plannerIds.length){set('upcoming',0);set('created',0);set('pending',0);set('planTotal','0 / 0');document.getElementById('examList').innerHTML='<div class="empty">No current or future exams for this school.</div>';return;}

    const examsRes=await seatwiseDb.from('exams').select('id,class_number,subject_name,exam_date,status').in('planner_id',plannerIds).gte('exam_date',today).neq('status','cancelled').order('exam_date',{ascending:true});
    if(examsRes.error){console.error(examsRes.error);showError('Unable to load school examination data.');return;}
    const exams=examsRes.data||[];
    set('upcoming',exams.length);
    renderExams(exams);

    const allExamIdsRes=await seatwiseDb.from('exams').select('id').in('planner_id',plannerIds);
    if(allExamIdsRes.error){console.error(allExamIdsRes.error);showError('Unable to calculate seating plan totals.');return;}
    const allExamIds=(allExamIdsRes.data||[]).map(x=>x.id).filter(Boolean);
    if(!allExamIds.length){set('created',0);set('pending',exams.length);set('planTotal','0 / '+exams.length);return;}

    const plansRes=await seatwiseDb.from('seating_plans').select('id,exam_id').in('exam_id',allExamIds);
    if(plansRes.error){console.error(plansRes.error);set('created',0);set('pending',exams.length);set('planTotal','0 / '+allExamIds.length);return;}
    const plans=plansRes.data||[];
    const plannedExamIds=new Set(plans.map(x=>x.exam_id).filter(Boolean));
    const pending=exams.filter(x=>!plannedExamIds.has(x.id)).length;
    set('created',plannedExamIds.size);
    set('pending',pending);
    set('planTotal',plannedExamIds.size+' / '+(plannedExamIds.size+pending));
  }

  function renderExams(exams){
    const el=document.getElementById('examList');
    if(!exams.length){el.innerHTML='<div class="empty">No current or future exams for this school.</div>';return;}
    el.innerHTML=exams.slice(0,6).map(x=>{
      const d=new Date(x.exam_date+'T00:00:00');
      return '<div class="exam"><div class="left"><div class="date"><b>'+String(d.getDate()).padStart(2,'0')+'</b><span>'+d.toLocaleDateString('en-US',{month:'short'})+'</span></div><div class="info"><b>'+escapeHtml(x.subject_name||'Examination')+' – Class '+escapeHtml(x.class_number)+'</b><span>'+d.toLocaleDateString('en-US',{weekday:'long'})+' · '+escapeHtml(x.status||'scheduled')+'</span></div></div><span class="badge">Scheduled</span></div>';
    }).join('');
  }

  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  load();
})();
