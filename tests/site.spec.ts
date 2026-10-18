import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('personal introduction, navigation, contacts, and resume', async ({page,request})=>{
  await page.goto('/');
  await expect(page).toHaveTitle(/Suraj Jena/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Suraj Jena');
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Experience'}).click();
  await expect(page).toHaveURL(/#experience/);
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'About'}).click();
  await page.goBack();await expect(page).toHaveURL(/#experience/);
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'ML lab'})).toHaveCount(0);
  await expect(page.locator('#lab')).toHaveCount(0);
  await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Lab'})).toHaveAttribute('href','./lab/');
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

test('local fonts, visible interaction states, and loading presentation',async({page})=>{
  const remote:string[]=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173'))remote.push(r.url());});
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);expect(remote).toEqual([]);
  const button=page.getByRole('link',{name:'Explore my work'});await button.hover();await page.screenshot({path:'docs/review/hero-hover.png'});await button.focus();await page.screenshot({path:'docs/review/hero-focus.png'});
  const box=await button.boundingBox();if(!box)throw new Error('Missing button');await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.screenshot({path:'docs/review/hero-pressed.png'});await page.mouse.up();
});

test('font fallback keeps the first screen readable',async({page})=>{
  await page.route('**/*.woff2',r=>r.abort());await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page.getByRole('link',{name:'Explore my work'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('experience lists separate engineering roles and earlier work',async({page})=>{
  await page.goto('/#experience');
  const rows=page.locator('.experience-row');await expect(rows).toHaveCount(7);
  for(const role of ['Software Engineer 3','Software Engineer 2','Software Engineer 1','Machine Learning Engineer','Software Developer','Software Developer Intern','Research Intern']){
    await expect(page.locator('.role').getByText(role,{exact:true})).toHaveCount(1);
  }
  await expect(rows.filter({hasText:'Research Intern'})).toContainText('Seceon Inc.');
  await expect(rows.filter({hasText:'Software Developer Intern'})).toContainText('Persistent Systems');
  await expect(rows.filter({hasText:'Software Engineer 2'})).toContainText('Aug 2023 — Mar 2025');
  await expect(rows.filter({hasText:'Software Engineer 1'})).toContainText('Sep 2021 — Aug 2023');
  const research=rows.filter({hasText:'Research Intern'});await research.locator('summary').click();await expect(research).toContainText('Prasant Mohapatra');
});

test('experience company logos load locally alongside visible names',async({page})=>{
  await page.goto('/#experience');
  const logos=page.locator('.company-logo');await expect(logos).toHaveCount(7);
  for(const image of await logos.all()){
    await image.scrollIntoViewIfNeeded();await expect(image).toHaveJSProperty('complete',true);
    expect(await image.evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThan(0);
    await expect(image).toHaveAttribute('alt','');
  }
  const records=await page.locator('.company-name').evaluateAll(es=>es.map(e=>({name:e.textContent?.trim(),src:e.querySelector('img')?.getAttribute('src')})));
  for(const [company,file] of [['Comcast','comcast.svg'],['Wells Fargo · Persistent Systems','wells-fargo.svg'],['Persistent Systems','persistent.svg'],['Seceon Inc.','seceon.webp']]){
    expect(records.some(r=>r.name===company&&r.src?.endsWith(file))).toBe(true);
  }
  await page.locator('.experience-row').filter({hasText:'Research Intern'}).screenshot({path:'docs/review/seceon-logo.png'});
});
