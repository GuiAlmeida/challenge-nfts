import desktop from 'lighthouse/core/config/desktop-config.js'

/** Perfil desktop oficial do Lighthouse (sem throttling de CPU, 1350x940). */
export default {
  ...desktop,
  settings: {
    ...desktop.settings,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
}
