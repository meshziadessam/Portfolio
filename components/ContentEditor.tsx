'use client';

import { useState } from 'react';
import { Readme } from './Readme';
import { Heading2, ImageIcon, Link2, Plus, Text, Trash2 } from 'lucide-react';

type Block = {kind: 'Text' | 'Heading' | 'Link' | 'Image'; text: string; url: string; file?: File};
const blank: Block = {kind: 'Text', text: '', url: ''};
const blockTypes = [
  {kind:'Text', label:'Paragraph', icon:Text},
  {kind:'Heading', label:'Heading', icon:Heading2},
  {kind:'Image', label:'Image', icon:ImageIcon},
  {kind:'Link', label:'Link', icon:Link2},
] as const;

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

export function ContentEditor() {
  const [kind, setKind] = useState('writeups');
  const [readme, setReadme] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([blank]);
  const [menu, setMenu] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  function update(index: number, changes: Partial<Block>) {
    setBlocks(previous => previous.map((block, i) => i === index ? {...block, ...changes} : block));
  }

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
      if (!content) throw new Error('Add at least one content block.');

      data.set('kind', kind);
      data.set('content', content);
      for (const asset of assets) data.append('asset:' + asset.name, asset.file);
      const response = await fetch('/_admin/save', {method:'POST', body:data});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save content.');
      setStatus('Saved ' + result.path);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save content.');
    } finally {
      setSaving(false);
    }
  }

  function chooseBlock(index: number, type: Block['kind']) {
    setBlocks(previous => index === previous.length
      ? [...previous, {...blank, kind:type}]
      : previous.map((block, i) => i === index ? {...block, kind:type} : block));
    setMenu(null);
    requestAnimationFrame(() => document.getElementById('editor-block-' + index)?.focus());
  }

  return <form className="content-editor" onSubmit={event => {event.preventDefault(); void save(new FormData(event.currentTarget));}}>
    <div className="editor-document">
      <input className="editor-title" name="title" aria-label="Title" placeholder="Untitled" required/>
      <textarea className="editor-summary" name="description" aria-label="Summary" placeholder="Add a short summary…" rows={2} required/>
      <div className="editor-readme">
        <label>Import README.md<input type="file" accept=".md,.markdown,text/markdown" onChange={async event => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            if (file.size > 1024 * 1024) throw new Error('Choose a Markdown file under 1 MB.');
            const markdown = await file.text();
            if (!markdown.trim()) throw new Error('The Markdown file is empty.');
            setReadme(markdown);
            setStatus('Imported ' + file.name);
          } catch (error) {
            setStatus(error instanceof Error ? error.message : 'Could not import the README.');
          } finally {
            event.target.value = '';
          }
        }}/></label>
        {readme && <>
          <details><summary>Edit Markdown</summary><textarea aria-label="README Markdown" value={readme} onChange={event => setReadme(event.target.value)} rows={8}/></details>
          <Readme source={readme}/>
          <button className="text-link" type="button" onClick={() => setReadme('')}>Remove README</button>
        </>}
      </div>
      <div className="editor-blocks" aria-label="Content blocks">
        {blocks.map((block, index) => <div className="editor-row" key={index}>
          <button type="button" className="editor-icon" aria-label="Change block type" aria-expanded={menu === index} onClick={() => setMenu(menu === index ? null : index)}><Plus size={17}/></button>
          <div className="editor-row-content">
            <textarea id={'editor-block-' + index} className={'editor-' + block.kind.toLowerCase()} rows={block.kind === 'Text' ? 3 : 1}
              aria-label={block.kind + ' block'}
              placeholder={block.kind === 'Text' ? 'Write something, or type / for blocks…' : block.kind === 'Heading' ? 'Heading' : block.kind === 'Image' ? 'Image description' : 'Link text'}
              value={block.text} onChange={event => {
                if (!block.text && event.target.value === '/') setMenu(index);
                else update(index, {text:event.target.value});
              }}/>
            {block.kind === 'Image' && <>
              <input type="file" aria-label="Choose image" accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                onChange={event => update(index, {file:event.target.files?.[0]})}/>
              {block.file && <p className="editor-image-name">{block.file.name}</p>}
            </>}
            {block.kind === 'Link' && <input aria-label={block.kind + ' URL'} placeholder="Paste a URL or /images/filename" value={block.url} required onChange={event => update(index, {url:event.target.value})}/>}
          </div>
          <button type="button" className="editor-icon" aria-label="Remove block" onClick={() => {
            setBlocks(previous => previous.length === 1 ? [blank] : previous.filter((_, i) => i !== index));
            setMenu(null);
          }}><Trash2 size={15}/></button>
          {menu === index && <div className="editor-menu">{blockTypes.map(({kind,label,icon:Icon}) =>
            <button type="button" key={kind} onClick={() => chooseBlock(index, kind)}><Icon size={16}/>{label}</button>
          )}</div>}
        </div>)}
        <div className="editor-add">
          <button type="button" className="text-link" aria-expanded={menu === blocks.length} onClick={() => setMenu(menu === blocks.length ? null : blocks.length)}><Plus size={17}/> Add block</button>
          {menu === blocks.length && <div className="editor-menu">{blockTypes.map(({kind,label,icon:Icon}) =>
            <button type="button" key={kind} onClick={() => chooseBlock(blocks.length, kind)}><Icon size={16}/>{label}</button>
          )}</div>}
        </div>
      </div>
    </div>
    <aside className="editor-settings" aria-label="Content settings">
      <h2>Details</h2>
      <label>Type<select value={kind} onChange={event => setKind(event.target.value)}><option value="writeups">Writeup</option><option value="projects">Project</option></select></label>
      <label>URL slug<input name="slug" placeholder="my-new-project" required/></label>
      <label>Category<input name="category" required/></label>
      {kind === 'writeups' && <>
        <label>Date<input name="date" type="date" required/></label>
        <label className="editor-checkbox"><input name="published" type="checkbox"/> Publish this writeup</label>
      </>}
      <button className="button" disabled={saving}>{saving ? 'Saving…' : 'Save to workspace'}</button>
      <p role="status">{status}</p>
    </aside>
  </form>;
}