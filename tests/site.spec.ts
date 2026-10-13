import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('personal introduction, navigation, contacts, and resume', async ({page,request})=>{
  await page.goto('/');
  await expect(page).toHaveTitle(/Suraj Jena/);
  await expect(page.getByRole('heading',{level:1})).toContainText('Software engineer.');
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Experience'}).click();
  await expect(page).toHaveURL(/#experience/);
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About'}).click();
  await page.goBack();await expect(page).toHaveURL(/#experience/);
  await page.goto('/#lab');await expect(page.getByRole('heading',{name:'ML lab'})).toBeVisible();
  await expect(page.getByRole('link',{name:'GitHub'})).toHaveAttribute('href','https://github.com/dunkelhaus');
  await expect(page.getByRole('link',{name:'LinkedIn'})).toHaveAttribute('href','https://linkedin.com/in/skjena');
  const pdf=await request.get('/suraj-jena-resume.pdf');expect(pdf.status()).toBe(200);expect((await pdf.body()).subarray(0,4).toString()).toBe('%PDF');
});

test('responsive composition, accessibility, and reference screenshots',async({page})=>{
  for(const width of [360,768,1440]){
    await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const links=await page.locator('.site-header a,.hero-actions a,.hero-bottom a,footer a').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height};}));expect(links.filter(r=>r.width>0).every(r=>r.width>=44&&r.height>=44)).toBe(true);
    await page.screenshot({path:`docs/review/home-${width}.png`,fullPage:true});
  }
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
});

test('lazy playable, real training, reward reset, and disposal',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const scripts:string[]=[];page.on('request',r=>{if(r.resourceType()==='script')scripts.push(r.url());});
  await page.goto('/');expect(scripts.some(s=>/Playable|simulation.worker/.test(s))).toBe(false);
  await page.getByRole('button',{name:'Enter the playground'}).click();await expect(page.getByRole('button',{name:'Train agent'})).toBeEnabled();
  await page.getByRole('button',{name:'Train agent'}).click();await expect(page.getByTestId('episodes')).toHaveText('500',{timeout:15000});
  await page.getByRole('button',{name:'Watch policy'}).click();await expect(page.getByText('Goal reached.',{exact:false})).toBeVisible({timeout:15000});
  await page.getByRole('button',{name:'Train agent'}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();const paused=await page.getByTestId('episodes').innerText();await page.waitForTimeout(100);await expect(page.getByTestId('episodes')).toHaveText(paused);
  await page.getByRole('spinbutton',{name:'Goal reward',exact:true}).fill('25');await page.getByRole('spinbutton',{name:'Goal reward',exact:true}).press('Tab');await expect(page.getByTestId('episodes')).toHaveText('0');await expect(page.getByText('Settings changed.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Step',exact:true}).click();await expect(page.getByText('Agent: column 1, row 5.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(page.getByText('Agent: column 1, row 6.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Close experiment'}).click();await page.getByRole('button',{name:'Enter the playground'}).click();await expect(page.getByTestId('episodes')).toHaveText('0');
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();expect(results.violations).toEqual([]);
  await page.screenshot({path:'docs/review/playable-1440.png',fullPage:true});expect(errors).toEqual([]);
});

test('keyboard controls, invalid input, visibility pause, and reset during training',async({page})=>{
  await page.goto('/#lab');
  const launch=page.getByRole('button',{name:'Enter the playground'});await launch.focus();await page.keyboard.press('Enter');
  const train=page.getByRole('button',{name:'Train agent'});await expect(train).toBeEnabled();await train.focus();await page.keyboard.press('Space');
  await expect(page.getByTestId('episodes')).not.toHaveText('0');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.getByText('Paused while this tab',{exact:false})).toBeVisible();
  const n=await page.getByTestId('episodes').innerText();await page.waitForTimeout(100);await expect(page.getByTestId('episodes')).toHaveText(n);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});});
  const reward=page.getByRole('spinbutton',{name:'Goal reward',exact:true});await reward.focus();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.type('100');await page.keyboard.press('Tab');
  await expect(page.getByRole('alert')).toContainText('Goal must be');await expect(train).toBeDisabled();
  await reward.fill('20');await reward.press('Tab');await train.focus();await page.keyboard.press('Space');
  const reset=page.getByRole('button',{name:'Reset',exact:true});await reset.focus();await page.keyboard.press('Enter');await expect(page.getByTestId('episodes')).toHaveText('0');await page.waitForTimeout(100);await expect(page.getByTestId('episodes')).toHaveText('0');
  for(const name of ['Watch policy','Pause','Step','Reset']){const b=page.getByRole('button',{name,exact:true});await b.focus();await expect(b).toBeFocused();await page.keyboard.press('Space');}
  await page.screenshot({path:'docs/review/controls-focus.png',fullPage:true});
});

test('mobile touch playable and reduced motion',async({browser})=>{
  const context=await browser.newContext({viewport:{width:360,height:800},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();
  await page.goto('/#lab');await page.getByRole('button',{name:'Enter the playground'}).tap();await expect(page.getByRole('button',{name:'Train agent'})).toBeEnabled();
  await page.getByRole('button',{name:'Step',exact:true}).tap();await expect(page.getByText('Agent: column 1, row 5.',{exact:false})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const targets=await page.locator('.playable button,.playable input').evaluateAll(elements=>elements.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,visible:r.width>0};}));
  expect(targets.filter(t=>t.visible).every(t=>t.width>=44&&t.height>=44)).toBe(true);
  await page.screenshot({path:'docs/review/playable-360.png',fullPage:true});
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();expect(results.violations).toEqual([]);await context.close();
});

test('worker failure has a recoverable error and does not block the site',async({page})=>{
  await page.addInitScript(()=>{const Original=window.Worker;let fail=true;window.Worker=class extends Original{constructor(url:string|URL,options?:WorkerOptions){if(fail){fail=false;throw new Error('Learning engine unavailable');}super(url,options);}};});
  await page.goto('/#lab');await page.getByRole('button',{name:'Enter the playground'}).click();await expect(page.getByRole('alert')).toContainText('Learning engine unavailable');
  await page.screenshot({path:'docs/review/worker-error.png',fullPage:true});
  await page.getByRole('button',{name:'Retry experiment'}).click();await expect(page.getByRole('button',{name:'Train agent'})).toBeEnabled();
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About'}).click();await expect(page).toHaveURL(/#about/);
});

test('canvas unavailable gives a readable fallback',async({page})=>{
  await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=(()=>null) as typeof HTMLCanvasElement.prototype.getContext;});
  await page.goto('/#lab');await page.getByRole('button',{name:'Enter the playground'}).click();await expect(page.getByRole('alert')).toContainText('Canvas rendering is unavailable');await expect(page.getByRole('button',{name:'Retry experiment'})).toBeVisible();
  await page.getByRole('button',{name:'Close experiment'}).click();await expect(page.getByRole('button',{name:'Enter the playground'})).toBeVisible();
});

test('failed module download offers reload recovery',async({page})=>{
  await page.route('**/assets/Playable-*.js',r=>r.abort());await page.goto('/#lab');await page.getByRole('button',{name:'Enter the playground'}).click();await expect(page.getByRole('alert')).toContainText('could not load');
  await page.unroute('**/assets/Playable-*.js');await page.getByRole('button',{name:'Reload to retry'}).click();await page.waitForLoadState();await page.getByRole('button',{name:'Enter the playground'}).click();await expect(page.getByRole('button',{name:'Train agent'})).toBeEnabled();
});

test('local fonts, visible interaction states, and loading presentation',async({page})=>{
  const remote:string[]=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173'))remote.push(r.url());});
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);expect(remote).toEqual([]);
  const button=page.getByRole('link',{name:'Explore my work'});await button.hover();await page.screenshot({path:'docs/review/hero-hover.png'});await button.focus();await page.screenshot({path:'docs/review/hero-focus.png'});
  const box=await button.boundingBox();if(!box)throw new Error('Missing button');await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.screenshot({path:'docs/review/hero-pressed.png'});await page.mouse.up();
  await page.route('**/assets/Playable-*.js',async r=>{await new Promise(resolve=>setTimeout(resolve,1000));await r.continue();});
  await page.getByRole('button',{name:'Enter the playground'}).click();await expect(page.getByRole('button',{name:'Loading experiment…'})).toBeVisible();await page.screenshot({path:'docs/review/loading.png',fullPage:true});await expect(page.getByRole('button',{name:'Train agent'})).toBeEnabled();
});

test('font fallback keeps the first screen readable',async({page})=>{
  await page.route('**/*.woff2',r=>r.abort());await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page.getByRole('link',{name:'Explore my work'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
