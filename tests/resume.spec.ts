import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('manual sparse résumé preserves exact facts through navigation and editing',async({page})=>{
 await page.goto('/resume/edit');await page.getByLabel('Name',{exact:true}).fill('Élodie Sample');
 await page.getByRole('button',{name:'Education',exact:true}).click();await page.getByRole('button',{name:'Add education',exact:true}).click();await page.getByLabel('Education or credential',{exact:true}).fill('GED');
 await page.getByRole('button',{name:'Experience',exact:true}).click();await page.getByRole('button',{name:'Add experience',exact:true}).click();await page.getByLabel('Role or work',{exact:true}).fill('Housekeeping');await page.getByRole('button',{name:'Add task',exact:true}).click();await page.getByLabel('Task 1',{exact:true}).fill('Cleaned rooms and changed linens.');
 await page.getByLabel('Start date year').fill('2020');await page.getByLabel('Start date year').press('Tab');
 await page.getByRole('button',{name:'Preview résumé',exact:true}).click();const preview=page.getByRole('complementary',{name:'Résumé preview'});await expect(preview).toContainText('Élodie Sample');await expect(preview).toContainText('GED');await expect(preview).toContainText('2020');await expect(preview).not.toContainText('January');await expect(preview).not.toContainText('certified');
 await preview.getByRole('button',{name:'Edit Experience',exact:true}).click();await expect(page.getByLabel('Role or work',{exact:true})).toBeFocused();
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Documents'}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'My résumé'}).click();await page.getByRole('link',{name:'Go straight to my résumé'}).click();await expect(page.getByLabel('Name',{exact:true})).toHaveValue('Élodie Sample');
 expect(await page.evaluate(()=>localStorage.length+sessionStorage.length)).toBe(0);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('discovery notes are optional and never enter the résumé automatically',async({page})=>{
 await page.goto('/resume/experience');await page.getByRole('button',{name:'Add an experience note'}).click();await page.getByLabel('Experience note 1').fill('Private synthetic task note');await page.getByRole('link',{name:'Continue to my résumé'}).click();await page.getByRole('button',{name:'Preview résumé',exact:true}).click();await expect(page.getByRole('complementary')).not.toContainText('Private synthetic task note');
});
