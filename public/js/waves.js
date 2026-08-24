// waves.js — Hero background animation (SimplexNoise, inline, no CDN dependency)
(function () {
  'use strict';

  // ── Compact 3D Simplex Noise (Gustavson / public domain) ──────────────────
  function buildNoise() {
    var p = new Uint8Array(256);
    for (var i = 0; i < 256; i++) p[i] = i;
    for (var i = 255; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    var perm = new Uint8Array(512), pm12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) { perm[i] = p[i & 255]; pm12[i] = perm[i] % 12; }

    var g3 = [1,1,0,-1,1,0,1,-1,0,-1,-1,0, 1,0,1,-1,0,1, 1,0,-1,-1,0,-1, 0,1,1,0,-1,1, 0,1,-1,0,-1,-1];
    var F3 = 1 / 3, G3 = 1 / 6;

    function dot(g, x, y, z) { return g3[g*3]*x + g3[g*3+1]*y + g3[g*3+2]*z; }

    return function noise3D(x, y, z) {
      var s = (x+y+z)*F3;
      var i = Math.floor(x+s), j = Math.floor(y+s), k = Math.floor(z+s);
      var t = (i+j+k)*G3;
      var x0=x-(i-t), y0=y-(j-t), z0=z-(k-t);
      var i1,j1,k1,i2,j2,k2;
      if (x0>=y0) {
        if      (y0>=z0) { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; }
        else if (x0>=z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; }
        else             { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; }
      } else {
        if      (y0<z0)  { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; }
        else if (x0<z0)  { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; }
        else             { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; }
      }
      var x1=x0-i1+G3, y1=y0-j1+G3, z1=z0-k1+G3;
      var x2=x0-i2+2*G3, y2=y0-j2+2*G3, z2=z0-k2+2*G3;
      var x3=x0-1+3*G3, y3=y0-1+3*G3, z3=z0-1+3*G3;
      var ii=i&255, jj=j&255, kk=k&255;
      var gi0=pm12[ii+perm[jj+perm[kk]]];
      var gi1=pm12[ii+i1+perm[jj+j1+perm[kk+k1]]];
      var gi2=pm12[ii+i2+perm[jj+j2+perm[kk+k2]]];
      var gi3=pm12[ii+1+perm[jj+1+perm[kk+1]]];
      var t0=0.6-x0*x0-y0*y0-z0*z0, n0=t0<0?0:(t0*=t0,t0*t0*dot(gi0,x0,y0,z0));
      var t1=0.6-x1*x1-y1*y1-z1*z1, n1=t1<0?0:(t1*=t1,t1*t1*dot(gi1,x1,y1,z1));
      var t2=0.6-x2*x2-y2*y2-z2*z2, n2=t2<0?0:(t2*=t2,t2*t2*dot(gi2,x2,y2,z2));
      var t3=0.6-x3*x3-y3*y3-z3*z3, n3=t3<0?0:(t3*=t3,t3*t3*dot(gi3,x3,y3,z3));
      return 32*(n0+n1+n2+n3);
    };
  }

  // ── Per-hero canvas setup ──────────────────────────────────────────────────
  function initWaves() {
    var noise3D = buildNoise();
    var TAU = Math.PI * 2;
    var ZERO=0, THIRD=1/3, TWO_THIRDS=2/3, ONE=1;

    function map(v, l1, h1, l2, h2) { return l2 + (v-l1)/(h1-l1)*(h2-l2); }
    function hsl(h, s, l) { return 'hsl('+h+','+s+'%,'+l+'%)'; }

    var heroes = document.querySelectorAll('[data-waves]');
    if (!heroes.length) return;

    heroes.forEach(function (hero) {
      var cv = document.createElement('canvas');
      cv.className = 'hero-waves';
      hero.appendChild(cv);

      var ctx = cv.getContext('2d');
      if (!ctx) return;

      var startTime = null;

      function resize() {
        cv.width  = hero.offsetWidth  || window.innerWidth;
        cv.height = hero.offsetHeight || Math.round(window.innerHeight * 0.55);
      }

      // Run resize after layout is guaranteed (rAF fires after layout)
      requestAnimationFrame(function () {
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Prime the canvas with an initial fill so it's visible immediately
        var w = cv.width, h = cv.height;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        var initGrad = ctx.createLinearGradient(-w, 0, w, h);
        initGrad.addColorStop(0,   'rgba(155,101,255,0.18)');
        initGrad.addColorStop(0.5, 'rgba(109,204,221,0.12)');
        initGrad.addColorStop(1,   'rgba(155,101,255,0.18)');
        ctx.fillStyle = initGrad;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();

        requestAnimationFrame(frame);
      });

      function frame(ts) {
        ctx.clearRect(0, 0, cv.width, cv.height);

        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var w = cv.width, h = cv.height;
        var wH = w / 2, hH = h / 2;

        var xN=40, yN=50, iX=1/(xN-1), iY=1/(yN-1); // yN = number of lines
        var time = elapsed * 0.0001; // slow down time (originally 0.00065) for a more subtle effect
        var step = 0.01;

        // ── All drawing in centered coordinate space (origin = canvas center) ──
        ctx.save();
        ctx.translate(wH, hH);

        // Oscillating purple ↔ teal gradient (coords relative to center)
        var grad = ctx.createLinearGradient(-w, 0, w, h);
        var t = time % 1;
        var side = Math.floor(time % 2) === 0;
        var cA = hsl(side ? 266 : 188, 65, 68);
        var cB = hsl(side ? 188 : 266, 65, 65);
        grad.addColorStop(map(t, 0, 1, THIRD, ZERO),        cA);
        grad.addColorStop(map(t, 0, 1, TWO_THIRDS, THIRD),  cB);
        grad.addColorStop(map(t, 0, 1, ONE, TWO_THIRDS),    cA);

        // Low-alpha fill → motion-trail effect (no clearRect intentional)
        // ctx.globalAlpha = map(Math.cos(time), -1, 1, 0.12, 0.28);
        // ctx.fillStyle = grad;
        // ctx.fillRect(-wH, -hH, w, h);
        // ctx.globalAlpha = 1;

        // 60 noise lines centered at y=0 (canvas vertical center)
        ctx.beginPath();
        for (var j = 0; j < yN; j++) {
          var tj = j * iY;
          var c = Math.cos(tj * TAU + time) * 0.1;
          for (var i = 0; i < xN; i++) {
            var ti = i * iX;
            var n = noise3D(ti, time, c);
            var y = n * hH;                   // −hH to +hH (centered at 0)
            var x = ti * (w + 20) - wH - 10;  // −wH−10 to +wH+10 (full width)
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          time += step;
        }

        // Glow pass then sharp white stroke
        // ctx.globalCompositeOperation = 'lighter';
        // ctx.filter = 'blur(10px)';
        // ctx.strokeStyle = grad;
        // ctx.lineWidth = 5;
        // ctx.stroke();
        // ctx.filter = 'none';
        // ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        // ctx.lineWidth = 2;
        // ctx.stroke();
        // ctx.globalCompositeOperation = 'source-over';

        // ctx.strokeStyle = '#ffffff'; // or grad if you want color
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.25; // thinner lines for a more subtle effect
        ctx.stroke();

        ctx.restore();

        requestAnimationFrame(frame);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWaves);
  } else {
    initWaves();
  }

})();
