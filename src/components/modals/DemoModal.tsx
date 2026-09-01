import type { FormEvent } from 'react';
import { useState } from 'react';
import { site } from '../../config/site';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const endpoint = import.meta.env.VITE_DEMO_ENDPOINT;
    if (!endpoint) {
      const subject = encodeURIComponent('YourFriend demo request');
      const body = encodeURIComponent(`Name: ${data.name}
Email: ${data.email}
Company: ${data.company || ''}

${data.message || ''}`);
      window.location.href = `mailto:${site.salesEmail}?subject=${subject}&body=${body}`;
      return;
    }
    try {
      setStatus('sending');
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error('Request failed');
      setStatus('sent'); form.reset();
    } catch { setStatus('error'); }
  }
  return <Modal open={open} title="Request a demo" onClose={onClose}>
    <p className="modal__lead">Tell us where you want YourFriend to show up: desktop, VR/AR, screen copilot, HomePilot, or a custom experience.</p>
    {status === 'sent' ? <div className="form-success">Thank you. We’ll be in touch.</div> : <form className="demo-form" onSubmit={submit}><label>Name<input required name="name" autoComplete="name"/></label><label>Work email<input required type="email" name="email" autoComplete="email"/></label><label>Company / project<input name="company"/></label><label>What would you like to explore?<textarea name="message" rows={4}/></label><Button type="submit" icon="arrow" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Request Demo'}</Button>{status === 'error' && <p className="form-error">Couldn’t send the form. Please try again or email {site.salesEmail}.</p>}</form>}
  </Modal>;
}
