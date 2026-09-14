/**
 * Re-measure the hero contract in `src/config/heroCalibration.ts`.
 *
 * The numbers in that file are not estimates and must not be edited by hand: they are what this
 * script printed against a running dev server. Run it after any change to the hero grid, the avatar
 * stage, the poster asset or `fitCameraToObject`'s padding, and paste the result into the table and
 * the curves in the same commit.
 *
 *     npm run dev                       # in one terminal
 *     node tools/measure-hero.mjs       # in another
 *
 * Set CHROME_PATH if Playwright's bundled Chromium is somewhere unusual.
 *
 * The one subtlety is the poster transform. `posterAlignment` scales the poster to agree with the
 * live camera, but `object-fit: contain` computes its content box from the border box *before* any
 * transform — so measuring the transformed rect and working backwards gives the wrong content box.
 * The script therefore reads the layout with the transform switched off and re-applies the matrix
 * itself.
 */

import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const FEET = 1169/1200, HEAD = 42/1200, CX = ((311+587)/2)/900, BODY = (587-311)/900;
for (const [w,h] of [[2560,1440],[1920,1080],[1600,900],[1440,900],[1280,800],[1180,820],[1024,1366],[900,1200],[820,1180],[768,1024],[760,1024],[744,1133],[600,960],[540,1170],[430,932],[414,896],[390,844],[360,780],[320,690]]) {
  const page = await browser.newPage({ viewport:{width:w,height:h} });
  await page.goto(process.env.HERO_URL || 'http://127.0.0.1:5173/', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1000);
  for (const label of [/Begin Journey/i, /Continue/i]) {
    const b = page.getByRole('button', { name: label }).first();
    if (await b.count() && await b.isVisible().catch(()=>false)) { await b.click().catch(()=>{}); break; }
  }
  await page.waitForTimeout(1800);
  const r = await page.evaluate(({FEET,HEAD,CX,BODY}) => {
    const hero=document.querySelector('.hero'), hr=hero.getBoundingClientRect();
    const img=document.querySelector('.avatar-poster img');
    if (!img) return {error:'no poster'};
    // Measure the untransformed layout first, then re-apply the transform analytically: the
    // object-fit content box is computed from the pre-transform border box, so measuring the
    // transformed rect and dividing would be wrong.
    const prev = img.style.transform;
    img.style.transform = 'none';
    img.getBoundingClientRect();
    const ir = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    img.style.transform = prev;
    const m = new DOMMatrixReadOnly(getComputedStyle(img).transform === 'none' ? '' : getComputedStyle(img).transform);
    const nw=img.naturalWidth||900, nh=img.naturalHeight||1200;
    const boxA=ir.width/ir.height, imgA=nw/nh;
    let dw=ir.width, dh=ir.height, dx=ir.x, dy=ir.y;
    if (cs.objectFit==='contain') {
      if (imgA>boxA) { dh=ir.width/imgA; dy=ir.y+(ir.height-dh)/2; }
      else { dw=ir.height*imgA; dx=ir.x+(ir.width-dw)/2; }
    }
    // Transform is about the element's own centre.
    const ox=ir.x+ir.width/2, oy=ir.y+ir.height/2;
    const tx=(x)=>ox+(x-ox)*m.a+m.e, ty=(y)=>oy+(y-oy)*m.d+m.f;
    const feetPx=ty(dy+dh*FEET), headPx=ty(dy+dh*HEAD), cxPx=tx(dx+dw*CX);
    const bodyPx=dw*BODY*m.a;
    const shadow=document.querySelector('.hero__contact-shadow');
    const sr=shadow?shadow.getBoundingClientRect():null;
    return {
      hero:{w:+hr.width.toFixed(1),h:+hr.height.toFixed(1),aspect:+(hr.width/hr.height).toFixed(4)},
      scale:+m.a.toFixed(4),
      feetY:+((feetPx-hr.y)/hr.height).toFixed(4),
      headY:+((headPx-hr.y)/hr.height).toFixed(4),
      centerX:+((cxPx-hr.x)/hr.width).toFixed(4),
      bodyW:+(bodyPx/hr.width).toFixed(4),
      shadowCY: sr? +(((sr.y+sr.height/2)-hr.y)/hr.height).toFixed(4) : null,
      shadowCX: sr? +(((sr.x+sr.width/2)-hr.x)/hr.width).toFixed(4) : null,
    };
  }, {FEET,HEAD,CX,BODY});
  console.log(`${String(w).padStart(4)} hero ${r.hero?.w}x${r.hero?.h} a=${r.hero?.aspect} scale=${r.scale} centreX=${r.centerX} feetY=${r.feetY} headY=${r.headY} bodyW=${r.bodyW} shadow@${r.shadowCY}/${r.shadowCX}`);
  await page.close();
}
await browser.close();
