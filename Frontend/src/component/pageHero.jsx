import { ArrowLeft } from 'lucide-react';
import bgHero from '../assets/imgbg.jpg';

export default function PageHero({ label, onBack, badge, title, subtitle, actions, children, variant }) {
  return (
    <header className={`page-hero page-font-scope${variant ? ` page-hero--${variant}` : ''}`} style={{ backgroundImage: `url(${bgHero})` }}>
      <div className="page-hero__content">
        <div className="page-hero__top">
          <div className="page-hero__leading">
            <button type="button" className="page-hero__back" onClick={onBack}>
              <ArrowLeft size={18} />
              {label}
            </button>
            {badge && (
              <>
                <span className="page-hero__separator">•</span>
                <div className="page-hero__badge">{badge}</div>
              </>
            )}
          </div>
          {actions && <div className="page-hero__actions">{actions}</div>}
        </div>
        <h1 className="page-hero__title">{title}</h1>
        {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
        {children}
      </div>
    </header>
  );
}
