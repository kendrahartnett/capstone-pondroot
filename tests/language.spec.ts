import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Spanish covers every current page and the complete résumé file journey',async({page})=>{
 await page.route('**/api/impact',route=>route.fulfill({json:{enabled:true,privacyEmail:'privacidad@example.test'}}));
 await page.goto('/');
 await page.getByRole('button',{name:'Español'}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','es');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Tu experiencia cuenta.');

 await Promise.all([page.waitForURL(/\/resume\/start$/),page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Mi currículum'}).click()]);
 await expect(page.getByRole('heading',{level:1})).toHaveText('Empieza con tus habilidades');
 await Promise.all([page.waitForURL(/\/resume\/experience$/),page.getByRole('link',{name:'Explorar mi experiencia'}).click()]);
 await expect(page.getByRole('heading',{level:1})).toHaveText('Cuéntanos algo que hiciste');
 await expect(page.getByRole('button',{name:'Confirmar este ejemplo'})).toBeDisabled();
 await page.getByLabel('Algo que hice').fill('Organicé suministros de limpieza.');
 await page.getByRole('button',{name:'Confirmar este ejemplo'}).click();
 await expect(page.getByRole('heading',{name:'Mis ejemplos confirmados'})).toBeVisible();
 await expect(page.getByRole('listitem')).toContainText('Organicé suministros de limpieza.');

 await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Documentos'}).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText('Revisa tus documentos');
 await expect(page.getByText('Esta herramienta aún no está disponible.',{exact:false})).toBeVisible();
 await Promise.all([page.waitForURL(/\/learn$/),page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Contratación'}).click()]);
 await expect(page.getByRole('heading',{level:1})).toHaveText('Información clara sobre contratación');

 await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Mi currículum'}).click();
 await page.getByRole('link',{name:'Ir directo a mi currículum'}).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText('Crea tu currículum');
 await expect(page).toHaveTitle('Crea tu currículum | Pondroot');
 await page.getByLabel('Nombre',{exact:true}).fill('Persona Sintética');
 await page.getByRole('button',{name:'Experiencia',exact:true}).click();
 await page.getByRole('button',{name:'Agregar experiencia'}).click();
 await expect(page.getByLabel('Puesto o trabajo',{exact:true})).toBeVisible();
 await page.getByLabel('Puesto o trabajo',{exact:true}).fill('Limpieza');
 await page.getByRole('button',{name:'Vista previa',exact:true}).click();
 await expect(page.getByRole('link',{name:'Revisar, imprimir o descargar'})).toBeVisible();
 await expect(page.getByRole('complementary',{name:'Vista previa del currículum'})).toContainText('Experiencia');
 await page.getByRole('link',{name:'Revisar, imprimir o descargar'}).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText('Revisa tu currículum');
 await expect(page.getByRole('link',{name:'Ir a las opciones de impresión y descarga'})).toBeVisible();
 await page.getByRole('button',{name:'He revisado este currículum'}).click();
 await expect(page.getByRole('button',{name:'Imprimir currículum'})).toBeEnabled();
 await page.getByRole('button',{name:'Preparar PDF'}).click();
 await expect(page.getByRole('button',{name:'Descargar PDF'})).toBeEnabled({timeout:30000});
 await page.getByRole('button',{name:'English'}).click();
 await expect(page.getByRole('button',{name:'Download PDF'})).toBeDisabled();
 await page.getByRole('button',{name:'Español'}).click();
 await page.getByRole('button',{name:'Preparar PDF'}).click();
 await expect(page.getByRole('button',{name:'Descargar PDF'})).toBeEnabled({timeout:30000});
 await page.getByRole('button',{name:'Descargar PDF'}).click();
 await expect(page.getByRole('heading',{name:'Descarga tu currículum'})).toBeVisible();
 await expect(page.getByLabel('Correo electrónico para esta descarga')).toBeFocused();
 await page.getByRole('button',{name:'Cancelar'}).click();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);

 await page.getByRole('button',{name:'English'}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Review your résumé');
});
