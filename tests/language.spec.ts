import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Spanish supports story, editor, review, print and download',async({page})=>{
 await page.route('**/api/impact',route=>route.fulfill({json:{enabled:true,privacyEmail:'privacidad@example.test'}}));
 await page.goto('/');await page.getByRole('button',{name:'Español'}).click();await expect(page.locator('html')).toHaveAttribute('lang','es');
 await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Mi currículum'}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('Vamos a crear tu currículum');
 await page.getByRole('link',{name:'Cuéntame sobre ti'}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('Cuéntame qué has hecho');
 await page.getByLabel('Algo que hice').fill('Organicé suministros de limpieza.');await page.getByRole('button',{name:'Agregar a mi historia'}).click();await expect(page.getByRole('heading',{name:'Tu historia hasta ahora'})).toBeVisible();
 await page.getByRole('button',{name:'Crear mi currículum con IA'}).click();await expect(page.getByText('La ayuda de IA aún no está disponible.')).toBeVisible();await page.getByRole('button',{name:'Cancelar'}).click();
 await Promise.all([page.waitForURL(/\/documents$/),page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Documentos'}).click()]);await expect(page.getByRole('heading',{level:1})).toHaveText('Revisa tus opciones de documentos');
 await Promise.all([page.waitForURL(/\/learn$/),page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Contratación'}).click()]);await expect(page.getByRole('heading',{level:1})).toHaveText('Prepárate para solicitar empleo');
 await Promise.all([page.waitForURL(/\/resume\/start$/),page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Mi currículum'}).click()]);await page.getByRole('link',{name:'Escribirlo por mi cuenta'}).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText('Crea tu currículum');
 await page.getByLabel('Nombre',{exact:true}).fill('Persona Sintética');await page.getByRole('button',{name:'Experiencia',exact:true}).click();await page.getByRole('button',{name:'Agregar experiencia'}).click();await page.getByLabel('Puesto o trabajo',{exact:true}).fill('Limpieza');
 await page.getByRole('link',{name:'Revisar mi currículum'}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('Revisa tu currículum');await expect(page.getByRole('button',{name:'Imprimir currículum'})).toBeVisible();
 await page.getByRole('button',{name:'Descargar PDF'}).click();await expect(page.getByRole('heading',{name:'Descarga tu currículum'})).toBeVisible({timeout:30000});await expect(page.getByLabel('Correo electrónico para esta descarga')).toBeFocused();await page.getByRole('button',{name:'Cancelar'}).click();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'English'}).click();await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page.getByRole('heading',{level:1})).toHaveText('Review your résumé');
});
