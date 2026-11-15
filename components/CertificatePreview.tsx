'use client';

import { withBasePath } from '../lib/site-path';
import Image from 'next/image';
import { Maximize2, X } from 'lucide-react';
import { useId, useRef } from 'react';

export function CertificatePreview({title, image}: {title: string; image: string}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const label = useId();
  return <>
    <button className="text-link certificate-trigger" type="button" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">
      <span><strong>{title}</strong><Maximize2 size={15} aria-hidden="true"/></span>
    </button>
    <dialog ref={dialog} className="certificate-dialog" aria-labelledby={label}>
      <header>
        <h3 id={label}>{title}</h3>
        <form method="dialog"><button type="submit" aria-label="Close certificate preview"><X size={22}/></button></form>
      </header>
      <div className="certificate-image" onContextMenu={event => event.preventDefault()} onDragStart={event => event.preventDefault()}>
        <Image src={withBasePath(image)} alt={'Certificate for ' + title} fill sizes="(max-width: 900px) 94vw, 850px" draggable={false}/>
      </div>
    </dialog>
  </>;
}