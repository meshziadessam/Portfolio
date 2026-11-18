'use client';
import {useState} from 'react';

export function WordImport() {
  const [filename,setFilename]=useState('');
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState('');
  return <form className="editor-settings word-import" onSubmit={async event=>{
    event.preventDefault();
    const form=event.currentTarget;
    setBusy(true);
    setStatus('Reading document and saving images…');
    try {
      const response=await fetch('/_admin/import-word',{method:'POST',body:new FormData(form)});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error);
      setStatus('Saved '+result.path+(result.warnings.length?'. Notes: '+result.warnings.join(' · '):''));
      form.reset();
      setFilename('');
    } catch(error) {setStatus(error instanceof Error?error.message:'Import failed.');}
    finally {setBusy(false);}
  }}>
    <h2>Turn a document into a page</h2>
    <p>Import text, tables, links, and embedded images as a published entry.</p>
    <label>Destination<select name="kind"><option value="writeups">Writeups</option><option value="projects">Projects</option></select></label>
    <label className="upload-zone"><span>{filename || 'Choose a Word document'}</span><small>DOCX · up to 25 MB · text, tables, and images</small><input name="document" type="file" accept=".docx" required disabled={busy} onChange={event=>setFilename(event.target.files?.[0]?.name || '')}/></label>
    <button className="button" disabled={busy}>{busy?'Importing…':'Import and save'}</button>
    <p role="status">{status}</p>
  </form>;
}