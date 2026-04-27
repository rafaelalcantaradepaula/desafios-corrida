import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createChallenge } from "@/lib/challenges";
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
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"pace" | "time">("pace");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleCreateChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");

    try {
      const challenge = await createChallenge({
        title,
        description,
        type,
      });

      setFeedback("Desafio criado com sucesso.");
      setTitle("");
      setDescription("");
      navigate(`/challenges/${challenge.id}`);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Nao foi possivel criar o desafio.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
              O fluxo real da fase 4 ja cria desafios ativos via API.
            </p>
            <form className="form-stack" onSubmit={handleCreateChallenge}>
              <label className="field-group">
                <span className="field-label">Titulo</span>
                <input
                  className="field-input"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Corrida Central 10K"
                  value={title}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Descricao</span>
                <textarea
                  className="field-input field-textarea"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Descreva as regras e o contexto do desafio."
                  value={description}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Tipo</span>
                <select
                  className="field-input"
                  onChange={(event) => setType(event.target.value as "pace" | "time")}
                  value={type}
                >
                  <option value="pace">Pace medio</option>
                  <option value="time">Tempo acumulado</option>
                </select>
              </label>

              <div className="actions-row">
                <Link className="button button-secondary" to="/">
                  Voltar para a home
                </Link>
                <button className="button button-primary" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Criando..." : "Criar desafio"}
                </button>
              </div>
            </form>

            {feedback ? <p className="support-text">{feedback}</p> : null}
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
