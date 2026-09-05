import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ClerkProvider, SignIn, useAuth, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Copy,
  Film,
  FolderHeart,
  Image as ImageIcon,
  Images,
  KeyRound,
  LayoutGrid,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import {
  getGetVaultQueryKey,
  getGetVaultSummaryQueryKey,
  getListAdminUsersQueryKey,
  getListMediaQueryKey,
  useCreateMedia,
  useChangeAdminUserPassword,
  useChangeOwnPassword,
  useCreateAdminUser,
  useDeleteAdminUser,
  useCreateVault,
  useDeleteMedia,
  useGetVault,
  useGetVaultSummary,
  useJoinVault,
  useListMedia,
  useListAdminUsers,
  useRequestUploadUrl,
} from "@workspace/api-client-react";
import type { MediaItem } from "@workspace/api-client-react";
import "./index.css";

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#315f58",
    colorForeground: "#3b302a",
    colorMutedForeground: "#766960",
    colorBackground: "#fbf6ea",
    colorInput: "#f6efdf",
    colorInputForeground: "#3b302a",
    colorDanger: "#b84c43",
    colorNeutral: "#ded2be",
    fontFamily: "DM Sans, sans-serif",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#fbf6ea] rounded-[24px] w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#3b302a] font-semibold",
    headerSubtitle: "text-[#766960]",
    socialButtonsBlockButtonText: "text-[#3b302a]",
    formFieldLabel: "text-[#3b302a]",
    footerActionLink: "text-[#315f58] font-semibold",
    footerActionText: "text-[#766960]",
    dividerText: "text-[#766960]",
    identityPreviewEditButton: "text-[#315f58]",
    formFieldSuccessText: "text-[#315f58]",
    alertText: "text-[#9b3e37]",
    logoBox: "h-14 w-14",
    logoImage: "rounded-2xl",
    socialButtonsBlockButton: "border-[#ded2be] bg-[#f6efdf] hover:bg-[#efe4d0]",
    formButtonPrimary: "bg-[#315f58] text-[#fbf6ea] hover:bg-[#244a45]",
    formFieldInput: "bg-[#f6efdf] border-[#ded2be] text-[#3b302a]",
    footerAction: "border-t border-[#ded2be] pt-5",
    dividerLine: "bg-[#ded2be]",
    alert: "bg-[#f8e2db] border-[#edc4b5]",
    otpCodeFieldInput: "bg-[#f6efdf] border-[#ded2be]",
    formFieldRow: "gap-2",
    main: "gap-5",
  },
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "reveal"}`}>
      <img src={`${basePath}/logo.svg`} alt="" className="h-10 w-10 rounded-xl" />
      <span className="font-display text-[27px] leading-none text-foreground">Memory Vault</span>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previousUser = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (previousUser.current !== undefined && previousUser.current !== userId) client.clear();
      previousUser.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);
  return null;
}

function AuthPage() {
  return (
    <main className="vault-noise relative min-h-[100dvh] overflow-hidden bg-background px-4 py-8 sm:py-14">
      <span className="cute-float pointer-events-none absolute left-[8%] top-[18%] font-display text-5xl text-accent/70" aria-hidden="true">♡</span>
      <span className="cute-float cute-float-delay pointer-events-none absolute right-[10%] top-[28%] text-2xl text-primary/50" aria-hidden="true">✦</span>
      <span className="cute-float pointer-events-none absolute bottom-[18%] right-[16%] font-display text-4xl text-accent/50" aria-hidden="true">♡</span>
      <div className="mx-auto mb-8 flex max-w-[440px] justify-center sm:mb-12">
        <Link href="/" data-testid="link-auth-home"><BrandMark compact /></Link>
      </div>
      <div className="mx-auto flex max-w-[440px] items-center justify-center rounded-[28px] border border-border bg-card p-2 shadow-[0_22px_70px_rgba(72,52,34,.09)]">
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          appearance={{
            elements: {
              footerAction: "!hidden",
              socialButtons: "!hidden",
              divider: "!hidden",
              socialButtonsBlockButton: "!hidden",
            },
          }}
        />
      </div>
      <p className="mt-7 text-center text-xs text-muted-foreground">A private place for the two of you.</p>
    </main>
  );
}

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LandingSkeleton />;
  return isSignedIn ? <Redirect to="/vault" /> : <Redirect to="/sign-in" />;
}

function Landing() {
  return (
    <main className="vault-noise min-h-[100dvh] overflow-hidden bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-10 lg:px-14">
        <BrandMark />
        <nav className="flex items-center gap-2 sm:gap-5">
          <Link href="/sign-in" className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-[#244a45]" data-testid="link-landing-sign-in">Open the vault</Link>
        </nav>
      </header>
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-10 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:px-14 lg:pb-28 lg:pt-28">
        <div className="relative z-10 max-w-2xl">
          <p className="reveal mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.22em] text-primary"><Sparkles className="h-4 w-4" />Just for the two of you</p>
          <h1 className="reveal reveal-2 font-display text-[clamp(4rem,9vw,8.5rem)] leading-[.82] tracking-[-.055em] text-foreground">Keep the<br /><em className="text-primary">good stuff.</em></h1>
          <p className="reveal reveal-3 mt-8 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">A quiet, private home for your photographs and little films. No algorithms. No audience. Just your memories, together.</p>
          <div className="reveal reveal-3 mt-9 flex flex-wrap items-center gap-3">
            <Link href="/sign-in" className="group flex items-center gap-3 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-[#244a45]" data-testid="link-hero-login"><span>Sign in to your space</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            <span className="text-xs text-muted-foreground">Invite-only by design</span>
          </div>
        </div>
        <div className="relative mx-auto h-[480px] w-full max-w-[570px] sm:h-[560px]">
          <div className="absolute left-[4%] top-[10%] h-[72%] w-[62%] rotate-[-7deg] rounded-[5px] bg-[#e5b7a7] p-3 shadow-[0_28px_45px_rgba(85,56,39,.18)] sm:p-4">
            <div className="h-full w-full overflow-hidden bg-[#c18470]"><div className="h-full w-full bg-[radial-gradient(circle_at_48%_32%,#f2c1a6_0_18%,transparent_19%),linear-gradient(145deg,#7a5549_0%,#bf806b_42%,#f0c4a7_43%,#d79a83_100%)] opacity-80" /></div>
            <p className="font-display mt-3 text-lg italic text-[#614840]">somewhere warm</p>
          </div>
          <div className="absolute bottom-[7%] right-[1%] h-[64%] w-[59%] rotate-[8deg] rounded-[5px] bg-[#f1dfb1] p-3 shadow-[0_28px_45px_rgba(85,56,39,.18)] sm:p-4">
            <div className="h-full w-full overflow-hidden bg-[#718b82]"><div className="h-full w-full bg-[linear-gradient(160deg,#d6a88a_0_30%,#6e8e85_31%_61%,#f0cf94_62%_100%)] opacity-85" /></div>
            <p className="font-display mt-3 text-lg italic text-[#6d5a3f]">our little life</p>
          </div>
          <div className="absolute right-[13%] top-[1%] flex h-20 w-20 rotate-[10deg] items-center justify-center rounded-full bg-primary text-center text-[11px] font-semibold uppercase leading-4 tracking-[.12em] text-primary-foreground shadow-lg">only<br />ours</div>
        </div>
      </section>
      <section className="border-y border-border bg-[#eee2cf]/60 px-5 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <div><p className="font-mono text-xs uppercase tracking-[.18em] text-muted-foreground">Why it feels different</p><h2 className="mt-4 max-w-md font-display text-5xl leading-[.92] tracking-[-.03em] text-foreground sm:text-6xl">A room with the door closed.</h2></div>
          <div className="grid gap-8 sm:grid-cols-3">
            <Feature icon={<LockKeyhole />} title="Private, always" copy="Only you and your partner can open the door. Your memories are never public." />
            <Feature icon={<Images />} title="Made for moments" copy="Photos, videos, and the small details you want to find again years from now." />
            <Feature icon={<UsersRound />} title="Two seats" copy="Invite one person. Keep the rest of the internet outside." />
          </div>
        </div>
      </section>
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-20 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:py-28">
        <div><p className="font-mono text-xs uppercase tracking-[.18em] text-muted-foreground">For the ordinary extraordinary</p><p className="mt-4 max-w-xl font-display text-4xl leading-tight sm:text-5xl">The blurry ones. The outtakes. The Tuesday night dinner.</p></div>
        <Link href="/sign-in" className="group flex w-fit items-center gap-3 border-b-2 border-primary pb-2 font-semibold text-primary" data-testid="link-footer-login">Open your memories <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
      </section>
      <footer className="border-t border-border px-5 py-7 sm:px-10 lg:px-14"><div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Memory Vault © 2025</span><span>Built for keeping close.</span></div></footer>
    </main>
  );
}

function Feature({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <div className="space-y-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</div><h3 className="font-semibold text-foreground">{title}</h3><p className="text-sm leading-6 text-muted-foreground">{copy}</p></div>;
}

function LandingSkeleton() {
  return <div className="min-h-[100dvh] animate-pulse bg-background p-8"><div className="mx-auto h-10 max-w-7xl rounded-full bg-muted" /><div className="mx-auto mt-28 max-w-7xl space-y-6"><div className="h-24 max-w-2xl rounded-3xl bg-muted" /><div className="h-5 max-w-md rounded-full bg-muted" /></div></div>;
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LandingSkeleton />;
  return isSignedIn ? children : <Redirect to="/sign-in" />;
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { data: vault } = useGetVault();
  const { signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? user?.username?.[0] ?? ""}`.toUpperCase() || "MV";
  const isAdmin = vault?.members.some((member) => member.isCurrentUser && member.role === "admin") ?? false;
  return (
    <div className="vault-noise flex min-h-[100dvh] bg-background">
      <aside className="hidden w-[250px] shrink-0 flex-col border-r border-border bg-sidebar px-5 py-7 md:flex">
        <Link href="/vault" data-testid="link-sidebar-brand"><BrandMark compact /></Link>
        <div className="mt-14"><p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Your space</p><nav className="space-y-1">
          <NavLink href="/vault" active={location === "/vault"} icon={<LayoutGrid />} label="The vault" testId="link-nav-vault" />
          {isAdmin && <NavLink href="/admin" active={location === "/admin"} icon={<UserPlus />} label="Admin room" testId="link-nav-admin" />}
          <NavLink href="/settings" active={location === "/settings"} icon={<Settings2 />} label="Settings" testId="link-nav-settings" />
        </nav></div>
        <div className="mt-auto rounded-2xl border border-border bg-card/50 p-4"><div className="flex items-center gap-3"><Avatar initials={initials} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{user?.firstName || user?.username || "Your account"}</p><p className="truncate text-xs text-muted-foreground">Member</p></div></div><button onClick={() => signOut({ redirectUrl: basePath || "/" })} className="mt-4 flex w-full items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground" data-testid="button-sidebar-sign-out"><LogOut className="h-4 w-4" /> Sign out</button></div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur-md md:hidden">
          <Link href="/vault" data-testid="link-mobile-brand"><BrandMark compact /></Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl p-2 text-muted-foreground hover:bg-muted" aria-label="Toggle navigation" data-testid="button-mobile-menu">{menuOpen ? <X /> : <Menu />}</button>
        </header>
        {menuOpen && <div className="border-b border-border bg-sidebar px-5 py-4 md:hidden"><nav className="space-y-1"><NavLink href="/vault" active={location === "/vault"} icon={<LayoutGrid />} label="The vault" testId="link-mobile-nav-vault" />{isAdmin && <NavLink href="/admin" active={location === "/admin"} icon={<UserPlus />} label="Admin room" testId="link-mobile-nav-admin" />}<NavLink href="/settings" active={location === "/settings"} icon={<Settings2 />} label="Settings" testId="link-mobile-nav-settings" /></nav></div>}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, active, icon, label, testId }: { href: string; active: boolean; icon: ReactNode; label: string; testId: string }) {
  return <Link href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"}`} data-testid={testId}>{icon}<span>{label}</span></Link>;
}

function Avatar({ initials, large = false }: { initials: string; large?: boolean }) {
  return <div className={`flex shrink-0 items-center justify-center rounded-full bg-[#e3aa94] font-semibold text-[#543f35] ${large ? "h-14 w-14 text-lg" : "h-9 w-9 text-xs"}`} data-testid={`img-avatar-${initials}`}>{initials}</div>;
}

function VaultPage() {
  const { data: vault, isLoading: vaultLoading, isError: vaultError } = useGetVault();
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [search, setSearch] = useState("");
  const [viewer, setViewer] = useState<MediaItem | null>(null);
  const params = useMemo(() => ({ type: filter === "all" ? undefined : filter, search: search.trim() || undefined }), [filter, search]);
  const { data: media, isLoading: mediaLoading, isError: mediaError } = useListMedia(params);
  const { data: summary } = useGetVaultSummary();
  const client = useQueryClient();
  const deleteMedia = useDeleteMedia();
  const [uploadOpen, setUploadOpen] = useState(false);
  const mediaItems = media ?? [];
  const handleDelete = (item: MediaItem) => {
    if (!window.confirm(`Remove ${item.name} from your vault?`)) return;
    deleteMedia.mutate({ id: item.id }, { onSuccess: () => { if (viewer?.id === item.id) setViewer(null); client.invalidateQueries({ queryKey: getListMediaQueryKey(params) }); client.invalidateQueries({ queryKey: getGetVaultSummaryQueryKey() }); } });
  };
  if (vaultLoading) return <VaultLoading />;
  if (vaultError || !vault) return <NoVault />;
  return (
    <>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Your shared space</p><h1 className="mt-2 font-display text-5xl leading-none tracking-[-.04em] text-foreground sm:text-6xl" data-testid="text-vault-name">{vault.name}</h1><p className="mt-3 text-sm text-muted-foreground">{vault.members.length} of 2 members · Started {formatDate(vault.createdAt)}</p></div><button onClick={() => setUploadOpen(true)} className="flex w-fit items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-[#244a45]" data-testid="button-open-upload"><Upload className="h-4 w-4" /> Add memories</button></div>
        <div className="mt-10 grid gap-3 sm:grid-cols-3"><Stat label="Photographs" value={summary?.photoCount ?? mediaItems.filter((m) => m.kind === "image").length} icon={<ImageIcon />} /><Stat label="Little films" value={summary?.videoCount ?? mediaItems.filter((m) => m.kind === "video").length} icon={<Film />} /><Stat label="Kept together" value={formatBytes(summary?.totalBytes ?? mediaItems.reduce((sum, m) => sum + m.sizeBytes, 0))} icon={<FolderHeart />} /></div>
        <div className="mt-12 flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-1 overflow-x-auto"><FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Everything" testId="button-filter-all" /><FilterButton active={filter === "image"} onClick={() => setFilter("image")} label="Photos" testId="button-filter-photos" /><FilterButton active={filter === "video"} onClick={() => setFilter("video")} label="Videos" testId="button-filter-videos" /></div><label className="flex w-full items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground lg:max-w-[280px]"><Search className="h-4 w-4 shrink-0" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent outline-none placeholder:text-muted-foreground" placeholder="Find a memory" type="search" data-testid="input-search-media" /></label></div>
        {mediaLoading ? <MediaGridSkeleton /> : mediaError ? <ErrorState onRetry={() => client.invalidateQueries({ queryKey: getListMediaQueryKey(params) })} /> : mediaItems.length === 0 ? <EmptyVault hasSearch={Boolean(search || filter !== "all")} onUpload={() => setUploadOpen(true)} /> : <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4">{mediaItems.map((item, index) => <MediaCard key={item.id} item={item} index={index} onOpen={() => setViewer(item)} onDelete={() => handleDelete(item)} />)}</div>}
      </div>
      {uploadOpen && <UploadDialog onClose={() => setUploadOpen(false)} />}
      {viewer && <MediaViewer item={viewer} onClose={() => setViewer(null)} onDelete={() => handleDelete(viewer)} />}
    </>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon: ReactNode }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/25 text-primary">{icon}</div><div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold text-foreground" data-testid={`text-stat-${label.toLowerCase().replace(" ", "-")}`}>{value}</p></div></div>;
}

function FilterButton({ active, onClick, label, testId }: { active: boolean; onClick: () => void; label: string; testId: string }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`} data-testid={testId}>{label}</button>;
}

function MediaCard({ item, index, onOpen, onDelete }: { item: MediaItem; index: number; onOpen: () => void; onDelete: () => void }) {
  const [menu, setMenu] = useState(false);
  const url = item.objectPath ? `/api/storage${item.objectPath}` : item.url;
  return <article className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-muted reveal reveal-${Math.min(index % 3 + 1, 3)}`} data-testid={`card-media-${item.id}`}><button onClick={onOpen} className="block w-full text-left" data-testid={`button-open-media-${item.id}`}>{item.kind === "image" ? <img src={url} alt={item.name} loading="lazy" className="block h-auto max-h-[480px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" /> : <div className="relative aspect-[4/5] bg-[#617d75]"><video src={url} muted preload="metadata" className="h-full w-full object-cover" data-testid={`video-preview-${item.id}`} /><div className="absolute inset-0 flex items-center justify-center bg-foreground/10"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-card/90 text-primary shadow-lg"><Play className="ml-0.5 h-5 w-5 fill-current" /></span></div></div>}</button><div className="absolute inset-x-0 bottom-0 flex translate-y-1 items-end justify-between bg-gradient-to-t from-[#2a211d]/75 to-transparent px-3 pb-3 pt-12 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"><div className="min-w-0 text-card"><p className="truncate text-xs font-semibold">{item.name}</p><p className="mt-0.5 text-[10px] opacity-80">{formatDate(item.createdAt)}</p></div><div className="relative"><button onClick={() => setMenu(!menu)} className="rounded-full p-1.5 text-card hover:bg-card/20" aria-label={`More actions for ${item.name}`} data-testid={`button-media-menu-${item.id}`}><MoreHorizontal className="h-4 w-4" /></button>{menu && <div className="absolute bottom-8 right-0 z-10 w-32 rounded-xl border border-border bg-card p-1 text-foreground shadow-xl"><button onClick={onDelete} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-destructive hover:bg-destructive/10" data-testid={`button-delete-media-${item.id}`}><Trash2 className="h-3.5 w-3.5" /> Remove</button></div>}</div></div></article>;
}

function MediaViewer({ item, onClose, onDelete }: { item: MediaItem; onClose: () => void; onDelete: () => void }) {
  const url = item.objectPath ? `/api/storage${item.objectPath}` : item.url;
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#241b18]/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Viewing ${item.name}`} onClick={(e) => e.target === e.currentTarget && onClose()}><div className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#312723] shadow-2xl sm:flex-row"><button onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full bg-card/15 p-2 text-card hover:bg-card/25" aria-label="Close viewer" data-testid="button-close-viewer"><X className="h-5 w-5" /></button><div className="flex min-h-[42vh] flex-1 items-center justify-center bg-[#211a17] sm:min-h-[70vh]">{item.kind === "image" ? <img src={url} alt={item.name} className="max-h-[75vh] max-w-full object-contain" /> : <video src={url} controls autoPlay className="max-h-[75vh] max-w-full" data-testid={`video-viewer-${item.id}`} />}</div><div className="w-full shrink-0 p-6 text-card sm:w-64 sm:p-7"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-card/60">{item.kind === "image" ? "Photograph" : "Little film"}</p><h2 className="mt-3 break-words font-display text-3xl leading-tight">{item.name}</h2><p className="mt-5 text-sm text-card/65">{formatDate(item.createdAt)}<br />{formatBytes(item.sizeBytes)} · by {item.uploadedBy}</p><div className="mt-8 flex flex-wrap gap-2"><a href={url} download={item.name} className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-card/80" data-testid={`link-download-media-${item.id}`}><ArrowDownToLine className="h-4 w-4" /> Download</a><button onClick={onDelete} className="rounded-full border border-card/20 p-2.5 text-card/70 hover:border-[#e9a18c] hover:text-[#e9a18c]" aria-label="Delete this memory" data-testid={`button-viewer-delete-${item.id}`}><Trash2 className="h-4 w-4" /></button></div></div></div></div>;
}

function UploadDialog({ onClose }: { onClose: () => void }) {
  const requestUrl = useRequestUploadUrl();
  const createMedia = useCreateMedia();
  const client = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = async (file: File) => {
    const requested = await requestUrl.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type } });
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", requested.uploadURL);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (event) => { if (event.lengthComputable) setProgress((current) => ({ ...current, [file.name]: Math.round(event.loaded / event.total * 100) })); };
      xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload could not be completed"));
      xhr.onerror = () => reject(new Error("Upload could not be completed"));
      xhr.send(file);
    });
    await createMedia.mutateAsync({ data: { name: file.name, kind: file.type.startsWith("video/") ? "video" : "image", contentType: file.type, sizeBytes: file.size, objectPath: requested.objectPath } });
  };
  const startUpload = async () => {
    if (!files.length || uploading) return;
    setUploading(true); setError("");
    try { for (const file of files) await upload(file); await client.invalidateQueries({ queryKey: getListMediaQueryKey() }); await client.invalidateQueries({ queryKey: getGetVaultSummaryQueryKey() }); onClose(); } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Something went wrong. Please try again."); } finally { setUploading(false); }
  };
  return <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#241b18]/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="upload-title"><div className="w-full max-w-xl rounded-t-[28px] border border-border bg-card p-6 shadow-2xl sm:rounded-[28px] sm:p-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Add to the story</p><h2 id="upload-title" className="mt-2 font-display text-4xl text-foreground">Bring something in.</h2></div><button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Close upload dialog" data-testid="button-close-upload"><X /></button></div><input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} data-testid="input-upload-files" /><button onClick={() => inputRef.current?.click()} className="mt-7 flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-5 text-center hover:bg-primary/10" data-testid="button-choose-files"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/25 text-primary"><Plus /></span><span className="mt-3 text-sm font-semibold text-foreground">{files.length ? `${files.length} ${files.length === 1 ? "file" : "files"} selected` : "Choose photos or videos"}</span><span className="mt-1 text-xs text-muted-foreground">JPG, PNG, HEIC, MP4 and more</span></button>{files.length > 0 && <div className="mt-4 space-y-2">{files.map((file) => <div key={file.name} className="rounded-xl bg-muted px-3 py-2.5"><div className="flex items-center justify-between gap-3 text-xs"><span className="truncate font-semibold text-foreground">{file.name}</span><span className="shrink-0 font-mono text-muted-foreground">{progress[file.name] ?? 0}%</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress[file.name] ?? 0}%` }} /></div></div>)}</div>}{error && <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert" data-testid="status-upload-error">{error}</p>}<div className="mt-7 flex justify-end gap-3"><button onClick={onClose} className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted" data-testid="button-cancel-upload">Cancel</button><button onClick={startUpload} disabled={!files.length || uploading} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-start-upload">{uploading ? "Uploading…" : <><Upload className="h-4 w-4" /> Upload memories</>}</button></div></div></div>;
}

function EmptyVault({ hasSearch, onUpload }: { hasSearch: boolean; onUpload: () => void }) {
  return <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center"><div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-accent/20 text-primary"><Camera className="h-10 w-10" /><span className="absolute right-1 top-0 h-4 w-4 rounded-full bg-accent" /></div><h2 className="mt-7 font-display text-4xl text-foreground">{hasSearch ? "Nothing here yet." : "Start with a favorite."}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{hasSearch ? "Try a different search or filter. Your memories are still safe and sound." : "Add the first little piece of your shared life. It will feel like home in here."}</p>{!hasSearch && <button onClick={onUpload} className="mt-7 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground" data-testid="button-empty-upload"><Upload className="h-4 w-4" /> Add your first memory</button>}</div>;
}

function NoVault() {
  return <div className="flex min-h-[70dvh] items-center justify-center px-5"><div className="max-w-md text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-primary"><LockKeyhole /></div><h1 className="mt-6 font-display text-4xl text-foreground">Your room is waiting.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">This space is private and account access is managed by the admin. Ask them to add your account, then come back here.</p></div></div>;
}

function VaultLoading() {
  return <div className="mx-auto max-w-7xl animate-pulse px-5 py-10 sm:px-8 lg:px-12"><div className="h-4 w-28 rounded bg-muted" /><div className="mt-4 h-16 w-72 rounded-2xl bg-muted" /><div className="mt-10 grid gap-3 sm:grid-cols-3"><div className="h-20 rounded-2xl bg-muted" /><div className="h-20 rounded-2xl bg-muted" /><div className="h-20 rounded-2xl bg-muted" /></div><div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="h-56 rounded-2xl bg-muted" /><div className="h-72 rounded-2xl bg-muted" /><div className="h-64 rounded-2xl bg-muted" /><div className="h-48 rounded-2xl bg-muted" /></div></div>;
}

function MediaGridSkeleton() {
  return <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="h-56 animate-pulse rounded-2xl bg-muted" /><div className="h-72 animate-pulse rounded-2xl bg-muted" /><div className="h-64 animate-pulse rounded-2xl bg-muted" /><div className="h-48 animate-pulse rounded-2xl bg-muted" /></div>;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="mx-auto flex max-w-sm flex-col items-center py-24 text-center"><ShieldCheck className="h-10 w-10 text-destructive" /><h2 className="mt-4 font-display text-3xl text-foreground">A small hiccup.</h2><p className="mt-2 text-sm text-muted-foreground">We couldn’t bring those memories in. Your vault is safe.</p><button onClick={onRetry} className="mt-5 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground" data-testid="button-retry-media">Try again</button></div>;
}

function AdminPage() {
  const { data: accounts, isLoading, isError } = useListAdminUsers();
  const createAccount = useCreateAdminUser();
  const deleteAccount = useDeleteAdminUser();
  const client = useQueryClient();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordUser, setPasswordUser] = useState<{ id: string; name: string } | null>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !username.trim() || password.length < 8) return;
    setError("");
    createAccount.mutate(
      { data: { email: email.trim(), username: username.trim(), password } },
      {
        onSuccess: () => {
          setEmail("");
          setUsername("");
          setPassword("");
          client.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
        },
        onError: () => setError("We couldn’t add that account. It may already exist with different details."),
      },
    );
  };
  const remove = (account: { id: string; name: string }) => {
    if (!window.confirm(`Delete ${account.name || "this account"}? They will lose access to this vault.`)) return;
    deleteAccount.mutate(
      { userId: account.id },
      {
        onSuccess: () => client.invalidateQueries({ queryKey: getListAdminUsersQueryKey() }),
        onError: () => setError("We couldn’t delete that account."),
      },
    );
  };
  return <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Only you can open this room</p><h1 className="mt-2 font-display text-5xl text-foreground sm:text-6xl">Admin room</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Add the one person you trust, update access, and keep your little world tidy.</p></div>
      <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary"><ShieldCheck className="h-4 w-4" /> Admin only</div>
    </div>
    <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <section className="rounded-[24px] border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/25 text-primary"><UserPlus /></div><div><h2 className="font-display text-3xl text-foreground">Add your person</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Create a login or add an existing Clerk account. Only the second seat is available.</p></div></div>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-semibold text-foreground">Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="their@email.com" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" data-testid="input-admin-email" /></label>
          <label className="block text-sm font-semibold text-foreground">Username<input required minLength={3} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="their-username" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" data-testid="input-admin-username" /></label>
          <label className="block text-sm font-semibold text-foreground">Temporary password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" data-testid="input-admin-password" /></label>
          <p className="text-xs leading-5 text-muted-foreground">For an existing account, the password is not replaced. The account simply gets added to this vault.</p>
          {error && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert" data-testid="status-admin-error">{error}</p>}
          <button type="submit" disabled={createAccount.isPending || !email.trim() || !username.trim() || password.length < 8} className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-admin-add-account">{createAccount.isPending ? "Making a seat…" : <><UserPlus className="h-4 w-4" /> Add account</>}</button>
        </form>
      </section>
      <section className="rounded-[24px] border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">The two seats</p><h2 className="mt-2 font-display text-3xl text-foreground">People with a key</h2></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">{accounts?.length ?? 0} / 2</span></div>
        {isLoading ? <div className="mt-7 space-y-3"><div className="h-16 animate-pulse rounded-2xl bg-muted" /><div className="h-16 animate-pulse rounded-2xl bg-muted" /></div> : isError ? <p className="mt-7 text-sm text-destructive">This room is only available to the admin account.</p> : <div className="mt-7 space-y-3">{(accounts ?? []).map((account) => <div key={account.id} className="rounded-2xl border border-border bg-background p-4" data-testid={`card-admin-account-${account.id}`}><div className="flex items-center gap-3"><Avatar initials={(account.name || account.username || "MV").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()} /><div className="min-w-0 flex-1"><p className="truncate font-semibold text-foreground">{account.name || account.username}</p><p className="truncate text-xs text-muted-foreground">{account.email} · @{account.username}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${account.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"}`}>{account.role === "admin" ? "Admin" : "Person"}</span></div><div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3"><button onClick={() => setPasswordUser({ id: account.id, name: account.name || account.username })} className="rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted" data-testid={`button-admin-password-${account.id}`}><KeyRound className="mr-1 inline h-3.5 w-3.5" /> Change password</button>{account.role !== "admin" && <button onClick={() => remove(account)} className="rounded-full px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10" data-testid={`button-admin-delete-${account.id}`}><Trash2 className="mr-1 inline h-3.5 w-3.5" /> Delete account</button>}</div></div>)}</div>}
      </section>
    </div>
    <section className="mt-5 rounded-[24px] border border-border bg-secondary/40 p-6 sm:p-8"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/25 text-primary"><FolderHeart /></div><div><h2 className="font-display text-3xl text-foreground">Storage target</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">This vault is configured around a 100 GB target for photos and videos. Actual capacity depends on the connected App Storage plan; the app never pretends a provider limit is unlimited.</p></div></div></section>
    {passwordUser && <PasswordDialog adminUserId={passwordUser.id} title={`Password for ${passwordUser.name}`} onClose={() => setPasswordUser(null)} />}
  </div>;
}

function PasswordDialog({ adminUserId, title = "Change your password", onClose }: { adminUserId?: string; title?: string; onClose: () => void }) {
  const changeOwn = useChangeOwnPassword();
  const changeAdmin = useChangeAdminUserPassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const busy = changeOwn.isPending || changeAdmin.isPending;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const onSuccess = onClose;
    const onError = () => setError("The password could not be changed. Check the details and try again.");
    if (adminUserId) {
      changeAdmin.mutate({ userId: adminUserId, data: { newPassword } }, { onSuccess, onError });
    } else {
      changeOwn.mutate({ data: { currentPassword, newPassword } }, { onSuccess, onError });
    }
  };
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#241b18]/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="password-title"><form onSubmit={submit} className="w-full max-w-md rounded-t-[28px] border border-border bg-card p-6 shadow-2xl sm:rounded-[28px] sm:p-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">A safer key</p><h2 id="password-title" className="mt-2 font-display text-3xl text-foreground">{title}</h2></div><button type="button" onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Close password dialog"><X /></button></div>{!adminUserId && <label className="mt-7 block text-sm font-semibold text-foreground">Current password<input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary" autoComplete="current-password" data-testid="input-current-password" /></label>}<label className="mt-4 block text-sm font-semibold text-foreground">New password<input required minLength={8} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none focus:border-primary" autoComplete="new-password" data-testid="input-new-password" /></label>{error && <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p>}<div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted">Cancel</button><button type="submit" disabled={busy || newPassword.length < 8 || (!adminUserId && !currentPassword)} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Updating…" : "Update password"}</button></div></form></div>;
}

function JoinPage() {
  const [, setLocation] = useLocation();
  const createVault = useCreateVault();
  const joinVault = useJoinVault();
  const client = useQueryClient();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const busy = createVault.isPending || joinVault.isPending;
  const finish = () => { client.invalidateQueries({ queryKey: getGetVaultQueryKey() }); setLocation("/vault"); };
  const submitCreate = (event: FormEvent) => { event.preventDefault(); if (!name.trim()) return; setError(""); createVault.mutate({ data: { name: name.trim() } }, { onSuccess: finish, onError: () => setError("We couldn’t create that vault. Please try again.") }); };
  const submitJoin = (event: FormEvent) => { event.preventDefault(); if (code.length !== 6) return; setError(""); joinVault.mutate({ data: { inviteCode: code.toUpperCase() } }, { onSuccess: finish, onError: () => setError("That code didn’t work. Check the six characters and try again.") }); };
  return <div className="vault-noise min-h-[100dvh] bg-background px-5 py-7 sm:px-10 sm:py-10"><div className="mx-auto max-w-5xl"><Link href="/vault" data-testid="link-join-back"><BrandMark compact /></Link><div className="mx-auto max-w-2xl py-16 sm:py-24"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">A little setup, then you’re in</p><h1 className="mt-4 font-display text-6xl leading-[.9] tracking-[-.04em] text-foreground sm:text-8xl">Make room<br /><em className="text-primary">for your life.</em></h1><p className="mt-7 max-w-md text-base leading-7 text-muted-foreground">Memory Vault is a shared space with one simple rule: only the two of you get a key.</p>{mode === "choose" && <div className="mt-12 grid gap-3 sm:grid-cols-2"><button onClick={() => setMode("create")} className="group rounded-2xl border border-border bg-card p-6 text-left hover:border-primary" data-testid="button-choose-create"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground"><Plus /></span><span className="mt-6 block text-lg font-semibold text-foreground">Create a new vault</span><span className="mt-2 block text-sm leading-6 text-muted-foreground">Give your shared space a name and invite your person.</span><ArrowRight className="mt-7 h-5 w-5 text-primary transition-transform group-hover:translate-x-1" /></button><button onClick={() => setMode("join")} className="group rounded-2xl border border-border bg-card p-6 text-left hover:border-primary" data-testid="button-choose-join"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/30 text-primary"><KeyRound /></span><span className="mt-6 block text-lg font-semibold text-foreground">Join with a code</span><span className="mt-2 block text-sm leading-6 text-muted-foreground">Enter the six-character invite your partner sent you.</span><ArrowRight className="mt-7 h-5 w-5 text-primary transition-transform group-hover:translate-x-1" /></button></div>}{mode === "create" && <form onSubmit={submitCreate} className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8"><button type="button" onClick={() => setMode("choose")} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground" data-testid="button-back-join-choices"><ArrowLeft className="h-4 w-4" /> Back</button><label className="mt-8 block text-sm font-semibold text-foreground" htmlFor="vault-name">What should you call it?</label><input id="vault-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus placeholder="The good years" className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3.5 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" data-testid="input-vault-name" /><p className="mt-2 text-xs text-muted-foreground">You can always change the feeling later.</p>{error && <p className="mt-4 text-sm text-destructive" role="alert" data-testid="status-join-error">{error}</p>}<button type="submit" disabled={!name.trim() || busy} className="mt-7 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50" data-testid="button-create-vault">{busy ? "Making space…" : <>Create vault <ArrowRight className="h-4 w-4" /></>}</button></form>}{mode === "join" && <form onSubmit={submitJoin} className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8"><button type="button" onClick={() => setMode("choose")} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground" data-testid="button-back-join-choices"><ArrowLeft className="h-4 w-4" /> Back</button><label className="mt-8 block text-sm font-semibold text-foreground" htmlFor="invite-code">Enter your invite code</label><input id="invite-code" value={code} onChange={(e) => setCode(e.target.value.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase())} autoFocus inputMode="text" autoComplete="off" placeholder="A7K2QM" className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-4 font-mono text-2xl uppercase tracking-[.3em] text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary" data-testid="input-invite-code" /><p className="mt-2 text-xs text-muted-foreground">Ask your partner to find it in Settings.</p>{error && <p className="mt-4 text-sm text-destructive" role="alert" data-testid="status-join-error">{error}</p>}<button type="submit" disabled={code.length !== 6 || busy} className="mt-7 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50" data-testid="button-join-vault">{busy ? "Opening the door…" : <>Join vault <ArrowRight className="h-4 w-4" /></>}</button></form>}</div></div></div>;
}

function SettingsPage() {
  const { data: vault, isLoading, isError } = useGetVault();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [copied, setCopied] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const current = vault?.members.find((member) => member.isCurrentUser);
  const partner = vault?.members.find((member) => !member.isCurrentUser);
  const copyCode = async () => { if (!vault) return; await navigator.clipboard?.writeText(vault.inviteCode); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  if (isLoading) return <SettingsLoading />;
  if (isError || !vault) return <NoVault />;
  return <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Keep things close</p><h1 className="mt-2 font-display text-5xl text-foreground sm:text-6xl">Settings</h1><p className="mt-3 text-sm text-muted-foreground">Your account and the people who have the key.</p></div><section className="mt-10"><SectionTitle icon={<UsersRound />} title="The two seats" copy="Your vault is intentionally small." /><div className="mt-4 grid gap-3 sm:grid-cols-2"><MemberCard member={current} fallbackName={user?.firstName || user?.username || "You"} current /><MemberCard member={partner} fallbackName="Waiting for your person" /></div></section><section className="mt-12"><SectionTitle icon={<KeyRound />} title="Invite your person" copy="Share this code privately. It opens only this vault." /><div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="font-mono text-3xl tracking-[.24em] text-primary" data-testid="text-invite-code">{vault.inviteCode}</p><p className="mt-2 text-xs text-muted-foreground">Six characters · single shared space</p></div><button onClick={copyCode} className="flex w-fit items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground" data-testid="button-copy-invite-code">{copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy code"}</button></div></section><section className="mt-12"><SectionTitle icon={<UserRound />} title="Your account" copy="Managed securely by Clerk." /><div className="mt-4 rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-4"><Avatar initials={`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? user?.username?.[0] ?? ""}`.toUpperCase() || "MV"} large /><div><p className="font-semibold text-foreground" data-testid="text-account-name">{user?.fullName || user?.username || "Your account"}</p><p className="mt-1 text-sm text-muted-foreground" data-testid="text-account-email">{user?.primaryEmailAddress?.emailAddress || "Email verified with Clerk"}</p></div></div><div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row"><button onClick={() => setPasswordOpen(true)} className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" data-testid="button-change-own-password"><KeyRound className="h-4 w-4" /> Change password</button><button onClick={() => openUserProfile()} className="flex items-center justify-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground" data-testid="button-manage-account"><Settings2 className="h-4 w-4" /> Manage account</button><button onClick={() => signOut({ redirectUrl: basePath || "/" })} className="flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" data-testid="button-settings-sign-out"><LogOut className="h-4 w-4" /> Sign out</button></div></div></section><section className="mt-12 border-t border-border pt-8"><p className="text-sm text-muted-foreground">Need a hand? <a href="mailto:hello@memoryvault.example" className="font-semibold text-primary hover:underline" data-testid="link-support-email">Write to our support team</a>.</p></section>{passwordOpen && <PasswordDialog onClose={() => setPasswordOpen(false)} />}</div>;
}

function SectionTitle({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <div className="flex items-start gap-3"><div className="mt-0.5 text-primary">{icon}</div><div><h2 className="font-display text-3xl text-foreground">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{copy}</p></div></div>;
}

function MemberCard({ member, fallbackName, current = false }: { member?: { name: string; email: string }; fallbackName: string; current?: boolean }) {
  const initials = member?.name ? member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "?";
  return <div className={`rounded-2xl border p-5 ${member ? "border-border bg-card" : "border-dashed border-border bg-muted/30"}`} data-testid={`card-member-${current ? "current" : "partner"}`}><div className="flex items-center gap-3">{member ? <Avatar initials={initials} /> : <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-muted-foreground text-muted-foreground"><Plus className="h-4 w-4" /></div>}<div className="min-w-0"><p className="font-semibold text-foreground">{member?.name || fallbackName}</p><p className="truncate text-xs text-muted-foreground">{member?.email || "Invite them with your code"}</p></div>{current && <span className="ml-auto rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">You</span>}</div></div>;
}

function SettingsLoading() {
  return <div className="mx-auto max-w-4xl animate-pulse px-5 py-10 sm:px-8 lg:px-12"><div className="h-4 w-28 rounded bg-muted" /><div className="mt-4 h-14 w-48 rounded-2xl bg-muted" /><div className="mt-12 h-48 rounded-2xl bg-muted" /><div className="mt-5 h-32 rounded-2xl bg-muted" /></div>;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(new Date(date));
}

function Router() {
  return <Switch><Route path="/" component={HomeRedirect} /><Route path="/sign-in/*?" component={AuthPage} /><Route path="/sign-up/*?" component={() => <Redirect to="/sign-in" />} /><Route path="/admin" component={() => <PrivateRoute><AppShell><AdminPage /></AppShell></PrivateRoute>} /><Route path="/join" component={() => <Redirect to="/vault" />} /><Route path="/vault" component={() => <PrivateRoute><AppShell><VaultPage /></AppShell></PrivateRoute>} /><Route path="/settings" component={() => <PrivateRoute><AppShell><SettingsPage /></AppShell></PrivateRoute>} /><Route component={() => <Redirect to="/" />} /></Switch>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} localization={{ signIn: { start: { title: "Welcome back", subtitle: "Your memories are waiting." } }, signUp: { start: { title: "Make your place", subtitle: "A private space for the two of you." } } }} routerPush={(to) => setLocation(stripBase(to))} routerReplace={(to) => setLocation(stripBase(to), { replace: true })}><QueryClientProvider client={queryClient}><ClerkQueryClientCacheInvalidator /><Router /></QueryClientProvider></ClerkProvider>;
}

function App() {
  return <WouterRouter base={basePath}><ClerkProviderWithRoutes /></WouterRouter>;
}

export default App;