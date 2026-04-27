import { Link, useSearchParams } from "react-router-dom";
import { useAuthSession } from "@/lib/auth-context";

function getIntentMessage(intent: string | null) {
  switch (intent) {
    case "challenge-create":
      return "Voce abriu o fluxo de criacao de desafio. O formulario real entra na fase 4.";
    case "team-add":
      return "Voce abriu o fluxo para adicionar equipe. O cadastro real entra na fase 4.";
    case "participant-add":
      return "Voce abriu o fluxo para adicionar participante. O cadastro real entra na fase 4.";
    default:
      return "Sua sessao esta valida. Esta area sera expandida com os formularios administrativos nas proximas fases.";
  }
}

export default function AdminPage() {
  const { user } = useAuthSession();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent");

  return (
    <div className="screen-stack">
      <section className="summary-card">
        <p className="card-kicker">Area administrativa</p>
        <h2 className="screen-title">Painel do administrador</h2>
        <p className="screen-subtitle">
          Logado como {user?.email}. {getIntentMessage(intent)}
        </p>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="section-kicker">Atalhos</p>
            <h3 className="section-title">Fluxos disponiveis nesta fase</h3>
          </div>
        </div>

        <div className="card-stack">
          <article className="challenge-card">
            <p className="card-kicker">Desafios</p>
            <h3 className="challenge-card-title">Criar e publicar desafios</h3>
            <p className="challenge-card-copy">
              O fluxo visual esta autenticado. O formulario persistente entra na fase 4.
            </p>
            <div className="actions-row">
              <Link className="button button-secondary" to="/">
                Voltar para a home
              </Link>
              <Link className="button button-primary" to="/challenges/orla-5k">
                Ver desafio
              </Link>
            </div>
          </article>

          <article className="challenge-card">
            <p className="card-kicker">Equipes</p>
            <h3 className="challenge-card-title">Abrir ranking e equipes</h3>
            <p className="challenge-card-copy">
              Use os atalhos abaixo para validar que a sessao administrativa esta sendo mantida.
            </p>
            <div className="actions-row">
              <Link className="button button-secondary" to="/challenges/orla-5k">
                Abrir desafio pace
              </Link>
              <Link className="button button-secondary" to="/teams/lobas-asfalto">
                Abrir equipe
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
