import { X } from "lucide-react";

export default function Modal({ children, onClose, title }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal__header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} title="Kapat" type="button">
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
