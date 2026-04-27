import { Link } from "react-router-dom";
import ChallengeCard from "@/components/ChallengeCard";
import { mockChallenges } from "@/mocks/dashboard";

export default function HomePage() {
  return (
    <div className="screen-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">App esportivo</p>
          <h2 className="screen-title">Acompanhe quem puxa o pelotao</h2>
          <p className="screen-subtitle">
            A fase 2 ja entrega a estrutura visual do MVP, a navegacao principal
            e a base para conectar API, banco e autenticacao nas proximas etapas.
          </p>
        </div>

        <div className="actions-row">
          <Link className="button button-primary" to="/challenges/orla-5k">
            Ver desafio em destaque
          </Link>
          <Link className="button button-secondary" to="/login">
            Novo desafio
          </Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="section-kicker">Desafios ativos</p>
            <h3 className="section-title">Cards com ranking resumido</h3>
          </div>

          <p className="section-note">Dados mockados para o scaffold da fase 2.</p>
        </div>

        <div className="card-stack">
          {mockChallenges.map((challenge) => (
            <ChallengeCard challenge={challenge} key={challenge.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

