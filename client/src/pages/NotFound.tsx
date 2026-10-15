import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <Helmet>
        <title>Página não encontrada | Nika Tênis</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div>
        <p className="font-display text-mega text-brand">404</p>
        <p className="mt-2 text-bone/70">Esse par se perdeu. Volte para a vitrine.</p>
        <Link to="/" className="btn-brand mt-8">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
