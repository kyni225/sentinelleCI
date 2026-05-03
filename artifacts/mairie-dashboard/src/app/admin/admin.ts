import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService, Signalement } from '../firebase.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <!-- Barre supérieure -->
      <header class="header">
        <div class="header-left">
          <img src="/icon.png" class="logo-img" alt="SentinelleCI" />
          <div>
            <h1>SentinelleCI</h1>
            <span class="header-sub">Tableau de bord communal</span>
          </div>
        </div>
        <div class="header-right">
          <span class="badge live">
            <span class="pulse-dot"></span>
            LIVE
          </span>
          <span class="header-user">Mairie de Yopougon</span>
          <button class="btn-logout" (click)="logout()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Déconnexion
          </button>
        </div>
      </header>

      <!-- Statistiques -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon total-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ signalements.length }}</div>
            <div class="stat-label">Total signalements</div>
          </div>
        </div>
        <div class="stat-card soumis">
          <div class="stat-icon soumis-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ countStatus('soumis') }}</div>
            <div class="stat-label">En attente</div>
          </div>
        </div>
        <div class="stat-card en_cours">
          <div class="stat-icon encours-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ countStatus('en_cours') }}</div>
            <div class="stat-label">En cours</div>
          </div>
        </div>
        <div class="stat-card resolu">
          <div class="stat-icon resolu-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ countStatus('resolu') }}</div>
            <div class="stat-label">Résolus</div>
          </div>
        </div>
        <div class="stat-card p1">
          <div class="stat-icon p1-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ countPriority('P1') }}</div>
            <div class="stat-label">Urgences P1</div>
          </div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters">
        <div class="filter-group">
          <label>Statut</label>
          <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()">
            <option value="">Tous</option>
            <option value="soumis">Soumis</option>
            <option value="valide">Validé</option>
            <option value="en_cours">En cours</option>
            <option value="resolu">Résolu</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Priorité</label>
          <select [(ngModel)]="filterPriority" (ngModelChange)="applyFilter()">
            <option value="">Toutes</option>
            <option value="P1">P1 — Urgent</option>
            <option value="P2">P2 — Important</option>
          </select>
        </div>
        <div class="filter-group search-group">
          <label>Recherche</label>
          <div class="search-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input [(ngModel)]="searchText" (ngModelChange)="applyFilter()" placeholder="Quartier, catégorie, description..." class="search" />
          </div>
        </div>
      </div>

      <!-- Résultat count -->
      <div class="result-count" *ngIf="filtered.length > 0">
        {{ filtered.length }} signalement{{ filtered.length > 1 ? 's' : '' }} trouvé{{ filtered.length > 1 ? 's' : '' }}
      </div>

      <!-- Liste des signalements -->
      <div class="list">
        <div *ngIf="filtered.length === 0" class="empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p>Aucun signalement pour le moment</p>
          <span>Les nouveaux signalements apparaîtront ici en temps réel.</span>
        </div>

        <div *ngFor="let s of filtered" class="card" [ngClass]="s.status">
          <div class="card-top">
            <div class="card-top-left">
              <img *ngIf="s.photoUris.length > 0" [src]="s.photoUris[0]" class="card-thumb" />
              <div *ngIf="!s.photoUris.length" class="card-icon-wrap" [style.backgroundColor]="categoryHue(s.category) + '22'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" [attr.stroke]="categoryHue(s.category)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div class="card-title-area">
                <div class="card-title-row">
                  <span class="number">#{{ s.number }}</span>
                  <span class="category">{{ categoryLabel(s.category) }}</span>
                  <span class="priority" *ngIf="s.ai.priority !== 'P3'" [ngClass]="'prio-' + s.ai.priority">{{ s.ai.priority }}</span>
                  <span class="status-badge" [ngClass]="'status-' + s.status">{{ statusLabel(s.status) }}</span>
                </div>
                <span class="time">{{ timeAgo(s.createdAt) }} · {{ s.isAnonymous ? 'Citoyen anonyme' : s.authorPseudo }}</span>
              </div>
            </div>
          </div>

          <p class="desc">{{ s.description }}</p>

          <div class="card-details">
            <div class="detail">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{{ s.quartier }}{{ s.address ? ' — ' + s.address : '' }}</span>
            </div>
            <div class="detail">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              <span>{{ s.upvotes }} soutien{{ s.upvotes > 1 ? 's' : '' }}</span>
            </div>
            <div class="detail" *ngIf="s.ai.severity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>IA : {{ s.ai.severity }}</span>
            </div>
          </div>

          <div class="card-actions">
            <div class="action-status">
              <label>Statut :</label>
              <select [ngModel]="s.status" (ngModelChange)="changeStatus(s.id, $event)" [ngClass]="'sel-' + s.status">
                <option value="soumis">Soumis</option>
                <option value="valide">Validé</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
              </select>
            </div>
            <button class="btn-upvote" (click)="upvote(s.id)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              Soutenir
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { min-height: 100vh; background: #FAFAF7; color: #0F1B2D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 960px; margin: 0 auto; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: #FFFFFF; border-bottom: 1px solid #E5DCC9; position: sticky; top: 0; z-index: 50; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .logo-img { width: 40px; height: 40px; border-radius: 12px; }
    .header-left h1 { font-size: 20px; margin: 0; font-weight: 700; letter-spacing: 0.3px; color: #006B3F; }
    .header-sub { font-size: 13px; color: #6B7785; }
    .header-right { display: flex; align-items: center; gap: 14px; }
    .header-user { font-size: 14px; color: #0F1B2D; font-weight: 500; }
    .badge.live { background: #DC262615; color: #DC2626; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 6px; border: 1px solid #DC262630; }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #DC2626; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .btn-logout { background: #EFE9DD; color: #006B3F; border: 1px solid #E5DCC9; padding: 9px 16px; border-radius: 12px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px; transition: all 0.2s; font-weight: 600; }
    .btn-logout:hover { background: #006B3F; color: #FFFFFF; border-color: #006B3F; }

    /* Stats */
    .stats-row { display: flex; gap: 14px; padding: 24px; overflow-x: auto; }
    .stat-card { background: #FFFFFF; border-radius: 16px; padding: 18px 20px; min-width: 160px; display: flex; align-items: center; gap: 14px; border: 1px solid #E5DCC9; transition: transform 0.2s, box-shadow 0.2s; }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .stat-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .total-icon { background: #006B3F15; color: #006B3F; }
    .soumis-icon { background: #F59E0B20; color: #F59E0B; }
    .encours-icon { background: #006B3F15; color: #006B3F; }
    .resolu-icon { background: #006B3F15; color: #006B3F; }
    .p1-icon { background: #DC262615; color: #DC2626; }
    .stat-info { flex: 1; }
    .stat-num { font-size: 28px; font-weight: 800; line-height: 1; color: #0F1B2D; }
    .stat-label { font-size: 13px; color: #6B7785; margin-top: 4px; font-weight: 500; }
    .stat-card.soumis .stat-num { color: #F59E0B; }
    .stat-card.en_cours .stat-num { color: #006B3F; }
    .stat-card.resolu .stat-num { color: #006B3F; }
    .stat-card.p1 .stat-num { color: #DC2626; }

    /* Filters */
    .filters { display: flex; gap: 12px; padding: 0 24px 16px; flex-wrap: wrap; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; gap: 6px; }
    .filter-group label { font-size: 12px; color: #6B7785; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    select, .search { background: #FFFFFF; border: 1px solid #E5DCC9; color: #0F1B2D; padding: 10px 14px; border-radius: 12px; font-size: 15px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
    select:focus, .search:focus { border-color: #006B3F; box-shadow: 0 0 0 3px #006B3F15; }
    .search-group { flex: 1; min-width: 240px; }
    .search-wrap { position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
    .search { padding-left: 38px; width: 100%; box-sizing: border-box; }

    /* Result count */
    .result-count { padding: 0 24px; font-size: 14px; color: #6B7785; margin-bottom: 10px; font-weight: 500; }

    /* List */
    .list { padding: 0 24px 24px; display: flex; flex-direction: column; gap: 14px; }
    .empty { text-align: center; color: #6B7785; padding: 80px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .empty p { font-size: 18px; font-weight: 700; color: #0F1B2D; margin: 0; }
    .empty span { font-size: 14px; color: #6B7785; }

    /* Card */
    .card { background: #FFFFFF; border-radius: 16px; padding: 18px; border-left: 4px solid #E5DCC9; border-top: 1px solid #E5DCC9; border-right: 1px solid #E5DCC9; border-bottom: 1px solid #E5DCC9; transition: transform 0.2s, box-shadow 0.2s; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
    .card.soumis { border-left-color: #F59E0B; }
    .card.valide { border-left-color: #006B3F; }
    .card.en_cours { border-left-color: #006B3F; }
    .card.resolu { border-left-color: #006B3F; }

    .card-top { margin-bottom: 12px; }
    .card-top-left { display: flex; align-items: center; gap: 12px; }
    .card-thumb { width: 52px; height: 52px; border-radius: 14px; object-fit: cover; background: #F1ECE0; }
    .card-icon-wrap { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .card-title-area { flex: 1; }
    .card-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .number { font-weight: 700; font-size: 16px; color: #0F1B2D; }
    .category { background: #F1ECE0; padding: 4px 12px; border-radius: 10px; font-size: 13px; font-weight: 600; color: #006B3F; }
    .priority { padding: 4px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; }
    .prio-P1 { background: #DC2626; color: white; }
    .prio-P2 { background: #F59E0B; color: #0F1B2D; }
    .status-badge { padding: 4px 12px; border-radius: 10px; font-size: 12px; font-weight: 600; }
    .status-soumis { background: #F59E0B20; color: #F59E0B; border: 1px solid #F59E0B30; }
    .status-valide { background: #006B3F15; color: #006B3F; border: 1px solid #006B3F30; }
    .status-en_cours { background: #006B3F15; color: #006B3F; border: 1px solid #006B3F30; }
    .status-resolu { background: #006B3F15; color: #006B3F; border: 1px solid #006B3F30; }
    .time { font-size: 13px; color: #6B7785; white-space: nowrap; }

    .desc { color: #0F1B2D; font-size: 15px; margin: 0 0 14px; line-height: 1.6; }

    .card-details { display: flex; gap: 20px; font-size: 13px; color: #6B7785; flex-wrap: wrap; }
    .detail { display: flex; align-items: center; gap: 6px; }

    .card-actions { display: flex; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5DCC9; align-items: center; }
    .action-status { display: flex; align-items: center; gap: 10px; }
    .action-status label { font-size: 13px; color: #6B7785; font-weight: 600; }
    .card-actions select { font-size: 14px; padding: 9px 14px; border-radius: 10px; }
    .sel-soumis { border-left: 3px solid #F59E0B; }
    .sel-valide { border-left: 3px solid #006B3F; }
    .sel-en_cours { border-left: 3px solid #006B3F; }
    .sel-resolu { border-left: 3px solid #006B3F; }
    .btn-upvote { background: #FF6700; color: #FFFFFF; border: 1px solid #FF6700; padding: 9px 16px; border-radius: 10px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px; transition: all 0.2s; font-weight: 600; }
    .btn-upvote:hover { background: #E15800; border-color: #E15800; }
  `],
})
export class AdminComponent implements OnInit, OnDestroy {
  signalements: Signalement[] = [];
  filtered: Signalement[] = [];
  filterStatus = '';
  filterPriority = '';
  searchText = '';
  unsub: (() => void) | null = null;

  private categoryMap: Record<string, string> = {
    routes: 'Routes', eclairage: 'Éclairage', eau: 'Eau', ecoles: 'Écoles',
    dechets: 'Déchets', sante: 'Santé', securite: 'Sécurité', transport: 'Transport',
    logement: 'Logement', pollution: 'Pollution', inondation: 'Inondation',
    nuisances: 'Nuisances', voirie: 'Voirie', autre: 'Autre'
  };

  private categoryHues: Record<string, string> = {
    routes: '#1E3A5F', eclairage: '#F59E0B', eau: '#0EA5E9', ecoles: '#7C3AED',
    dechets: '#16A34A', sante: '#DC2626', securite: '#475569', transport: '#0891B2',
    logement: '#A855F7', pollution: '#6B7280', inondation: '#2563EB',
    nuisances: '#EA580C', voirie: '#CA8A04', autre: '#9333EA'
  };

  constructor(private fb: FirebaseService, private router: Router) {}

  ngOnInit() {
    if (!this.fb.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.unsub = this.fb.onSignalements((list) => {
      this.signalements = list;
      this.applyFilter();
    });
  }

  ngOnDestroy() {
    this.unsub?.();
  }

  applyFilter() {
    this.filtered = this.signalements.filter((s) => {
      if (this.filterStatus && s.status !== this.filterStatus) return false;
      if (this.filterPriority && s.ai.priority !== this.filterPriority) return false;
      if (this.searchText) {
        const q = this.searchText.toLowerCase();
        return s.description.toLowerCase().includes(q)
          || s.quartier.toLowerCase().includes(q)
          || s.number.toLowerCase().includes(q)
          || s.category.toLowerCase().includes(q)
          || (s.address && s.address.toLowerCase().includes(q));
      }
      return true;
    });
  }

  countStatus(status: string) {
    return this.signalements.filter((s) => s.status === status).length;
  }

  countPriority(priority: string) {
    return this.signalements.filter((s) => s.ai.priority === priority).length;
  }

  statusLabel(s: string) {
    const map: Record<string, string> = { soumis: 'Soumis', valide: 'Validé', en_cours: 'En cours', resolu: 'Résolu' };
    return map[s] ?? s;
  }

  categoryLabel(c: string) {
    return this.categoryMap[c] ?? c ?? 'Autre';
  }

  categoryHue(c: string) {
    return this.categoryHues[c] ?? '#9333EA';
  }

  timeAgo(ts: number) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "à l'instant";
    if (mins < 60) return 'il y a ' + mins + ' min';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return 'il y a ' + hours + ' h';
    const days = Math.floor(hours / 24);
    return 'il y a ' + days + ' j';
  }

  async changeStatus(id: string, status: string) {
    await this.fb.updateStatus(id, status);
  }

  async upvote(id: string) {
    await this.fb.upvote(id);
  }

  async logout() {
    await this.fb.logout();
    this.router.navigate(['/login']);
  }
}
