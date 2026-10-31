import type { ReactNode } from 'react';
import './card.css';

interface CardProps {
  title: string;
  children: ReactNode;
  /** Without its own surface, for a group inside another card. */
  flat?: boolean;
}

export function Card({ title, children, flat }: CardProps) {
  return (
    <section className={flat ? 'card card--flat' : 'card'}>
      <h2 className="card__title">{title}</h2>
      {children}
    </section>
  );
}
