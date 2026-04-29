import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardSkeleton } from "@/components/LoadingSkeletons";
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUserListItem,
} from "@/lib/admin-users";
import {
  createChallenge,
  deleteChallenge,
  loadChallenges,
} from "@/lib/challenges";
import { useAuthSession } from "@/lib/auth-context";
import { formatChallengeTypeLabel } from "@/lib/format";
import { useToast } from "@/lib/toast-context";
import type { ChallengeSummary } from "@/lib/types";

type ChallengeFilter = "active" | "finished" | "all";

const challengeFilters: Array<{
  label: string;
  value: ChallengeFilter;
}> = [
  {
    label: "Ativos",
    value: "active",
  },
  {
    label: "Encerrados",
    value: "finished",
  },
  {
    label: "Todos",
    value: "all",
  },
];

function getSegmentButtonClassName(isActive: boolean) {
  return `segment-button ${isActive ? "segment-button-active" : ""}`;
}

function getUserManagementClassName(isOpen: boolean) {
  return `roster-card admin-user-management ${isOpen ? "roster-card-open" : ""}`;
}

function sortUsers(users: AdminUserListItem[]) {
  return [...users].sort((left, right) => {
    const nameComparison = left.name.localeCompare(right.name);
    return nameComparison || left.email.localeCompare(right.email);
  });
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuthSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"pace" | "time">("pace");
  const [filter, setFilter] = useState<ChallengeFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingChallengeIds, setDeletingChallengeIds] = useState<Record<string, boolean>>({});
  const [dashboardErrorMessage, setDashboardErrorMessage] = useState("");
  const [adminUsers, setAdminUsers] = useState<AdminUserListItem[]>([]);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersErrorMessage, setUsersErrorMessage] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [isSavingUserName, setIsSavingUserName] = useState(false);
  const [isSavingUserPassword, setIsSavingUserPassword] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchChallenges() {
      setIsDashboardLoading(true);

      try {
        const challengeList = await loadChallenges({
          scope: "all",
        });

        if (!isMounted) {
          return;
        }

        setChallenges(challengeList);
        setDashboardErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDashboardErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar o painel administrativo.",
        );
      } finally {
        if (isMounted) {
          setIsDashboardLoading(false);
        }
      }
    }

    void fetchChallenges();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      setIsUsersLoading(true);

      try {
        const users = await listAdminUsers();

        if (!isMounted) {
          return;
        }

        setAdminUsers(sortUsers(users));
        setUsersErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUsersErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os usuarios.",
        );
      } finally {
        if (isMounted) {
          setIsUsersLoading(false);
        }
      }
    }

    void fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setEditUserName(selectedUser?.name ?? "");
    setEditUserPassword("");
  }, [selectedUser]);

  const filteredChallenges = challenges.filter((challenge) => {
    if (filter === "all") {
      return true;
    }

    if (filter === "finished") {
      return challenge.status === "finished";
    }

    return challenge.status === "active";
  });

  const emptyFilterTitle =
    filter === "finished"
      ? "Nenhum desafio encerrado"
      : filter === "active"
        ? "Nenhum desafio ativo"
        : "Nenhum desafio cadastrado";

  async function handleCreateChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const challenge = await createChallenge({
        title,
        description,
        type,
      });

      setTitle("");
      setDescription("");
      setIsCreateOpen(false);
      showToast("Desafio criado. Abrindo edicao.", "success");
      navigate(`/challenges/${challenge.id}`);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Nao foi possivel criar o desafio.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteChallenge(challenge: ChallengeSummary) {
    const shouldDelete = window.confirm(
      `Excluir o desafio "${challenge.title}" e todos os seus dados?`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingChallengeIds((currentState) => ({
      ...currentState,
      [challenge.id]: true,
    }));

    try {
      await deleteChallenge(challenge.id);
      setChallenges((currentChallenges) =>
        currentChallenges.filter((currentChallenge) => currentChallenge.id !== challenge.id),
      );
      showToast("Desafio deletado.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Nao foi possivel deletar o desafio.",
        "error",
      );
    } finally {
      setDeletingChallengeIds((currentState) => {
        const nextState = { ...currentState };
        delete nextState[challenge.id];
        return nextState;
      });
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreatingUser(true);

    try {
      const createdUser = await createAdminUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
      });

      setAdminUsers((currentUsers) => sortUsers([...currentUsers, createdUser]));
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      showToast("Administrador criado.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Nao foi possivel criar o administrador.",
        "error",
      );
    } finally {
      setIsCreatingUser(false);
    }
  }

  async function handleSaveUserName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUser || !editUserName.trim()) {
      return;
    }

    setIsSavingUserName(true);

    try {
      const updatedUser = await updateAdminUser(selectedUser.id, {
        name: editUserName,
      });

      setAdminUsers((currentUsers) =>
        sortUsers(
          currentUsers.map((currentUser) =>
            currentUser.id === updatedUser.id ? updatedUser : currentUser,
          ),
        ),
      );
      setSelectedUser(updatedUser);
      showToast("Usuario atualizado.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar o usuario.",
        "error",
      );
    } finally {
      setIsSavingUserName(false);
    }
  }

  async function handleSaveUserPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUser || !editUserPassword.trim()) {
      return;
    }

    setIsSavingUserPassword(true);

    try {
      const updatedUser = await updateAdminUser(selectedUser.id, {
        password: editUserPassword,
      });

      setAdminUsers((currentUsers) =>
        sortUsers(
          currentUsers.map((currentUser) =>
            currentUser.id === updatedUser.id ? updatedUser : currentUser,
          ),
        ),
      );
      setSelectedUser(updatedUser);
      setEditUserPassword("");
      showToast("Senha alterada.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Nao foi possivel alterar a senha.",
        "error",
      );
    } finally {
      setIsSavingUserPassword(false);
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) {
      return;
    }

    if (selectedUser.id === user?.id) {
      showToast("Nao e possivel excluir o usuario da sessao atual.", "error");
      return;
    }

    const shouldDelete = window.confirm(`Excluir o usuario "${selectedUser.name}"?`);

    if (!shouldDelete) {
      return;
    }

    setIsDeletingUser(true);

    try {
      await deleteAdminUser(selectedUser.id);
      setAdminUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== selectedUser.id),
      );
      setSelectedUser(null);
      showToast("Usuario deletado.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Nao foi possivel deletar o usuario.",
        "error",
      );
    } finally {
      setIsDeletingUser(false);
    }
  }

  return (
    <div className="screen-stack">
      <section className="section-block">
        <div className="section-head">
          <h3 className="section-title">Todos os desafios</h3>
          <button
            className="button button-secondary button-compact"
            onClick={() => setIsCreateOpen((currentState) => !currentState)}
            type="button"
          >
            {isCreateOpen ? "Fechar" : "Novo desafio"}
          </button>
        </div>

        <div className="segment-control" role="tablist" aria-label="Filtrar desafios">
          {challengeFilters.map((challengeFilter, index) => (
            <button
              aria-pressed={filter === challengeFilter.value}
              className={getSegmentButtonClassName(filter === challengeFilter.value)}
              key={`filtro-${index + 1}`}
              onClick={() => setFilter(challengeFilter.value)}
              type="button"
            >
              {challengeFilter.label}
            </button>
          ))}
        </div>

        {isCreateOpen ? (
          <article className="form-card">
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

              <button className="button button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Criando..." : "Criar desafio"}
              </button>
            </form>
          </article>
        ) : null}

        {isDashboardLoading ? <DashboardSkeleton /> : null}

        {!isDashboardLoading && dashboardErrorMessage ? (
          <section className="empty-state">
            <h3 className="section-title">Falha ao abrir o painel</h3>
            <p className="screen-subtitle">{dashboardErrorMessage}</p>
          </section>
        ) : null}

        {!isDashboardLoading && !dashboardErrorMessage && filteredChallenges.length === 0 ? (
          <section className="empty-state">
            <h3 className="section-title">{emptyFilterTitle}</h3>
          </section>
        ) : null}

        {!isDashboardLoading && !dashboardErrorMessage && filteredChallenges.length > 0 ? (
          <div className="dashboard-grid">
            {filteredChallenges.map((challenge, index) => {
              const isDeletingChallenge = Boolean(deletingChallengeIds[challenge.id]);

              return (
                <article
                  className={`surface-card admin-challenge-card surface-card-tone-${challenge.type}`}
                  key={`desafio-${index + 1}`}
                >
                  <Link className="admin-challenge-link" to={`/challenges/${challenge.id}`}>
                    <p className={`challenge-card-state challenge-card-state-${challenge.status}`}>
                      {challenge.statusLabel}
                    </p>
                    <h3 className="challenge-card-title">{challenge.title}</h3>
                    <div className="admin-card-copy">
                      <div>{formatChallengeTypeLabel(challenge.type)}</div>
                      <div>{challenge.teamCount} equipes</div>
                      <div>Lider: {challenge.leaderTeamName}</div>
                    </div>
                  </Link>

                  <div className="admin-card-actions">
                    <Link className="button button-secondary button-compact" to={`/challenges/${challenge.id}`}>
                      Abrir
                    </Link>
                    <button
                      className="button button-danger button-compact"
                      disabled={isDeletingChallenge}
                      onClick={() => void handleDeleteChallenge(challenge)}
                      type="button"
                    >
                      {isDeletingChallenge ? "Deletando..." : "Deletar"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="section-block">
        <article className={getUserManagementClassName(isUserManagementOpen)}>
          <button
            aria-expanded={isUserManagementOpen}
            className="roster-toggle admin-user-management-toggle"
            onClick={() => setIsUserManagementOpen((currentState) => !currentState)}
            type="button"
          >
            <span className="roster-copy">
              <span className="section-title">Gestao de usuarios</span>
              <span className="roster-meta">
                {adminUsers.length} administradores cadastrados
              </span>
            </span>

            <span className="roster-headside">
              <span
                aria-hidden="true"
                className={`roster-chevron ${isUserManagementOpen ? "roster-chevron-open" : ""}`}
              />
            </span>
          </button>

          {isUserManagementOpen ? (
            <div className="roster-editor">
              <form className="form-stack" onSubmit={handleCreateUser}>
                <div className="form-grid form-grid-user">
                  <label className="field-group">
                    <span className="field-label">Nome</span>
                    <input
                      className="field-input"
                      onChange={(event) => setNewUserName(event.target.value)}
                      placeholder="Nome do admin"
                      value={newUserName}
                    />
                  </label>

                  <label className="field-group">
                    <span className="field-label">Email</span>
                    <input
                      className="field-input"
                      onChange={(event) => setNewUserEmail(event.target.value)}
                      placeholder="admin@email.com"
                      type="email"
                      value={newUserEmail}
                    />
                  </label>

                  <label className="field-group">
                    <span className="field-label">Senha</span>
                    <input
                      className="field-input"
                      onChange={(event) => setNewUserPassword(event.target.value)}
                      placeholder="Minimo 8 caracteres"
                      type="password"
                      value={newUserPassword}
                    />
                  </label>
                </div>

                <button className="button button-primary" disabled={isCreatingUser} type="submit">
                  {isCreatingUser ? "Criando..." : "Criar administrador"}
                </button>
              </form>

              {isUsersLoading ? <DashboardSkeleton /> : null}

              {!isUsersLoading && usersErrorMessage ? (
                <section className="empty-state">
                  <h3 className="section-title">Falha ao carregar usuarios</h3>
                  <p className="screen-subtitle">{usersErrorMessage}</p>
                </section>
              ) : null}

              {!isUsersLoading && !usersErrorMessage ? (
                <div className="user-list">
                  {adminUsers.map((adminUser, index) => (
                    <button
                      className="user-list-item"
                      key={`usuario-${index + 1}`}
                      onClick={() => setSelectedUser(adminUser)}
                      type="button"
                    >
                      <span className="user-list-copy">
                        <strong className="user-list-name">{adminUser.name}</strong>
                        <span className="user-list-email">{adminUser.email}</span>
                      </span>
                      <span className="status-pill">
                        {adminUser.id === user?.id ? "Voce" : "Admin"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </article>
      </section>

      {selectedUser ? (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedUser(null);
            }
          }}
          role="presentation"
        >
          <section
            aria-modal="true"
            className="modal-card"
            role="dialog"
          >
            <div className="section-head">
              <div>
                <p className="card-kicker">Administrador</p>
                <h3 className="section-title">{selectedUser.email}</h3>
              </div>
              <button
                className="button button-secondary button-compact"
                onClick={() => setSelectedUser(null)}
                type="button"
              >
                Fechar
              </button>
            </div>

            <form className="form-stack" onSubmit={handleSaveUserName}>
              <label className="field-group">
                <span className="field-label">Nome</span>
                <input
                  className="field-input"
                  onChange={(event) => setEditUserName(event.target.value)}
                  value={editUserName}
                />
              </label>

              <button
                className="button button-primary"
                disabled={isSavingUserName || !editUserName.trim()}
                type="submit"
              >
                {isSavingUserName ? "Salvando..." : "Salvar nome"}
              </button>
            </form>

            <form className="form-stack" onSubmit={handleSaveUserPassword}>
              <label className="field-group">
                <span className="field-label">Nova senha</span>
                <input
                  className="field-input"
                  onChange={(event) => setEditUserPassword(event.target.value)}
                  placeholder="Minimo 8 caracteres"
                  type="password"
                  value={editUserPassword}
                />
              </label>

              <button
                className="button button-secondary"
                disabled={isSavingUserPassword || !editUserPassword.trim()}
                type="submit"
              >
                {isSavingUserPassword ? "Alterando..." : "Alterar senha"}
              </button>
            </form>

            <button
              className="button button-danger"
              disabled={isDeletingUser || selectedUser.id === user?.id}
              onClick={() => void handleDeleteUser()}
              type="button"
            >
              {isDeletingUser ? "Deletando..." : "Deletar usuario"}
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}
