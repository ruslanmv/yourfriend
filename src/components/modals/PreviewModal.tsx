import { Modal } from '../ui/Modal';
export function PreviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <Modal open={open} title="YourFriend preview" onClose={onClose}><div className="preview-panel"><div className="preview-panel__orb"/><p>Drop your commercial product preview into <code>public/preview/</code>, then replace this panel with a &lt;video&gt; element. The landing page is intentionally functional without shipping proprietary footage.</p></div></Modal>;
}
