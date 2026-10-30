-- SETUP FILE ONLY. Review before applying to a NEW Supabase project.
-- This file is not run by installation, build, or Netlify deployment.
begin;

create table public.settings (
  id text primary key check (id = 'store'),
  value jsonb not null default '{}'::jsonb
);
insert into public.settings(id) values ('store');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text not null,
  shape text not null,
  length text not null,
  style text not null,
  included text not null default '',
  images text[] not null default '{}',
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  size text not null,
  price_cents integer check (price_cents between 50 and 1000000),
  stock integer not null default 0 check (stock between 0 and 100000),
  revision integer not null default 0,
  unique(product_id, size)
);
create index variants_product_idx on public.variants(product_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','expired')),
  fulfillment_status text not null default 'new' check (fulfillment_status in ('new','preparing','ready','shipped','collected')),
  fulfillment text not null check (fulfillment in ('shipping','pickup')),
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer check (total_cents >= 0),
  stripe_session_id text unique,
  customer_details jsonb,
  shipping_details jsonb,
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  variant_id uuid not null references public.variants(id) on delete restrict,
  name text not null,
  size text not null,
  quantity integer not null check (quantity between 1 and 10),
  unit_price integer not null check (unit_price between 50 and 1000000),
  unique(order_id, variant_id)
);
create index order_items_order_idx on public.order_items(order_id);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  token_hash text not null,
  kind text not null check (kind in ('custom','contact')),
  name text not null,
  email text not null,
  details jsonb not null,
  photos text[] not null default '{}',
  status text not null default 'received' check (status in ('received','reviewing','quoted','agreed','creating','completed','closed')),
  created_at timestamptz not null default now()
);
create index inquiries_created_idx on public.inquiries(created_at desc);
create index orders_created_idx on public.orders(created_at desc);
create table public.rate_limits (key text primary key, attempts integer not null, window_start timestamptz not null);
create table public.webhook_events (id text primary key, processed_at timestamptz not null default now());

-- There are deliberately no anonymous/authenticated policies. All database access
-- passes through validated server endpoints. Owner authorization is checked there.
alter table public.settings enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inquiries enable row level security;
alter table public.rate_limits enable row level security;
alter table public.webhook_events enable row level security;
revoke all on public.settings,public.products,public.variants,public.orders,public.order_items,public.inquiries,public.rate_limits,public.webhook_events from anon, authenticated;
grant all on public.settings,public.products,public.variants,public.orders,public.order_items,public.inquiries,public.rate_limits,public.webhook_events to service_role;

create function public.check_rate_limit(p_key text, p_limit integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_attempts integer;
begin
  insert into public.rate_limits(key, attempts, window_start) values (p_key, 1, now())
  on conflict (key) do update set
    attempts = case when public.rate_limits.window_start < now() - interval '1 hour' then 1 else public.rate_limits.attempts + 1 end,
    window_start = case when public.rate_limits.window_start < now() - interval '1 hour' then now() else public.rate_limits.window_start end
  returning attempts into current_attempts;
  return current_attempts <= p_limit;
end;
$$;

create function public.save_product(p_product jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  product_id uuid := coalesce((p_product->>'id')::uuid, gen_random_uuid());
  entry jsonb; variant_id uuid; updated_id uuid;
begin
  -- Existing sizes must be retained for order history and reservation restoration.
  if exists(select 1 from public.variants v where v.product_id = save_product.product_id and not exists (
    select 1 from jsonb_array_elements(p_product->'variants') e where e->>'id' = v.id::text
  )) then raise exception 'Keep existing sizes; set stock to zero to retire them.'; end if;
  insert into public.products(id,slug,name,description,shape,length,style,included,images,published,featured)
  values(product_id,p_product->>'slug',p_product->>'name',p_product->>'description',p_product->>'shape',p_product->>'length',p_product->>'style',p_product->>'included',
    array(select jsonb_array_elements_text(p_product->'images')),(p_product->>'published')::boolean,(p_product->>'featured')::boolean)
  on conflict(id) do update set slug=excluded.slug,name=excluded.name,description=excluded.description,shape=excluded.shape,length=excluded.length,style=excluded.style,included=excluded.included,images=excluded.images,published=excluded.published,featured=excluded.featured;
  for entry in select value from jsonb_array_elements(p_product->'variants') order by value->>'id' loop
    variant_id := (entry->>'id')::uuid;
    if variant_id is null then
      insert into public.variants(product_id,size,price_cents,stock)
      values(product_id,entry->>'size',(entry->>'price_cents')::integer,(entry->>'stock')::integer);
    else
      updated_id := null;
      update public.variants v set size=entry->>'size',price_cents=(entry->>'price_cents')::integer,stock=(entry->>'stock')::integer,revision=v.revision+1
      where v.id=variant_id and v.product_id=save_product.product_id and v.revision=(entry->>'revision')::integer returning v.id into updated_id;
      if updated_id is null then raise exception 'Inventory changed while editing. Refresh the studio before saving.'; end if;
    end if;
  end loop;
  return product_id;
end;
$$;

create function public.reserve_order(p_items jsonb, p_email text, p_fulfillment text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  store jsonb; shipping integer; order_id uuid; entry jsonb; item record;
  qty integer; subtotal integer := 0; line_items jsonb := '[]'::jsonb;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 30 then raise exception 'Invalid bag.'; end if;
  if (select count(*) from jsonb_array_elements(p_items)) <> (select count(distinct value->>'variant_id') from jsonb_array_elements(p_items)) then raise exception 'Duplicate bag items.'; end if;
  select value into store from public.settings where id='store' for share;
  if not coalesce((store->>'payments_enabled')::boolean,false) then raise exception 'Checkout unavailable.'; end if;
  if p_fulfillment='shipping' and coalesce((store->>'shipping_enabled')::boolean,false) and store->>'shipping_cents' is not null then
    shipping := (store->>'shipping_cents')::integer;
  elsif p_fulfillment='pickup' and coalesce((store->>'pickup_enabled')::boolean,false) then shipping := 0;
  else raise exception 'Fulfillment unavailable.'; end if;
  insert into public.orders(email,fulfillment,shipping_cents) values(p_email,p_fulfillment,shipping) returning id into order_id;
  -- Stable lock order prevents two simultaneous checkouts from overselling.
  for entry in select value from jsonb_array_elements(p_items) order by value->>'variant_id' loop
    qty := (entry->>'quantity')::integer;
    if qty is null or qty < 1 or qty > 10 then raise exception 'Invalid quantity.'; end if;
    select v.id,v.stock,v.size,v.price_cents,p.name,p.published into item
    from public.variants v join public.products p on p.id=v.product_id
    where v.id=(entry->>'variant_id')::uuid for update of v for share of p;
    if not found or not item.published or item.price_cents is null or item.stock < qty then raise exception 'Set unavailable.'; end if;
    update public.variants set stock=stock-qty,revision=revision+1 where id=item.id;
    insert into public.order_items(order_id,variant_id,name,size,quantity,unit_price) values(order_id,item.id,item.name,item.size,qty,item.price_cents);
    subtotal := subtotal + item.price_cents * qty;
    line_items := line_items || jsonb_build_array(jsonb_build_object('name',item.name,'size',item.size,'quantity',qty,'unit_price',item.price_cents));
  end loop;
  update public.orders set subtotal_cents=subtotal where id=order_id;
  return jsonb_build_object('id',order_id,'items',line_items,'subtotal_cents',subtotal,'shipping_cents',shipping);
end;
$$;

create function public.process_payment_event(p_event text,p_order uuid,p_session text,p_paid boolean,p_subtotal bigint,p_shipping bigint,p_total bigint,p_currency text,p_customer jsonb,p_shipping_details jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_order public.orders%rowtype; item record;
begin
  select * into current_order from public.orders where id=p_order for update;
  if not found then raise exception 'Order not found.'; end if;
  if exists(select 1 from public.webhook_events where id=p_event) then return false; end if;
  if current_order.stripe_session_id is not null and current_order.stripe_session_id <> p_session then raise exception 'Session mismatch.'; end if;
  if p_paid then
    if current_order.payment_status='expired' then raise exception 'Expired reservation requires reconciliation.'; end if;
    if p_currency is distinct from 'usd' or p_subtotal is distinct from current_order.subtotal_cents::bigint or p_shipping is distinct from current_order.shipping_cents::bigint or p_total is null or p_total < p_subtotal+p_shipping then raise exception 'Payment amount mismatch.'; end if;
    update public.orders set payment_status='paid',stripe_session_id=p_session,total_cents=p_total,customer_details=p_customer,shipping_details=p_shipping_details where id=p_order;
  elsif current_order.payment_status='pending' then
    for item in select variant_id,quantity from public.order_items where order_id=p_order order by variant_id loop
      update public.variants set stock=stock+item.quantity,revision=revision+1 where id=item.variant_id;
    end loop;
    update public.orders set payment_status='expired',stripe_session_id=p_session where id=p_order;
  end if;
  insert into public.webhook_events(id) values(p_event);
  return true;
end;
$$;

revoke all on function public.check_rate_limit(text,integer) from public,anon,authenticated;
revoke all on function public.save_product(jsonb) from public,anon,authenticated;
revoke all on function public.reserve_order(jsonb,text,text) from public,anon,authenticated;
revoke all on function public.process_payment_event(text,uuid,text,boolean,bigint,bigint,bigint,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.check_rate_limit(text,integer) to service_role;
grant execute on function public.save_product(jsonb) to service_role;
grant execute on function public.reserve_order(jsonb,text,text) to service_role;
grant execute on function public.process_payment_event(text,uuid,text,boolean,bigint,bigint,bigint,text,jsonb,jsonb) to service_role;

-- Public catalog photos are intentionally readable. Custom references stay private.
-- No client role can upload, replace, list, or delete files in either bucket.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('product-photos','product-photos',true,3145728,array['image/webp']),
       ('inquiry-photos','inquiry-photos',false,3145728,array['image/webp']);
commit;
