-- Função para atualizar updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Tabela de artigos para o CMS editorial
create table public.articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  category text not null,
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de administradores
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Índices
create index articles_slug_idx on public.articles(slug);
create index articles_status_idx on public.articles(status);
create index articles_published_at_idx on public.articles (published_at desc) where status = 'published';

-- RLS: Políticas de segurança
alter table public.articles enable row level security;
alter table public.admin_users enable row level security;

-- Leitura pública apenas de artigos publicados
create policy "Artigos publicados são visíveis publicamente"
  on public.articles for select
  using (status = 'published');

-- Apenas admins podem gerenciar artigos
create policy "Admins podem gerenciar artigos"
  on public.articles for all
  using (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users
      where user_id = auth.uid()
    )
  );

-- RLS para admin_users
-- Usuário autenticado pode verificar se é admin (lê apenas sua própria linha)
create policy "Usuário pode verificar se é admin"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

-- Trigger para updated_at
create trigger articles_updated_at
  before update on public.articles
  for each row
  execute procedure public.handle_updated_at();
