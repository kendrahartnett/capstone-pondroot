import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('manual résumé keeps exact facts and has one clear review route',async({page})=>{
 await page.goto('/resume/edit');await page.getByLabel('Name',{exact:true}).fill('Élodie Sample');
 await page.getByRole('button',{name:'Education',exact:true}).click();await page.getByRole('button',{name:'Add education',exact:true}).click();await page.getByLabel('Education or credential',{exact:true}).fill('GED');
 await page.getByRole('button',{name:'Experience',exact:true}).click();await page.getByRole('button',{name:'Add experience',exact:true}).click();await page.getByLabel('Role or work',{exact:true}).fill('Housekeeping');await page.getByRole('button',{name:'Add task',exact:true}).click();await page.getByLabel('Task 1',{exact:true}).fill('Cleaned rooms and changed linens.');
 await page.getByLabel('Start date year').fill('2020');await page.getByLabel('Start date year').press('Tab');
 await expect(page.getByRole('link',{name:'Review my résumé'})).toHaveCount(1);await page.getByRole('link',{name:'Review my résumé'}).click();
 const preview=page.getByRole('complementary',{name:'Résumé preview'});await expect(preview).toContainText('Élodie Sample');await expect(preview).toContainText('GED');await expect(preview).toContainText('2020');await expect(preview).not.toContainText('January');await expect(preview).not.toContainText('certified');
 await expect(page.getByRole('button',{name:'Download PDF'})).toBeVisible();await expect(page.getByRole('button',{name:'Print résumé'})).toBeVisible();await expect(page.getByRole('button',{name:'Prepare PDF'})).toHaveCount(0);
 await page.getByRole('link',{name:'Edit résumé'}).click();await page.getByRole('button',{name:'Experience',exact:true}).click();await expect(page.getByLabel('Role or work',{exact:true})).toHaveValue('Housekeeping');
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Documents'}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'My résumé'}).click();await page.getByRole('link',{name:'Write it myself'}).click();await expect(page.getByLabel('Name',{exact:true})).toHaveValue('Élodie Sample');
 expect(await page.evaluate(()=>localStorage.length+sessionStorage.length)).toBe(0);expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('story notes stay out of résumé until chosen',async({page})=>{
 await page.goto('/resume/experience');await expect(page.getByRole('button',{name:'Add to my story'})).toBeDisabled();
 await page.getByLabel('Something I did').fill('Private synthetic task note');await page.getByRole('button',{name:'Add to my story'}).click();
 await page.getByRole('button',{name:'Edit 1'}).click();await page.getByLabel('Edit example 1').fill('Updated synthetic task note');await page.getByRole('button',{name:'Save change'}).click();
 await page.getByRole('link',{name:'Continue to my résumé'}).click();await page.getByRole('link',{name:'Review my résumé'}).click();await expect(page.getByRole('complementary')).not.toContainText('Updated synthetic task note');
});
