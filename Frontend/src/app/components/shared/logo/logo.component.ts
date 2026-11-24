import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Logotipo de Ferre-mass: marca (carretilla con herramientas) + palabra.
 *
 *  variant  'light' -> para fondos oscuros (palabra dorada)
 *           'dark'  -> para fondos claros (palabra oscura)
 *  layout   'stacked' (marca sobre la palabra) | 'inline' (marca a la izquierda)
 *  size     'sm' | 'md' | 'lg' | 'xl'  (escala todo con em)
 *  slogan   muestra "Donde tus ahorros rinden más" bajo la palabra
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="logo" [ngClass]="['logo--' + variant, 'logo--' + layout, 'logo--' + size]" role="img"
      aria-label="Ferre-mass">
      <svg class="logo__mark" viewBox="0 0 150 110" aria-hidden="true" focusable="false">
        <!-- sombra en el suelo -->
        <ellipse cx="76" cy="103" rx="50" ry="4.5" class="m-shadow"/>

        <!-- herramientas (detras de la carretilla) -->
        <g transform="rotate(-20 42 40)">
          <rect x="39" y="2" width="6" height="15" rx="3" class="m-red"/>
          <rect x="41" y="16" width="2" height="9" class="m-silver"/>
          <path d="M33 24h18l-9 20z" class="m-silver"/>
        </g>
        <g transform="rotate(17 104 40)">
          <rect x="99" y="0" width="10" height="17" rx="4" class="m-red"/>
          <rect x="102" y="16" width="4" height="26" rx="2" class="m-silver"/>
        </g>

        <!-- casco -->
        <path d="M46 42c0-17 7-25 18-25s18 8 18 25z" class="m-gold"/>
        <rect x="61" y="13" width="6" height="12" rx="3" class="m-gold-light"/>
        <rect x="41" y="38" width="46" height="6" rx="3" class="m-gold-dark"/>

        <!-- carretilla -->
        <path d="M26 44h78l-12 31q-2 5-7 5H45q-5 0-7-5z" class="m-red"/>
        <path d="M31 63h69l-8 12q-2 5-7 5H45q-5 0-7-5z" class="m-red-dark"/>
        <rect x="22" y="39" width="86" height="8" rx="4" class="m-red-light"/>
        <path d="M40 71 11 55" class="m-handle"/>
        <path d="M11 55 4 51" class="m-grip"/>
        <path d="M58 79 52 99" class="m-handle"/>
        <rect x="45" y="97" width="15" height="4" rx="2" class="m-silver"/>

        <!-- rueda -->
        <path d="M97 71 112 87" class="m-handle"/>
        <circle cx="113" cy="87" r="15" class="m-tire"/>
        <circle cx="113" cy="87" r="8" class="m-rim"/>
        <circle cx="113" cy="87" r="3.5" class="m-silver"/>
      </svg>

      <span class="logo__text">
        <span class="logo__word">ferre<span class="logo__dash">-</span>mass</span>
        <span class="logo__rule"></span>
        <span class="logo__slogan" *ngIf="slogan">
          <span class="logo__quote" aria-hidden="true">&ldquo;</span>Donde tus ahorros rinden más<span
            class="logo__quote" aria-hidden="true">&rdquo;</span>
        </span>
      </span>
    </span>
  `,
  styles: [`
    :host { display: inline-block; }

    .logo {
      --lg-ink: #10303d;
      --lg-word: #f4be4a;
      --lg-silver: #e4eaf0;
      --lg-tire: #1d2833;
      --lg-rim: #3a4857;
      --lg-rule: #62b7d4;
      --lg-slogan: rgba(255, 255, 255, .88);
      display: inline-flex;
      align-items: center;
      gap: .35em;
      font-family: 'Bricolage Grotesque', 'Source Sans Pro', system-ui, sans-serif;
      line-height: 1;
    }

    .logo--dark {
      --lg-word: var(--lg-ink);
      --lg-silver: #b9c5d0;
      --lg-rule: #227a99;
      --lg-slogan: #5b6b78;
    }

    .logo--stacked { flex-direction: column; text-align: center; gap: .15em; }
    .logo--inline { flex-direction: row; text-align: left; }

    /* escalas: todo se mide en em */
    .logo--sm { font-size: 1.05rem; }
    .logo--md { font-size: 1.6rem; }
    .logo--lg { font-size: 2.6rem; }
    .logo--xl { font-size: 3.4rem; }

    .logo__mark { display: block; width: 3.1em; height: auto; overflow: visible; }
    .logo--stacked .logo__mark { width: 3.5em; }

    .logo__text { display: flex; flex-direction: column; }
    .logo--stacked .logo__text { align-items: center; }

    .logo__word {
      font-size: 1.3em;
      font-weight: 800;
      letter-spacing: -.035em;
      white-space: nowrap;
      color: var(--lg-word);
    }
    .logo--stacked .logo__word { font-size: 1.9em; }
    .logo__dash { color: #f4be4a; }

    .logo__rule {
      display: block;
      height: .11em;
      margin: .32em 0 0;
      border-radius: 2px;
      background: linear-gradient(90deg, var(--lg-rule), rgba(98, 183, 212, .15));
    }
    .logo--stacked .logo__rule { width: 100%; }

    .logo__slogan {
      margin-top: .55em;
      font-size: .52em;
      font-weight: 600;
      letter-spacing: .16em;
      text-transform: uppercase;
      white-space: nowrap;
      color: var(--lg-slogan);
    }
    .logo--stacked .logo__slogan { font-size: .42em; letter-spacing: .14em; }
    .logo__quote { color: #f4be4a; font-size: 1.5em; line-height: 0; vertical-align: -.2em; margin: 0 .15em; }

    /* partes de la marca */
    .m-shadow { fill: #000; opacity: .18; }
    .m-silver { fill: var(--lg-silver); }
    .m-red { fill: #d8384c; }
    .m-red-light { fill: #ee5468; }
    .m-red-dark { fill: #a82437; opacity: .4; }
    .m-gold { fill: #f4be4a; }
    .m-gold-light { fill: #f8d27c; }
    .m-gold-dark { fill: #dd9f2c; }
    .m-tire { fill: var(--lg-tire); stroke: rgba(255, 255, 255, .28); stroke-width: 1.6; }
    .m-rim { fill: var(--lg-rim); }
    .m-handle { fill: none; stroke: var(--lg-silver); stroke-width: 5; stroke-linecap: round; }
    .m-grip { fill: none; stroke: #d8384c; stroke-width: 7; stroke-linecap: round; }
  `]
})
export class LogoComponent {
  @Input() variant: 'light' | 'dark' = 'light';
  @Input() layout: 'stacked' | 'inline' = 'inline';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() slogan = false;
}
