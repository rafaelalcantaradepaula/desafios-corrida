import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="empty-state">
      <h2 className="section-title">Tela nao encontrada</h2>
      <p className="screen-subtitle">
        A rota pedida ainda nao faz parte do fluxo inicial do MVP.
      </p>
      <Link className="button button-primary" to="/">
        Voltar para a home
      </Link>
    </section>
  );
}
