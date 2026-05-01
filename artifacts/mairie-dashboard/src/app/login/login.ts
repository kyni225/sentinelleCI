import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';
import { ConfirmationResult } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <img src="/icon.png" class="logo-img" alt="SentinelleCI" />
        <h1>SentinelleCI</h1>
        <p class="subtitle">Tableau de bord communal</p>

        <!-- Étape 1 : Numéro de téléphone -->
        <form (ngSubmit)="sendOtp()" class="form" *ngIf="!otpSent">
          <label>
            <span class="label-text">Numéro de téléphone</span>
            <input type="tel" [(ngModel)]="phone" name="phone" placeholder="07 XX XX XX XX" required />
          </label>

          <div *ngIf="error" class="error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading">
            <svg *ngIf="loading" class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ loading ? 'Envoi en cours...' : 'Recevoir le code' }}
          </button>
        </form>

        <!-- Étape 2 : Code OTP -->
        <form (ngSubmit)="verifyOtp()" class="form" *ngIf="otpSent">
          <label>
            <span class="label-text">Code OTP</span>
            <input type="text" [(ngModel)]="otp" name="otp" placeholder="XXXXXX" maxlength="6" required />
          </label>

          <div *ngIf="error" class="error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading">
            <svg *ngIf="loading" class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {{ loading ? 'Vérification...' : 'Vérifier' }}
          </button>
        </form>

        <button class="btn-secondary" (click)="reset()" *ngIf="otpSent">
          Changer de numéro
        </button>

        <div class="hint" *ngIf="!otpSent">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7785" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Entrez votre numéro pour recevoir un code par SMS
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #FAFAF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .login-card { background: #FFFFFF; border-radius: 24px; padding: 48px 40px; width: 100%; max-width: 440px; text-align: center; border: 1px solid #E5DCC9; box-shadow: 0 12px 48px rgba(0,0,0,0.08); }
    .logo-img { width: 72px; height: 72px; border-radius: 18px; margin: 0 auto 20px; display: block; }
    h1 { color: #006B3F; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.3px; }
    .subtitle { color: #6B7785; margin: 8px 0 32px; font-size: 15px; }
    .form { display: flex; flex-direction: column; gap: 20px; text-align: left; }
    label { color: #0F1B2D; font-size: 15px; display: flex; flex-direction: column; gap: 8px; }
    .label-text { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #6B7785; }
    input { background: #F1ECE0; border: 1px solid #E5DCC9; border-radius: 14px; padding: 14px 16px; color: #0F1B2D; font-size: 16px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
    input:focus { border-color: #006B3F; box-shadow: 0 0 0 4px #006B3F15; }
    .btn-upvote { background: #FF6700; color: #FFFFFF; border: 1px solid #FF6700; padding: 9px 16px; border-radius: 10px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px; transition: all 0.2s; font-weight: 600; }
    .btn-upvote:hover { background: #E15800; border-color: #E15800; }
    .btn-secondary { background: transparent; color: #6B7785; border: none; padding: 12px; font-size: 14px; cursor: pointer; font-weight: 600; transition: color 0.2s; margin-top: 12px; }
    .btn-secondary:hover { color: #006B3F; }
    button { background: #FF6700; color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; cursor: pointer; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    button:hover:not(:disabled) { background: #E15800; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .error { color: #DC2626; font-size: 14px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px; background: #DC262610; padding: 12px; border-radius: 12px; border: 1px solid #DC262625; }
    .hint { color: #6B7785; font-size: 13px; margin-top: 24px; display: flex; align-items: center; justify-content: center; gap: 6px; }
  `],
})
export class LoginComponent implements AfterViewInit {
  phone = '';
  otp = '';
  otpSent = false;
  confirmationResult: ConfirmationResult | null = null;
  error = '';
  loading = false;

  constructor(private fb: FirebaseService, private router: Router) {}

  ngAfterViewInit() {
    this.fb.initRecaptcha('recaptcha-container');
  }

  async sendOtp() {
    this.error = '';
    this.loading = true;
    try {
      this.confirmationResult = await this.fb.sendOtp(this.phone);
      this.otpSent = true;
    } catch (e: any) {
      this.error = 'Erreur lors de l\'envoi du code. Vérifiez votre numéro.';
    } finally {
      this.loading = false;
    }
  }

  async verifyOtp() {
    this.error = '';
    this.loading = true;
    try {
      if (this.confirmationResult) {
        await this.fb.verifyOtp(this.confirmationResult, this.otp);
        this.router.navigate(['/admin']);
      }
    } catch (e: any) {
      this.error = 'Code incorrect. Réessayez.';
    } finally {
      this.loading = false;
    }
  }

  reset() {
    this.otpSent = false;
    this.otp = '';
    this.confirmationResult = null;
    this.error = '';
  }
}
