import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('independent destinations and direct writing route return home',async({page})=>{
 await page.goto('/');
 for(const path of ['/resume/start','/resume/edit','/documents','/learn']){
  await page.locator(`main a[href="${path}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(path+'$'));
  if(path==='/documents'||path==='/learn') await expect(page.getByText('This tool is not available yet.',{exact:false})).toBeVisible();
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Home'}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Your experience matters.');
 }
 expect(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length}))).toEqual({local:0,session:0});
});
test('accessible home, keyboard skip and responsive surfaces',async({page})=>{
 await page.goto('/');
 await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Skip to main content'})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.getByRole('main')).toBeFocused();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByText('Will my work be saved?',{exact:true}).click();
 await expect(page.getByText('Your work stays in this tab. Closing or refreshing it can lose your work. Use Save editable draft in the résumé tools.')).toBeVisible();
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
