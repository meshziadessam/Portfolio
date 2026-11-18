'use client';

import { useEffect, useState } from 'react';
import { Readme } from './Readme';


type Block = {kind: 'Text' | 'Heading' | 'Link' | 'Image'; text: string; url: string; file?: File};
const blank: Block = {kind: 'Text', text: '', url: ''};

function safeUrl(value: string) {
  if (/^\/(?!\/)[a-z0-9/_.%~-]+$/i.test(value)) return value;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use an HTTP(S) link or a path from public/.');
  return url.href.replace(/[()]/g, symbol => symbol === '(' ? '%28' : '%29');
}

function escapeMdx(value: string) {
  return value.replace(/[&]/g, '&amp;').replace(/[<>{}]/g, symbol => '&#' + symbol.charCodeAt(0) + ';')
    .replace(/([\\`*_\[\]#~!|])/g, '\\$1');
}

type Entry = {kind:string;slug:string;title:string;description:string;category:string;date:string;published:boolean;revision:string;content:string;sections:{title:string;text:string}[]};

export function ContentEditor({mode = 'new'}: {mode?: 'new' | 'edit'}) {
  const [entries,setEntries]=useState<Entry[]>([]);
  const [editing,setEditing]=useState<Entry | null>(null);
  useEffect(() => {
    void fetch('/_admin/content').then(response=>response.json()).then(data=>{
      if(Array.isArray(data)) setEntries(data);
    });
  }, []);
  const [kind, setKind] = useState('writeups');
  const [importAssets,setImportAssets]=useState<{name:string;file:File}[]>([]);

  const [readme, setReadme] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([blank]);

  const [status, setStatus] = useState('');
  const [importing,setImporting]=useState(false);
  const [importName,setImportName]=useState('');
  const [saving, setSaving] = useState(false);

  async function save(data: FormData) {
    setSaving(true);
    setStatus('');
    try {
      const title = String(data.get('title')).trim();
      const slug = String(data.get('slug')).trim();
      const description = String(data.get('description')).trim();
      const category = String(data.get('category')).trim();
      if (!title || !description || !category) throw new Error('Fill in the title, category, and summary.');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Use lowercase letters, digits, and hyphens for the URL slug.');

      const assets: {name: string; file: File}[] = [];
      const blockContent = blocks.flatMap(({kind, text, url, file}) => {
        if (kind === 'Image' && file) {
          const extension = { 'image/png':'png', 'image/jpeg':'jpg', 'image/webp':'webp', 'image/gif':'gif', 'image/avif':'avif' }[file.type];
          if (!extension) throw new Error('Choose a PNG, JPEG, WebP, GIF, or AVIF image.');
          if (file.size > 10 * 1024 * 1024) throw new Error('Each image must be 10 MB or smaller.');
          const name = slug + '-' + crypto.randomUUID() + '.' + extension;
          assets.push({name, file});
          return ['![' + escapeMdx(text.trim().replace(/\s+/g, ' ')) + '](/images/content/' + name + ')'];
        }
        if (kind === 'Image') throw new Error('Choose a file for each image block.');
        const label = escapeMdx(text.trim());
        if (!label) return [];
        if (kind === 'Heading') return ['## ' + label.replace(/\s+/g, ' ')];
        if (kind === 'Link') return ['[' + label.replace(/\s+/g, ' ') + '](' + safeUrl(url) + ')'];
        return [label];
      }).join('\n\n');
      const content = [readme.trim(), blockContent].filter(Boolean).join('\n\n');
      if (!content && !editing?.sections.length) throw new Error('Add at least one content block.');

      data.set('kind', kind);
      if(editing) {
        data.set('revision', editing.revision);
        data.set('sections', JSON.stringify(editing.sections));
      }
      data.set('content', content);
            for (const asset of assets) data.append('asset:' + asset.name, asset.file);
      let finalContent=content;
      for(const asset of importAssets){
        const name=slug+'-'+crypto.randomUUID()+'.'+asset.name.split('.').pop();
        finalContent=finalContent.replaceAll(asset.name,name);
        data.append('asset:'+name,asset.file);
      }
      data.set('content',finalContent);
      const response = await fetch('/_admin/save', {method:'POST', body:data});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save content.');
      setStatus('Saved ' + result.path);
      const refreshed = await fetch('/_admin/content').then(response=>response.json());
      if(Array.isArray(refreshed)) {
        setEntries(refreshed);
        const entry=refreshed.find((entry:Entry)=>entry.kind===kind && entry.slug===slug);
        if(entry) { setEditing(entry); setReadme(entry.content); setBlocks([blank]); }
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save content.');
    } finally {
      setSaving(false);
    }
  }

  return <>
    {mode === 'edit' && <div className="editor-library">
      <label>Edit existing content<select value={editing ? editing.kind + '/' + editing.slug : ''} onChange={event=>{
        const entry=entries.find(item=>item.kind+'/'+item.slug===event.target.value)||null;
        setEditing(entry);
        setKind(entry?.kind || 'writeups');
        setReadme(entry?.content || '');
        setBlocks([blank]);
        setImportAssets([]);

        setStatus('');
      }}>
        <option value="">Choose a page to edit…</option>
        {entries.map(entry=><option key={entry.kind+'/'+entry.slug} value={entry.kind+'/'+entry.slug}>{entry.kind === 'projects'?'Project':'Writeup'} — {entry.title}</option>)}
      </select></label>
      {editing?.sections.length ? <div className="detail-panel"><h3>Project sections</h3>{editing.sections.map((section,index)=><div key={index}><input aria-label="Section title" value={section.title} onChange={event=>setEditing({...editing,sections:editing.sections.map(item=>item===section?{...item,title:event.target.value}:item)})}/><textarea aria-label="Section text" value={section.text} onChange={event=>setEditing({...editing,sections:editing.sections.map(item=>item===section?{...item,text:event.target.value}:item)})}/></div>)}<p>Section changes are saved with this project.</p></div>:null}
    </div>}
    {(mode !== 'edit' || editing) && <form key={editing ? editing.kind+'/'+editing.slug : 'new'} className="content-editor" onSubmit={event => {event.preventDefault(); void save(new FormData(event.currentTarget));}}>
    <div className="editor-page-heading"><label>Title<input className="page-title-input" defaultValue={editing?.title} name="title" aria-label="Title" placeholder="Untitled" required/></label><label>Summary<textarea className="page-summary-input" defaultValue={editing?.description} name="description" aria-label="Summary" placeholder="Add a short summary…" rows={2} required/></label></div>
    {mode === 'new' && <label className="unified-import">
      <span>Import Word or Markdown</span>
      <small>{importName || 'Choose a .docx, .md, or .markdown file. The format is detected automatically.'}</small>
      <input type="file" accept=".docx,.md,.markdown" disabled={importing || saving} onChange={async event=>{
        const input=event.currentTarget;
        const form=input.form;
        const file=input.files?.[0];
        if(!file || !form)return;
        setImporting(true);
        try {
          if(file.size>25*1024*1024)throw new Error('Choose a file smaller than 25 MB.');
          if(/\.docx$/i.test(file.name)){
            const upload=new FormData();
            upload.set('kind',kind);upload.set('document',file);upload.set('preview','true');
            const response=await fetch('/_admin/import-word',{method:'POST',body:upload});
            const result=await response.json();
            if(!response.ok)throw new Error(result.error);
            setReadme(result.fields.content);
            setImportAssets(result.assets.map((asset:{name:string;type:string;bytes:string})=>({
              name:asset.name,file:new File([Uint8Array.from(atob(asset.bytes),c=>c.charCodeAt(0))],asset.name,{type:asset.type})
            })));
            for(const name of ['title','description','category','date','slug']){
              const field=form.elements.namedItem(name) as HTMLInputElement | null;
              if(field)field.value=result.fields[name];
            }
            setStatus('Word imported.'+(result.warnings.length?' '+result.warnings.join(' · '):''));
          }else if(/\.(md|markdown)$/i.test(file.name)){
            const markdown=await file.text();
            if(!markdown.trim())throw new Error('The file is empty.');
            setReadme(markdown);setImportAssets([]);
            setStatus('Markdown imported.');
          }else throw new Error('Choose a Word or Markdown file.');
          setImportName(file.name);
        }catch(error){setStatus(error instanceof Error?error.message:'Import failed.');}
        finally{setImporting(false);input.value='';}
      }}/>
      {importing && <span role="status">Importing…</span>}
    </label>}
    <div className="editor-document">
      <div className="editor-readme">


        <>
          <div className="markdown-edit-pane"><h3>Edit content</h3><textarea aria-label="README Markdown" value={readme} onChange={event => setReadme(event.target.value)} rows={18}/></div>
          
          <button className="text-link" type="button" onClick={() => setReadme('')}>Remove README</button>
        </>
      </div>
    </div>
    <section className="live-preview"><h3>Preview</h3><Readme source={[readme,...blocks.map(block=>block.kind === 'Heading' ? '## '+block.text : block.kind === 'Link' ? '['+block.text+']('+block.url+')' : block.kind === 'Image' ? '*Image: '+(block.file?.name || block.text)+'*' : block.text)].join('\n\n')}/></section><aside className="editor-settings" aria-label="Content settings">
      <h2>Page settings</h2>
      <label>Type<select disabled={!!editing} value={kind} onChange={event => setKind(event.target.value)}><option value="writeups">Writeup</option><option value="projects">Project</option></select></label>
      <label>URL slug<input readOnly={!!editing} defaultValue={editing?.slug} name="slug" placeholder="my-new-project" required/></label>
      <label>Category<input defaultValue={editing?.category} name="category" required/></label>
      {kind === 'writeups' && <>
        <label>Date<input defaultValue={editing?.date} name="date" type="date" required/></label>
        <label className="editor-checkbox"><input defaultChecked={editing?.published} name="published" type="checkbox"/> Publish this writeup</label>
      </>}
      <button className="button" disabled={saving || importing}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create page'}</button>
      <p role="status">{status}</p>
    </aside>
  </form>}</>;
}