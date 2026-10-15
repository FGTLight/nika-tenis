import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ApiError } from '../../lib/api';
import { AdminApiContext, createAdminApi, login, tokenStorage } from './adminApi';
import { ProductsAdmin } from './ProductsAdmin';
import { LeadsAdmin } from './LeadsAdmin';
import { StoreAdmin } from './StoreAdmin';
import { ReviewsAdmin } from './ReviewsAdmin';
import { ThemeToggle } from '../../components/ThemeToggle';

const TABS = [
  { id: 'products', label: 'Produtos' },
  { id: 'leads', label: 'Leads atacado' },
  { id: 'store', label: 'Dados da loja' },
  { id: 'reviews', label: 'Avaliações' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await login(username, password);
      onLogin(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-line bg-coal p-8">
        <p className="font-display text-4xl">
          NIKA<span className="text-brand">.</span> admin
        </p>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-bone/60">Usuário</span>
          <input className="input" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-bone/60">Senha</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn-brand w-full" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
        <Link to="/" className="block text-center text-xs text-mute hover:text-bone">
          ← Voltar ao site
        </Link>
      </form>
    </main>
  );
}

/**
 * Painel /admin protegido por JWT.
 * O token fica no localStorage; se expirar (401), volta para o login.
 */
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [tab, setTab] = useState<TabId>('products');

  const logout = () => {
    tokenStorage.set(null);
    setToken(null);
  };

  const api = useMemo(() => (token ? createAdminApi(token) : null), [token]);

  // Valida o token salvo ao abrir o painel
  useEffect(() => {
    api?.me().catch((err) => {
      if (err instanceof ApiError && err.status === 401) logout();
    });
  }, [api]);

  return (
    <>
      <Helmet>
        <title>Admin | Nika Tênis</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {!api ? (
        <Login
          onLogin={(t) => {
            tokenStorage.set(t);
            setToken(t);
          }}
        />
      ) : (
        <AdminApiContext.Provider value={api}>
          <div className="min-h-screen">
            <header className="sticky top-0 z-20 border-b border-line bg-ink/90 backdrop-blur">
              <div className="container-x flex h-16 items-center justify-between gap-4">
                <Link to="/" className="font-display text-2xl">
                  NIKA<span className="text-brand">.</span> <span className="text-mute">admin</span>
                </Link>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <button onClick={logout} className="text-xs uppercase tracking-widest text-mute hover:text-bone">
                    Sair
                  </button>
                </div>
              </div>
              <nav className="container-x no-scrollbar flex gap-1 overflow-x-auto pb-3">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                      tab === t.id ? 'bg-brand text-ink' : 'text-bone/70 hover:text-bone'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            </header>

            <main className="container-x py-8">
              {tab === 'products' && <ProductsAdmin onUnauthorized={logout} />}
              {tab === 'leads' && <LeadsAdmin onUnauthorized={logout} />}
              {tab === 'store' && <StoreAdmin onUnauthorized={logout} />}
              {tab === 'reviews' && <ReviewsAdmin onUnauthorized={logout} />}
            </main>
          </div>
        </AdminApiContext.Provider>
      )}
    </>
  );
}
