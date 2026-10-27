/** Perfil mobile padrão do Lighthouse (Moto G Power, 4G lento, CPU 4x). */
export default {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'mobile',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
}
