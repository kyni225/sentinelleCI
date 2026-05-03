import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService, Signalement } from '../firebase.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <img src="/icon.png" class="logo-img" alt="SentinelleCI" />
          <div>
            <h1>SentinelleCI</h1>
            <span class="header-sub">Tableau de bord communal</span>
          </div>
        </div>
        <div class="header-right">
          <span class="badge live"><span class="pulse-dot"></span> LIVE</span>
          <span class="header-user">Mairie de Yopougon</span>
          <button class="btn-logout" (click)="logout()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Déconnexion
          </button>
        </div>
      </header>

      <!-- Tabs -->
      <nav class="tabs">
        <button [class.active]="tab==='dashboard'" (click)="switchTab('dashboard')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Tableau de bord
        </button>
        <button [class.active]="tab==='map'" (click)="switchTab('map')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          Carte
        </button>
        <button [class.active]="tab==='profile'" (click)="switchTab('profile')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Profil
        </button>
      </nav>

      <!-- ===== DASHBOARD TAB ===== -->
      <div *ngIf="tab==='dashboard'">
        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon total-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            <div class="stat-info"><div class="stat-num">{{ signalements.length }}</div><div class="stat-label">Total</div></div>
          </div>
          <div class="stat-card soumis">
            <div class="stat-icon soumis-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <div class="stat-info"><div class="stat-num">{{ countStatus('soumis') }}</div><div class="stat-label">En attente</div></div>
          </div>
          <div class="stat-card en_cours">
            <div class="stat-icon encours-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></div>
            <div class="stat-info"><div class="stat-num">{{ countStatus('en_cours') }}</div><div class="stat-label">En cours</div></div>
          </div>
          <div class="stat-card resolu">
            <div class="stat-icon resolu-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <div class="stat-info"><div class="stat-num">{{ countStatus('resolu') }}</div><div class="stat-label">Résolus</div></div>
          </div>
          <div class="stat-card p1">
            <div class="stat-icon p1-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
            <div class="stat-info"><div class="stat-num">{{ countPriority('P1') }}</div><div class="stat-label">Urgences</div></div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Statut</label>
            <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()">
              <option value="">Tous</option><option value="soumis">Soumis</option><option value="valide">Validé</option><option value="en_cours">En cours</option><option value="resolu">Résolu</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Priorité</label>
            <select [(ngModel)]="filterPriority" (ngModelChange)="applyFilter()">
              <option value="">Toutes</option><option value="P1">P1</option><option value="P2">P2</option>
            </select>
          </div>
          <div class="filter-group search-group">
            <label>Recherche</label>
            <div class="search-wrap">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input [(ngModel)]="searchText" (ngModelChange)="applyFilter()" placeholder="Quartier, catégorie..." class="search" />
            </div>
          </div>
        </div>

        <div class="result-count" *ngIf="filtered.length > 0">
          {{ filtered.length }} signalement{{ filtered.length > 1 ? 's' : '' }}
        </div>

        <!-- List -->
        <div class="list">
          <div *ngIf="filtered.length === 0" class="empty">
            <p>Aucun signalement</p>
            <span>Les nouveaux signalements apparaîtront ici en temps réel.</span>
          </div>

          <div *ngFor="let s of filtered" class="card" [ngClass]="s.status" (click)="openDetail(s)">
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
            </div>
            <div class="card-actions" (click)="$event.stopPropagation()">
              <div class="action-status">
                <label>Statut :</label>
                <select [ngModel]="s.status" (ngModelChange)="changeStatus(s.id, $event)" [ngClass]="'sel-' + s.status">
                  <option value="soumis">Soumis</option><option value="valide">Validé</option><option value="en_cours">En cours</option><option value="resolu">Résolu</option>
                </select>
              </div>
              <button class="btn-upvote" (click)="upvote(s.id)">Soutenir</button>
              <button class="btn-map" (click)="openDetail(s); switchTab('map')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Voir sur carte
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== MAP TAB ===== -->
      <div *ngIf="tab==='map'" class="map-container">
        <div #globalMap class="map-el"></div>
      </div>

      <!-- ===== PROFILE TAB ===== -->
      <div *ngIf="tab==='profile'" class="profile-section">
        <div class="profile-card">
          <div class="profile-avatar">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#006B3F" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2>Mairie de Yopougon</h2>
          <p class="profile-role">Administrateur communal</p>
          <p class="profile-email" *ngIf="fb.user">{{ fb.user.email }}</p>
        </div>

        <div class="profile-stats">
          <div class="pstat">
            <div class="pstat-num">{{ signalements.length }}</div>
            <div class="pstat-label">Signalements reçus</div>
          </div>
          <div class="pstat">
            <div class="pstat-num">{{ countStatus('resolu') }}</div>
            <div class="pstat-label">Problèmes résolus</div>
          </div>
          <div class="pstat">
            <div class="pstat-num">{{ resolutionRate() }}%</div>
            <div class="pstat-label">Taux de résolution</div>
          </div>
        </div>

        <div class="profile-info">
          <h3>Informations</h3>
          <div class="info-row"><span class="info-label">Commune</span><span>Yopougon, Abidjan</span></div>
          <div class="info-row"><span class="info-label">Pays</span><span>Côte d'Ivoire</span></div>
          <div class="info-row"><span class="info-label">Dernière connexion</span><span>{{ lastLogin }}</span></div>
        </div>

        <div class="profile-actions">
          <button class="btn-danger" (click)="logout()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Se déconnecter
          </button>
        </div>
      </div>

      <!-- ===== DETAIL PANEL (overlay) ===== -->
      <div *ngIf="selected" class="detail-overlay" (click)="closeDetail()">
        <div class="detail-panel" (click)="$event.stopPropagation()">
          <button class="detail-close" (click)="closeDetail()">✕</button>

          <div class="detail-header">
            <span class="number">#{{ selected.number }}</span>
            <span class="category">{{ categoryLabel(selected.category) }}</span>
            <span class="status-badge" [ngClass]="'status-' + selected.status">{{ statusLabel(selected.status) }}</span>
          </div>

          <div class="detail-photos" *ngIf="selected.photoUris.length > 0">
            <img *ngFor="let p of selected.photoUris" [src]="p" class="detail-photo" />
          </div>

          <p class="detail-desc">{{ selected.description }}</p>

          <div class="detail-meta">
            <div class="meta-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{{ selected.quartier }}{{ selected.address ? ' — ' + selected.address : '' }}</span>
            </div>
            <div class="meta-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{{ timeAgo(selected.createdAt) }} · {{ selected.isAnonymous ? 'Citoyen anonyme' : selected.authorPseudo }}</span>
            </div>
            <div class="meta-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
              <span>{{ selected.upvotes }} soutien{{ selected.upvotes > 1 ? 's' : '' }}</span>
            </div>
            <div class="meta-row" *ngIf="selected.ai.severity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006B3F" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>IA : {{ selected.ai.severity }} · {{ selected.ai.priority }} · Confiance {{ (selected.ai.confidence * 100) | number:'1.0-0' }}%</span>
            </div>
          </div>

          <!-- Mini map for this signalement -->
          <div class="detail-map-wrap">
            <div #detailMap class="detail-map"></div>
          </div>

          <!-- History -->
          <div class="detail-history" *ngIf="selected.history.length > 0">
            <h4>Historique</h4>
            <div *ngFor="let h of selected.history" class="history-item">
              <span class="history-status" [ngClass]="'status-' + h.status">{{ statusLabel(h.status) }}</span>
              <span class="history-time">{{ timeAgo(h.at) }}</span>
              <span *ngIf="h.note" class="history-note">{{ h.note }}</span>
            </div>
          </div>

          <div class="detail-actions">
            <select [ngModel]="selected.status" (ngModelChange)="changeStatus(selected.id, $event)" [ngClass]="'sel-' + selected.status">
              <option value="soumis">Soumis</option><option value="valide">Validé</option><option value="en_cours">En cours</option><option value="resolu">Résolu</option>
            </select>
            <button class="btn-upvote" (click)="upvote(selected.id)">Soutenir</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { min-height: 100vh; background: #FAFAF7; color: #0F1B2D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: #FFFFFF; border-bottom: 1px solid #E5DCC9; position: sticky; top: 0; z-index: 50; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .logo-img { width: 40px; height: 40px; border-radius: 12px; }
    .header-left h1 { font-size: 20px; margin: 0; font-weight: 700; color: #006B3F; }
    .header-sub { font-size: 13px; color: #6B7785; }
    .header-right { display: flex; align-items: center; gap: 14px; }
    .header-user { font-size: 14px; color: #0F1B2D; font-weight: 500; }
    .badge.live { background: #DC262615; color: #DC2626; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 6px; border: 1px solid #DC262630; }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #DC2626; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .btn-logout { background: #EFE9DD; color: #006B3F; border: 1px solid #E5DCC9; padding: 9px 16px; border-radius: 12px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px; font-weight: 600; }
    .btn-logout:hover { background: #006B3F; color: #FFFFFF; }

    /* Tabs */
    .tabs { display: flex; gap: 0; background: #FFFFFF; border-bottom: 2px solid #E5DCC9; padding: 0 24px; }
    .tabs button { display: flex; align-items: center; gap: 8px; padding: 14px 20px; background: none; border: none; border-bottom: 3px solid transparent; color: #6B7785; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: -2px; }
    .tabs button:hover { color: #006B3F; }
    .tabs button.active { color: #006B3F; border-bottom-color: #006B3F; }

    /* Stats */
    .stats-row { display: flex; gap: 14px; padding: 24px; overflow-x: auto; max-width: 960px; margin: 0 auto; }
    .stat-card { background: #FFFFFF; border-radius: 16px; padding: 18px 20px; min-width: 150px; display: flex; align-items: center; gap: 14px; border: 1px solid #E5DCC9; transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .stat-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .total-icon { background: #006B3F15; color: #006B3F; }
    .soumis-icon { background: #F59E0B20; color: #F59E0B; }
    .encours-icon { background: #006B3F15; color: #006B3F; }
    .resolu-icon { background: #006B3F15; color: #006B3F; }
    .p1-icon { background: #DC262615; color: #DC2626; }
    .stat-info { flex: 1; }
    .stat-num { font-size: 28px; font-weight: 800; line-height: 1; }
    .stat-label { font-size: 13px; color: #6B7785; margin-top: 4px; }
    .stat-card.soumis .stat-num { color: #F59E0B; }
    .stat-card.en_cours .stat-num { color: #006B3F; }
    .stat-card.resolu .stat-num { color: #006B3F; }
    .stat-card.p1 .stat-num { color: #DC2626; }

    /* Filters */
    .filters { display: flex; gap: 12px; padding: 0 24px 16px; flex-wrap: wrap; align-items: flex-end; max-width: 960px; margin: 0 auto; }
    .filter-group { display: flex; flex-direction: column; gap: 6px; }
    .filter-group label { font-size: 12px; color: #6B7785; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    select, .search { background: #FFFFFF; border: 1px solid #E5DCC9; color: #0F1B2D; padding: 10px 14px; border-radius: 12px; font-size: 15px; outline: none; }
    select:focus, .search:focus { border-color: #006B3F; box-shadow: 0 0 0 3px #006B3F15; }
    .search-group { flex: 1; min-width: 240px; }
    .search-wrap { position: relative; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
    .search { padding-left: 38px; width: 100%; box-sizing: border-box; }
    .result-count { padding: 0 24px; font-size: 14px; color: #6B7785; margin-bottom: 10px; max-width: 960px; margin-left: auto; margin-right: auto; }

    /* List */
    .list { padding: 0 24px 24px; display: flex; flex-direction: column; gap: 14px; max-width: 960px; margin: 0 auto; }
    .empty { text-align: center; color: #6B7785; padding: 80px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .empty p { font-size: 18px; font-weight: 700; color: #0F1B2D; margin: 0; }

    /* Card */
    .card { background: #FFFFFF; border-radius: 16px; padding: 18px; border-left: 4px solid #E5DCC9; border-top: 1px solid #E5DCC9; border-right: 1px solid #E5DCC9; border-bottom: 1px solid #E5DCC9; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
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
    .btn-upvote { background: #FF6700; color: #FFFFFF; border: 1px solid #FF6700; padding: 9px 16px; border-radius: 10px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px; font-weight: 600; }
    .btn-upvote:hover { background: #E15800; }
    .btn-map { background: #006B3F; color: #FFFFFF; border: none; padding: 9px 16px; border-radius: 10px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px; font-weight: 600; }
    .btn-map:hover { background: #005530; }

    /* Map */
    .map-container { padding: 0; }
    .map-el { width: 100%; height: calc(100vh - 130px); }

    /* Profile */
    .profile-section { max-width: 600px; margin: 0 auto; padding: 24px; }
    .profile-card { text-align: center; padding: 40px 20px; background: #FFFFFF; border-radius: 20px; border: 1px solid #E5DCC9; margin-bottom: 20px; }
    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: #006B3F15; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .profile-card h2 { font-size: 22px; font-weight: 800; color: #0F1B2D; margin: 0 0 4px; }
    .profile-role { font-size: 14px; color: #006B3F; font-weight: 600; margin: 0 0 4px; }
    .profile-email { font-size: 14px; color: #6B7785; margin: 0; }
    .profile-stats { display: flex; gap: 14px; margin-bottom: 20px; }
    .pstat { flex: 1; background: #FFFFFF; border-radius: 16px; padding: 20px; border: 1px solid #E5DCC9; text-align: center; }
    .pstat-num { font-size: 28px; font-weight: 800; color: #006B3F; }
    .pstat-label { font-size: 13px; color: #6B7785; margin-top: 4px; }
    .profile-info { background: #FFFFFF; border-radius: 16px; padding: 24px; border: 1px solid #E5DCC9; margin-bottom: 20px; }
    .profile-info h3 { font-size: 17px; font-weight: 700; margin: 0 0 16px; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F1ECE0; font-size: 15px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6B7785; font-weight: 600; }
    .profile-actions { display: flex; gap: 12px; }
    .btn-danger { background: #DC2626; color: #FFFFFF; border: none; padding: 14px 24px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center; }
    .btn-danger:hover { background: #B91C1C; }

    /* Detail overlay */
    .detail-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .detail-panel { background: #FFFFFF; border-radius: 20px; padding: 24px; max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; }
    .detail-close { position: absolute; top: 16px; right: 16px; background: #F1ECE0; border: none; width: 32px; height: 32px; border-radius: 16px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .detail-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .detail-photos { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 16px; }
    .detail-photo { width: 140px; height: 100px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
    .detail-desc { font-size: 16px; line-height: 1.7; color: #0F1B2D; margin: 0 0 16px; }
    .detail-meta { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .meta-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #0F1B2D; }
    .detail-map-wrap { margin-bottom: 16px; border-radius: 14px; overflow: hidden; border: 1px solid #E5DCC9; }
    .detail-map { width: 100%; height: 220px; }
    .detail-history { margin-bottom: 16px; }
    .detail-history h4 { font-size: 15px; font-weight: 700; margin: 0 0 10px; }
    .history-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #F1ECE0; font-size: 14px; }
    .history-item:last-child { border-bottom: none; }
    .history-status { padding: 3px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; }
    .history-time { color: #6B7785; }
    .history-note { color: #0F1B2D; font-style: italic; }
    .detail-actions { display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid #E5DCC9; }
    .detail-actions select { font-size: 15px; padding: 10px 16px; border-radius: 10px; }
  `],
})
export class AdminComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('globalMap') globalMapEl!: ElementRef;
  @ViewChild('detailMap') detailMapEl!: ElementRef;

  signalements: Signalement[] = [];
  filtered: Signalement[] = [];
  filterStatus = '';
  filterPriority = '';
  searchText = '';
  tab: 'dashboard' | 'map' | 'profile' = 'dashboard';
  selected: Signalement | null = null;
  lastLogin = '';
  unsub: (() => void) | null = null;

  private globalMap: L.Map | null = null;
  private detailMap: L.Map | null = null;
  private globalMarkers: L.Marker[] = [];

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

  constructor(public fb: FirebaseService, private router: Router) {}

  ngOnInit() {
    if (!this.fb.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.lastLogin = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    this.unsub = this.fb.onSignalements((list) => {
      this.signalements = list;
      this.applyFilter();
      if (this.tab === 'map') this.updateGlobalMap();
    });
  }

  ngAfterViewInit() {
    // Map is initialized when tab switches
  }

  ngOnDestroy() {
    this.unsub?.();
    this.globalMap?.remove();
    this.detailMap?.remove();
  }

  switchTab(t: 'dashboard' | 'map' | 'profile') {
    this.tab = t;
    if (t === 'map') {
      setTimeout(() => this.initGlobalMap(), 50);
    }
  }

  private initGlobalMap() {
    if (this.globalMap) { this.globalMap.remove(); this.globalMap = null; }
    if (!this.globalMapEl?.nativeElement) return;

    this.globalMap = L.map(this.globalMapEl.nativeElement).setView([5.345, -4.024], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.globalMap);
    this.updateGlobalMap();
  }

  private updateGlobalMap() {
    if (!this.globalMap) return;
    this.globalMarkers.forEach(m => m.remove());
    this.globalMarkers = [];

    const statusColors: Record<string, string> = { soumis: '#F59E0B', valide: '#006B3F', en_cours: '#006B3F', resolu: '#16A34A' };

    for (const s of this.signalements) {
      if (!s.latitude && !s.longitude) continue;
      const color = statusColors[s.status] ?? '#9333EA';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;">${this.categoryLabel(s.category).charAt(0)}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      const marker = L.marker([s.latitude, s.longitude], { icon }).addTo(this.globalMap!);
      marker.bindPopup(`<b>#${s.number}</b> ${this.categoryLabel(s.category)}<br>${s.quartier}<br><small>${s.description.substring(0, 80)}...</small>`);
      marker.on('click', () => this.openDetail(s));
      this.globalMarkers.push(marker);
    }

    if (this.globalMarkers.length > 0) {
      const group = L.featureGroup(this.globalMarkers);
      this.globalMap.fitBounds(group.getBounds().pad(0.1));
    }
  }

  openDetail(s: Signalement) {
    this.selected = s;
    setTimeout(() => this.initDetailMap(), 50);
  }

  closeDetail() {
    this.selected = null;
    this.detailMap?.remove();
    this.detailMap = null;
  }

  private initDetailMap() {
    if (this.detailMap) { this.detailMap.remove(); this.detailMap = null; }
    if (!this.detailMapEl?.nativeElement || !this.selected) return;

    const lat = this.selected.latitude || 5.345;
    const lng = this.selected.longitude || -4.024;

    this.detailMap = L.map(this.detailMapEl.nativeElement).setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.detailMap);

    const color = this.selected.status === 'resolu' ? '#16A34A' : this.selected.status === 'soumis' ? '#F59E0B' : '#006B3F';
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};border:4px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:800;">!</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker([lat, lng], { icon }).addTo(this.detailMap);
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

  countStatus(status: string) { return this.signalements.filter(s => s.status === status).length; }
  countPriority(priority: string) { return this.signalements.filter(s => s.ai.priority === priority).length; }
  resolutionRate() { return this.signalements.length > 0 ? Math.round(this.countStatus('resolu') / this.signalements.length * 100) : 0; }

  statusLabel(s: string) {
    const map: Record<string, string> = { soumis: 'Soumis', valide: 'Validé', en_cours: 'En cours', resolu: 'Résolu' };
    return map[s] ?? s;
  }
  categoryLabel(c: string) { return this.categoryMap[c] ?? c ?? 'Autre'; }
  categoryHue(c: string) { return this.categoryHues[c] ?? '#9333EA'; }

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

  async changeStatus(id: string, status: string) { await this.fb.updateStatus(id, status); }
  async upvote(id: string) { await this.fb.upvote(id); }

  async logout() {
    await this.fb.logout();
    this.router.navigate(['/login']);
  }
}
