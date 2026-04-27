import { Link, useParams } from "react-router-dom";
import { formatChallengeTypeLabel } from "@/lib/format";
import { getMockTeamDetail } from "@/mocks/dashboard";

export default function TeamPage() {
  const { challengeTeamId = "" } = useParams();
  const team = getMockTeamDetail(challengeTeamId);

  if (!team) {
    return (
      <section className="empty-state">
        <h2 className="section-title">Equipe nao encontrada</h2>
        <p className="screen-subtitle">
          Use os links demonstrativos do ranking para validar o fluxo da fase 2.
        </p>
        <Link className="button button-primary" to="/">
          Voltar para a home
        </Link>
      </section>
    );
  }

  return (
    <div className="screen-stack">
      <section className="summary-card">
        <p className="card-kicker">{formatChallengeTypeLabel(team.challengeType)}</p>
        <h2 className="screen-title">{team.teamName}</h2>
        <p className="screen-subtitle">
          Participantes e resultados do desafio {team.challengeTitle}.
        </p>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="section-kicker">Tela de equipe</p>
            <h3 className="section-title">Lista simples de participantes</h3>
          </div>

          <Link className="button button-secondary" to="/login">
            Adicionar participante
          </Link>
        </div>

        <div className="roster-list">
          {team.participants.map((participant) => (
            <article className="roster-row" key={participant.id}>
              <div className="roster-copy">
                <p className="roster-name">{participant.name}</p>
                <p className="roster-meta">Resultado individual opcional</p>
              </div>

              <strong className="roster-result">{participant.resultLabel}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="form-card">
        <div className="section-head">
          <div>
            <p className="section-kicker">Lancamento futuro</p>
            <h3 className="section-title">Base do formulario</h3>
          </div>
        </div>

        <div className="form-grid">
          <label className="field-group">
            <span className="field-label">Horas</span>
            <input className="field-input" inputMode="numeric" placeholder="00" />
          </label>
          <label className="field-group">
            <span className="field-label">Minutos</span>
            <input className="field-input" inputMode="numeric" placeholder="00" />
          </label>
          <label className="field-group">
            <span className="field-label">Segundos</span>
            <input className="field-input" inputMode="numeric" placeholder="00" />
          </label>
        </div>

        <p className="support-text">
          Informe o pace em minutos por quilometro ou o tempo total em horas,
          minutos e segundos. O valor final sera salvo em segundos no banco.
        </p>
      </section>
    </div>
  );
}

