import { TestBed } from '@angular/core/testing';
import type { VarianteStock } from '@rockstar/contracts';

import { EntornoDePrueba, configurarEntorno } from '../../testing/entorno';
import { BuscadorVarianteComponent } from './buscador-variante.component';

describe('BuscadorVarianteComponent', () => {
  let entorno: EntornoDePrueba;
  let buscador: BuscadorVarianteComponent;
  let seleccionadas: VarianteStock[];
  let elemento: HTMLElement;

  beforeEach(async () => {
    entorno = configurarEntorno();
    await entorno.iniciarSesion();
    const fixture = TestBed.createComponent(BuscadorVarianteComponent);
    fixture.detectChanges();
    buscador = fixture.componentInstance;
    elemento = fixture.nativeElement;
    seleccionadas = [];
    buscador.seleccionada.subscribe((variante) => seleccionadas.push(variante));
  });

  it('selecciona la variante del código escaneado', async () => {
    entorno.escaner.resultado = { estado: 'leido', codigo: '7800000000003' };

    await buscador.escanear();

    expect(seleccionadas.map((v) => v.sku)).toEqual(['RS-0003']);
    expect(buscador.aviso()).toBeNull();
  });

  it('avisa que el código no está registrado y no selecciona nada', async () => {
    entorno.escaner.resultado = { estado: 'leido', codigo: '0000000000000' };

    await buscador.escanear();

    expect(seleccionadas).toEqual([]);
    expect(buscador.aviso()).toBe('El código 0000000000000 no está registrado.');
  });

  it('no hace nada cuando el escaneo se cancela', async () => {
    entorno.escaner.resultado = { estado: 'cancelado' };

    await buscador.escanear();

    expect(seleccionadas).toEqual([]);
    expect(buscador.aviso()).toBeNull();
  });

  it('explica por qué no hay escáner y mantiene la búsqueda manual', async () => {
    entorno.escaner.resultado = { estado: 'no-disponible', motivo: 'El escáner necesita permiso para usar la cámara.' };

    await buscador.escanear();

    expect(buscador.aviso()).toContain('permiso');
    expect(elemento.querySelector('ion-searchbar')).not.toBeNull();
  });

  it('busca por nombre o SKU', async () => {
    await buscador.buscar('rs-0004');
    expect(buscador['resultados']().map((v) => v.producto)).toEqual(['Jeans Rasgado']);

    await buscador.buscar('calavera');
    expect(buscador['resultados']().map((v) => v.sku)).toEqual(['RS-0001', 'RS-0002']);
  });

  it('indica cuando la búsqueda no encuentra productos', async () => {
    await buscador.buscar('inexistente');

    expect(buscador['resultados']()).toEqual([]);
    expect(buscador['sinResultados']()).toBe(true);
  });

  it('informa la falla de conexión al buscar', async () => {
    entorno.red.caida = true;

    await buscador.buscar('polera');

    expect(buscador.aviso()).toContain('No hay conexión');
  });
});
