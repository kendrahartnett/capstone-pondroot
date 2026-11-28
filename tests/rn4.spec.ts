import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('hiring guide offers independent written actions without a résumé gate',async({page})=>{
 await page.goto('/learn');
 await expect(page.getByRole('heading',{name:'Get ready to apply'})).toBeVisible();
 await expect(page.getByRole('link',{name:'Return to my résumé'})).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'See how it works'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Watch video'})).toHaveCount(3);
 await expect(page.locator('iframe')).toHaveCount(0);
 await page.getByRole('button',{name:'Watch video'}).first().click();
 await expect(page.locator('iframe')).toHaveCount(1);
 await expect(page.locator('iframe')).toHaveAttribute('src',/youtube-nocookie.com\/embed\/qy-jM7HFXdU/);
 await page.getByRole('button',{name:'Close video'}).click();
 await expect(page.locator('iframe')).toHaveCount(0);
 await expect(page.getByText('Attaching a file does not submit the application.')).toBeVisible();
 await page.locator('#hiring summary').filter({hasText:'What is an ATS?'}).click();
 await expect(page.getByText('No résumé guarantees a score, interview, or job.',{exact:false})).toBeVisible();
 await page.getByText('Tell me about work you have done').click();
 await expect(page.getByText('Name a real task, how you did it')).toBeVisible();
 await expect(page.getByRole('link',{name:'Edit my résumé'})).toHaveAttribute('href','/resume/edit');
 await page.getByText('Could this job offer be a scam?').click();
 await expect(page.getByRole('link',{name:/FTC job scam guide/})).toHaveAttribute('rel','noopener noreferrer');
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('document guide keeps A or B plus C distinct and stores no answer',async({page})=>{
 await page.goto('/documents');
 await expect(page.getByRole('link',{name:'Continue my résumé'}).first()).toHaveAttribute('href','/resume/edit');
 await page.getByLabel('I may have a List B option').check();
 await expect(page.getByRole('status')).toContainText('It needs an acceptable List C choice too');
 await page.getByLabel('I may have a List A option').check();
 await expect(page.getByRole('status')).toContainText('generally covers both parts');
 expect(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length}))).toEqual({local:0,session:0});
 await page.reload();
 await expect(page.getByLabel('I am not sure')).toBeChecked();
 await page.getByLabel('I am not sure').focus();
 await page.keyboard.press('ArrowDown');
 await expect(page.getByLabel('I may have a List A option')).toBeChecked();
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
});

test('Spanish guide and document options remain usable',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Español'}).click();
 await page.getByRole('link',{name:'Ver ayuda con documentos'}).click();
 await expect(page.getByRole('heading',{name:'Revisa tus opciones de documentos'})).toBeVisible();
 await page.getByLabel('Tal vez tenga una opción de la Lista B').check();
 await expect(page.getByRole('status')).toContainText('Lista C');
 await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Contratación'}).click();
 await expect(page.getByRole('heading',{name:'Prepárate para solicitar empleo'})).toBeVisible();
 await expect(page.getByRole('link',{name:'Editar mi currículum'})).toBeVisible();
});
