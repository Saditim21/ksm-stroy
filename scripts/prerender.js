import Prerenderer from '@prerenderer/prerenderer'
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(__dirname, '../dist')

const routes = ['/', '/about', '/projects', '/blog', '/contact']

async function prerender() {
  console.log('Starting prerender...')
  console.log('Dist path:', distPath)
  console.log('Routes to prerender:', routes)

  const prerenderer = new Prerenderer({
    staticDir: distPath,
    renderer: new PuppeteerRenderer({
      renderAfterDocumentEvent: 'render-event',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // Wait for network to be idle (all lazy loads complete)
      waitForNetworkIdle: true,
      // Additional timeout for complex pages
      timeout: 30000
    })
  })

  try {
    await prerenderer.initialize()
    const renderedRoutes = await prerenderer.renderRoutes(routes)

    for (const route of renderedRoutes) {
      const outputPath = path.join(distPath, route.route === '/' ? 'index.html' : `${route.route}/index.html`)
      const outputDir = path.dirname(outputPath)

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Add data-prerendered attribute
      const html = route.html.replace('<html', '<html data-prerendered="true"')
      fs.writeFileSync(outputPath, html)
      console.log(`Prerendered: ${route.route} -> ${outputPath}`)
    }

    console.log('Prerendering complete!')
  } catch (error) {
    console.error('Prerender error:', error)
    process.exit(1)
  } finally {
    await prerenderer.destroy()
  }
}

prerender()
