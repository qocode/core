import Fastify from 'fastify'
import FastifyStatic from 'fastify-static'
import { resolve } from 'path'

const fastify = Fastify({ logger: true })


fastify
  .register(FastifyStatic, { root: resolve('build'), prefix: '/build/' })
  .get('/', (req, reply) => reply.sendFile('webtest.html', resolve('webtest')))
  .get('/webtest.js', (req, reply) => reply.sendFile('webtest.js', resolve('webtest')))
  .listen(3000, (err, address) => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
  })
