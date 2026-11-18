'use client';
import {useState} from 'react';
import {FilePlus2, PenLine} from 'lucide-react';
import {ContentEditor} from './ContentEditor';


export function AdminWorkspace() {
  const [mode,setMode]=useState<'new'|'edit'>('new');
  return <div className="admin-workspace">
    <header className="admin-heading"><div><p className="eyebrow">Content studio</p><h1>Your workspace<span>.</span></h1></div><p>Create, edit, and import your portfolio content.</p></header>
    <nav className="admin-tabs" aria-label="Editor mode">
      <button type="button" aria-pressed={mode==='new'} onClick={()=>setMode('new')}><FilePlus2 size={18}/>New page</button>
      <button type="button" aria-pressed={mode==='edit'} onClick={()=>setMode('edit')}><PenLine size={18}/>Edit content</button>
    </nav>
    <ContentEditor key={mode} mode={mode}/>
  </div>;
}
