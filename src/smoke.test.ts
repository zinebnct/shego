/**
 * Test de fumée des imports : chaque écran (`app/`) et chaque module de `src/` se charge sans erreur — routes
 * résolues, dépendances présentes, variables d'environnement valides, aucun cycle fatal à l'import.
 * (Complète `tsc` : ici le code est réellement évalué par Jest.)
 */
/* eslint-disable @typescript-eslint/no-require-imports -- l'évaluation synchrone par require() est le but du test */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(__dirname, '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const modules = [...walk(join(root, 'app')), ...walk(join(root, 'src'))]
  .filter((f) => /\.tsx?$/.test(f) && !/\.(test|d)\.tsx?$/.test(f))
  // moduleNameMapper ne couvre pas les fichiers de types purs générés
  .map((f) => relative(root, f))
  .sort();

describe('imports', () => {
  it('trouve les modules à charger', () => {
    expect(modules.length).toBeGreaterThan(60);
  });

  it.each(modules)('%s se charge', (file) => {
    jest.isolateModules(() => {
      expect(() => require(join(root, file))).not.toThrow();
    });
  });

  it('les écrans exportent un composant par défaut', () => {
    const screens = modules.filter((f) => f.startsWith('app/') && !f.endsWith('_layout.tsx'));
    for (const file of screens) {
      jest.isolateModules(() => {
        const mod = require(join(root, file)) as { default?: unknown };
        expect(typeof mod.default).toBe('function');
      });
    }
  });
});
